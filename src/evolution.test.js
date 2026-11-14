import { buildView, chainIncludes, walkChain } from "./evolution";

const species = (name) => ({ name });

const level = (minLevel, extra = {}) => ({
  trigger: species("level-up"),
  min_level: minLevel,
  is_default: true,
  ...extra,
});

const item = (name, extra = {}) => ({
  trigger: species("use-item"),
  item: species(name),
  is_default: true,
  ...extra,
});

const chainWith = (root, evolvesTo) => ({
  species: species(root),
  evolves_to: evolvesTo,
});

const child = (name, details, evolvesTo = []) => ({
  species: species(name),
  evolution_details: details,
  evolves_to: evolvesTo,
});

describe("evolution branches", () => {
  const charmander = chainWith("charmander", [
    child("charmeleon", [level(16)], [child("charizard", [level(36)])]),
  ]);

  test("walks a straight line and shows the method that produced a final stage", () => {
    const links = walkChain(charmander);

    expect(buildView(links, "charmander")).toEqual({
      previousName: "",
      pages: [{ name: "charmeleon", method: "Lv. 16" }],
    });
    expect(buildView(links, "charmeleon")).toEqual({
      previousName: "charmander",
      pages: [{ name: "charizard", method: "Lv. 36" }],
    });
    expect(buildView(links, "charizard")).toEqual({
      previousName: "charmeleon",
      pages: [{ name: "", method: "Lv. 36" }],
    });
  });

  test("pages every branch and keeps distinct methods on the same species", () => {
    const eevee = chainWith("eevee", [
      child("vaporeon", [item("water-stone")]),
      child("leafeon", [
        {
          trigger: species("level-up"),
          location: species("eterna-forest"),
          near_special_rock: true,
        },
        {
          trigger: species("level-up"),
          location: species("pinwheel-forest"),
          near_special_rock: true,
        },
        item("leaf-stone"),
      ]),
    ]);
    const view = buildView(walkChain(eevee), "eevee");

    expect(view.pages.map((page) => page.name)).toEqual([
      "vaporeon",
      "leafeon",
      "leafeon",
    ]);
    expect(view.pages.map((page) => page.method)).toEqual([
      "Water Stone",
      "Leaf Stone",
      "Near a special rock",
    ]);
  });

  test("describes tyrogue's stat split and rockruff's times as separate pages", () => {
    const tyrogue = chainWith("tyrogue", [
      child("hitmonlee", [level(20, { relative_physical_stats: 1 })]),
      child("hitmonchan", [level(20, { relative_physical_stats: -1 })]),
      child("hitmontop", [level(20, { relative_physical_stats: 0 })]),
    ]);
    expect(buildView(walkChain(tyrogue), "tyrogue").pages).toEqual([
      { name: "hitmonlee", method: "Lv. 20, Atk > Def" },
      { name: "hitmonchan", method: "Lv. 20, Atk < Def" },
      { name: "hitmontop", method: "Lv. 20, Atk = Def" },
    ]);

    const rockruff = chainWith("rockruff", [
      child("lycanroc", [
        level(25, { time_of_day: "day" }),
        level(25, { time_of_day: "night" }),
        level(25, { time_of_day: "dusk", required_pokemon_form: "rockruff-own-tempo" }),
      ]),
    ]);
    expect(buildView(walkChain(rockruff), "rockruff").pages).toEqual([
      { name: "lycanroc", method: "Lv. 25, Day" },
      { name: "lycanroc", method: "Lv. 25, Night" },
      { name: "lycanroc", method: "Lv. 25, Dusk" },
    ]);
  });

  test("collapses version copies and form variants that share one method", () => {
    const feebas = chainWith("feebas", [
      child("milotic", [
        { trigger: species("level-up"), min_beauty: 170 },
        {
          trigger: species("trade"),
          held_item: species("prism-scale"),
          is_default: true,
        },
        { trigger: species("level-up"), min_beauty: 170 },
      ]),
    ]);
    const feebasView = buildView(walkChain(feebas), "feebas");
    expect(feebasView.pages).toEqual([
      { name: "milotic", method: "Trade, Prism Scale" },
      { name: "milotic", method: "Beauty" },
    ]);
    expect(buildView(walkChain(feebas), "milotic").pages).toEqual([
      { name: "", method: "Trade, Prism Scale" },
      { name: "", method: "Beauty" },
    ]);

    const magneton = chainWith("magnemite", [
      child("magneton", [level(30)], [
        child("magnezone", [
          { trigger: species("level-up"), location: species("mt-coronet") },
          { trigger: species("level-up"), location: species("chargestone-cave") },
          item("thunder-stone"),
        ]),
      ]),
    ]);
    expect(buildView(walkChain(magneton), "magneton").pages).toEqual([
      { name: "magnezone", method: "Thunder Stone" },
      { name: "magnezone", method: "Special location" },
    ]);

    const wurmple = chainWith("wurmple", [
      child("silcoon", [level(7, { condition_expression: { a: 1 } }), level(7)]),
      child("cascoon", [level(7, { condition_expression: { a: 2 } })]),
    ]);
    expect(buildView(walkChain(wurmple), "wurmple").pages).toEqual([
      { name: "silcoon", method: "Lv. 7" },
      { name: "cascoon", method: "Lv. 7" },
    ]);

    const burmy = chainWith("burmy", [
      child("wormadam", [
        level(20, {
          gender: 1,
          required_pokemon_form: species("burmy-plant"),
          evolved_pokemon_form: "wormadam-plant",
        }),
        level(20, {
          gender: 1,
          required_pokemon_form: species("burmy-sandy"),
          evolved_pokemon_form: "wormadam-sandy",
        }),
        level(20, {
          gender: 1,
          required_pokemon_form: species("burmy-trash"),
          evolved_pokemon_form: "wormadam-trash",
        }),
      ]),
      child("mothim", [level(20, { gender: 2 })]),
    ]);
    expect(buildView(walkChain(burmy), "burmy").pages).toEqual([
      { name: "wormadam", method: "Lv. 20, Female" },
      { name: "mothim", method: "Lv. 20, Male" },
    ]);
  });

  test("keeps unusual triggers and a regional method on their own page", () => {
    const oddities = chainWith("base", [
      child("shedinja", [{ trigger: species("shed"), is_default: true }]),
      child("raichu", [
        item("thunder-stone"),
        item("thunder-stone", { region: species("alola") }),
      ]),
      child("malamar", [level(30, { turn_upside_down: true })]),
      child("mantine", [
        { trigger: species("level-up"), party_species: species("remoraid"), is_default: true },
      ]),
      child("accelgor", [
        { trigger: species("trade"), trade_species: species("karrablast"), is_default: true },
      ]),
    ]);
    const mrMime = chainWith("mime-jr", [
      child("mr-mime", [level(null, { known_move: species("mimic") })], [
        child("mr-rime", [
          level(42, { required_pokemon_form: species("mr-mime-galar") }),
        ]),
      ]),
    ]);
    expect(buildView(walkChain(mrMime), "mr-mime").pages).toEqual([
      { name: "mr-rime", method: "Lv. 42, Galarian form" },
    ]);

    expect(buildView(walkChain(oddities), "base").pages.map((page) => page.method)).toEqual([
      "Empty slot, Poké Ball",
      "Thunder Stone",
      "Thunder Stone, Alola",
      "Lv. 30, Hold upside down",
      "With Remoraid",
      "Trade for Karrablast",
    ]);
  });

  test("ignores a chain that does not contain the species on screen", () => {
    const eevee = chainWith("eevee", [child("vaporeon", [item("water-stone")])]);
    expect(chainIncludes(eevee, "eevee")).toBe(true);
    expect(chainIncludes(eevee, "vaporeon")).toBe(true);
    expect(chainIncludes(eevee, "pikachu")).toBe(false);
    expect(buildView(walkChain(eevee), "pikachu").pages).toEqual([]);
  });
});
