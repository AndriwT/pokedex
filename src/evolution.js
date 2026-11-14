const title = (value) =>
  String(value)
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

const named = (value) => value?.name || "";

const regionWords = {
  galar: "Galarian",
  alola: "Alolan",
  hisui: "Hisuian",
  paldea: "Paldean",
};

const formPhrase = (name) => {
  const regional = String(name).match(/-(galar|alola|hisui|paldea)$/);
  if (regional) return `${regionWords[regional[1]]} form`;
  return title(name);
};

export const formatMethod = (detail) => {
  if (!detail) return "";

  const trigger = named(detail.trigger);
  const parts = [];

  if (detail.min_level != null) parts.push(`Lv. ${detail.min_level}`);
  if (named(detail.item)) parts.push(title(detail.item.name));

  if (trigger === "trade") {
    if (named(detail.held_item)) {
      parts.push(`Trade, ${title(detail.held_item.name)}`);
    } else if (named(detail.trade_species)) {
      parts.push(`Trade for ${title(detail.trade_species.name)}`);
    } else {
      parts.push("Trade");
    }
  } else if (named(detail.held_item)) {
    parts.push(title(detail.held_item.name));
  } else if (named(detail.trade_species)) {
    parts.push(`Trade for ${title(detail.trade_species.name)}`);
  }

  if (detail.min_happiness != null) {
    parts.push(
      detail.time_of_day
        ? `Friendship, ${title(detail.time_of_day)}`
        : "Friendship"
    );
  } else if (detail.time_of_day) {
    parts.push(title(detail.time_of_day));
  }

  if (detail.min_affection != null) parts.push("Affection");
  if (detail.min_beauty != null) parts.push("Beauty");
  if (named(detail.known_move)) parts.push(`Knows ${title(detail.known_move.name)}`);
  if (named(detail.known_move_type)) {
    parts.push(`${title(detail.known_move_type.name)} move`);
  }
  if (detail.gender === 1) parts.push("Female");
  if (detail.gender === 2) parts.push("Male");
  if (detail.relative_physical_stats === 1) parts.push("Atk > Def");
  if (detail.relative_physical_stats === -1) parts.push("Atk < Def");
  if (detail.relative_physical_stats === 0) parts.push("Atk = Def");
  if (named(detail.party_species)) {
    parts.push(`With ${title(detail.party_species.name)}`);
  }
  if (named(detail.party_type)) {
    parts.push(`${title(detail.party_type.name)} in party`);
  }
  if (detail.needs_overworld_rain) parts.push("Rain");
  if (detail.turn_upside_down) parts.push("Hold upside down");
  if (detail.near_special_rock) parts.push("Near a special rock");
  if (trigger === "shed") parts.push("Empty slot, Poké Ball");
  if (named(detail.location) && !detail.near_special_rock && !named(detail.item)) {
    parts.push("Special location");
  }
  if (named(detail.region)) parts.push(title(detail.region.name));

  if (!parts.length && trigger) {
    parts.push(trigger === "level-up" ? "Level up" : title(trigger));
  }

  return parts.join(", ");
};

const methodKey = (detail) =>
  [
    named(detail.trigger),
    named(detail.item),
    named(detail.held_item),
    detail.min_level ?? "",
    detail.min_happiness ?? "",
    detail.min_beauty ?? "",
    detail.min_affection ?? "",
    named(detail.known_move),
    named(detail.known_move_type),
    detail.gender ?? "",
    detail.relative_physical_stats ?? "",
    named(detail.party_species),
    named(detail.party_type),
    named(detail.trade_species),
    detail.time_of_day || "",
    detail.turn_upside_down ? "1" : "",
    detail.needs_overworld_rain ? "1" : "",
    detail.near_special_rock ? "1" : "",
    named(detail.region),
    named(detail.location) && !detail.near_special_rock && !named(detail.item)
      ? "location"
      : "",
  ].join("|");

export const uniqueMethodLabels = (details = [], fromName = "") => {
  const ordered = [...details].sort(
    (a, b) => Number(b.is_default === true) - Number(a.is_default === true)
  );
  const groups = new Map();

  ordered.forEach((detail) => {
    const key = methodKey(detail);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(detail);
  });

  const labels = [];
  groups.forEach((group) => {
    const forms = [
      ...new Set(group.map((detail) => named(detail.required_pokemon_form)).filter(Boolean)),
    ];
    const form =
      forms.length === 1 && forms[0] !== fromName ? formPhrase(forms[0]) : "";
    const label = [formatMethod(group[0]), form].filter(Boolean).join(", ");
    if (label && !labels.includes(label)) labels.push(label);
  });

  return labels;
};

export const walkChain = (chain) => {
  const links = [];

  const visit = (node) => {
    (node?.evolves_to || []).forEach((child) => {
      links.push({
        from: node.species.name,
        to: child.species.name,
        methods: uniqueMethodLabels(child.evolution_details, node.species.name),
      });
      visit(child);
    });
  };

  if (chain) visit(chain);
  return links;
};

export const chainIncludes = (chain, speciesName) => {
  if (!chain || !speciesName) return false;

  const visit = (node) => {
    if (node?.species?.name === speciesName) return true;
    return (node?.evolves_to || []).some(visit);
  };

  return visit(chain);
};

export const buildView = (links, speciesName) => {
  const previous = links.find((link) => link.to === speciesName);
  const nextLinks = links.filter((link) => link.from === speciesName);
  const source = nextLinks.length
    ? nextLinks
    : previous
    ? [{ to: "", methods: previous.methods }]
    : [];

  const pages = source.flatMap((link) => {
    const methods = link.methods.length ? link.methods : [""];
    return methods.map((method) => ({ name: link.to, method }));
  });

  return {
    previousName: previous?.from || "",
    pages,
  };
};
