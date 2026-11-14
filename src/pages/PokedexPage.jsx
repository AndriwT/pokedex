import { useMemo, useRef, useState } from "react";
import axios from "axios";
import { buildView, chainIncludes, walkChain } from "../evolution";

const normalizeQuery = (value) => value.trim().toLowerCase().replace(/\s+/g, "-");

const englishFlavorText = (bio) => {
  const entry = bio?.flavor_text_entries?.find(
    (item) => item.language?.name === "en"
  );
  if (!entry?.flavor_text) return "";
  return entry.flavor_text
    .replace(/\u00ad\s*/g, "")
    .replace(/[\f\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const PokedexPage = () => {
  const [search, setSearch] = useState("");
  const [pokemon, setPokemon] = useState();
  const [bio, setBio] = useState();
  const [evolution, setEvolution] = useState();
  const [branchIndex, setBranchIndex] = useState(0);
  const [trackedSpecies, setTrackedSpecies] = useState("");
  const requestRef = useRef(0);

  const speciesName = pokemon?.species?.name || "";
  const description = englishFlavorText(bio);
  const sprite =
    pokemon?.sprites?.front_default ||
    pokemon?.sprites?.other?.["official-artwork"]?.front_default ||
    "";

  if (speciesName !== trackedSpecies) {
    setTrackedSpecies(speciesName);
    setBranchIndex(0);
  }

  const activeChain = chainIncludes(evolution?.chain, speciesName)
    ? evolution.chain
    : null;
  const links = useMemo(() => walkChain(activeChain), [activeChain]);
  const { previousName, pages } = useMemo(
    () => buildView(links, speciesName),
    [links, speciesName]
  );
  const pageIndex = pages.length ? branchIndex % pages.length : 0;
  const currentPage = pages[pageIndex];
  const nextName = currentPage?.name || "";
  const method = currentPage?.method || "";
  const pageLabel = pages.length > 1 ? `${pageIndex + 1}/${pages.length}` : "";
  const statLine = (index) => {
    const stat = pokemon?.stats?.[index];
    if (!stat) return "";
    return `${stat.stat.name}: ${stat.base_stat}`;
  };

  const loadPokemon = async (name) => {
    const query = normalizeQuery(name);
    if (!query) return;

    const requestId = ++requestRef.current;
    setSearch("");

    try {
      const pokemonResponse = await axios.get(
        `https://pokeapi.co/api/v2/pokemon/${encodeURIComponent(query)}`
      );
      if (requestId !== requestRef.current) return;
      const nextPokemon = pokemonResponse.data;
      setPokemon(nextPokemon);

      const speciesResponse = await axios.get(nextPokemon.species.url);
      if (requestId !== requestRef.current) return;
      const nextBio = speciesResponse.data;
      setBio(nextBio);

      if (!nextBio.evolution_chain?.url) {
        setEvolution(undefined);
        return;
      }

      const evolutionResponse = await axios.get(nextBio.evolution_chain.url);
      if (requestId !== requestRef.current) return;
      setEvolution(evolutionResponse.data);
    } catch (error) {
      console.log("Error fetching data: ", error);
    }
  };

  const shiftBranch = (direction) => {
    setBranchIndex((index) => {
      if (pages.length <= 1) return 0;
      return (index + direction + pages.length) % pages.length;
    });
  };

  const handleChange = (event) => {
    setSearch(event.target.value);
  };

  const handleClick = (event) => {
    event.preventDefault();
    loadPokemon(search);
  };

  const resetPokedex = () => {
    requestRef.current += 1;
    setSearch("");
    setPokemon(undefined);
    setBio(undefined);
    setEvolution(undefined);
    setBranchIndex(0);
  };

  const onPadClick = (event, axis) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const position =
      axis === "x"
        ? event.clientX - rect.left
        : event.clientY - rect.top;
    const size = axis === "x" ? rect.width : rect.height;
    shiftBranch(position < size / 2 ? -1 : 1);
  };

  return (
    <div>
      <h1>Pokedex</h1>

      <div className="pokedex">
        {/* // ------------------------------------------- Left side ----------------------------------------------------- */}
        <div className="left-container">
          <div className="left-above-screen">
            <div
              className="light"
              onClick={resetPokedex}
              role="button"
              aria-label="Reset"
            ></div>
            <div className="indicator-lights">
              <div className="indicator red"></div>
              <div className="indicator yellow"></div>
              <div className="indicator green"></div>
            </div>
          </div>
          <div className="left-inner-container">
            <div className="left-screen-container">
              <div style={{ display: "flex" }}>
                <div className="red-dot"></div>
                <div className="red-dot"></div>
              </div>
              <div className="left-screen">
                {sprite ? (
                  <img src={sprite} alt={pokemon.name} />
                ) : null}
              </div>
              <div style={{ display: "flex", marginTop: "20px" }}>
                <div className="search-red-dot"></div>
                <form onSubmit={handleClick}>
                  <input
                    type="text"
                    onChange={(event) => handleChange(event)}
                    value={search}
                    placeholder="name or number..."
                  />
                  <button>Search</button>
                </form>
              </div>
            </div>
            <div
              className="under-left-screen-details-container"
              style={{ marginLeft: 0 }}
            >
              <div className="grey-circle">
                <h2>{pokemon?.id ? `#${pokemon.id}` : ""}</h2>
              </div>
              <div
                className="color-line"
                style={{ backgroundColor: "red", marginRight: "10px" }}
              ></div>
              <div
                className="color-line"
                style={{ backgroundColor: "lightBlue" }}
              ></div>
            </div>
            <div className="under-left-screen-container">
              <div className="trigger-container">
                <h1 className="capitalize-me">{pokemon && pokemon.name} </h1>
              </div>
              <div className="nav-button" style={{ marginLeft: "100px" }}>
                <div className="nav-center-circle"></div>
                <div
                  className="nav-button-vertical"
                  onClick={(event) => onPadClick(event, "y")}
                  style={pages.length > 1 ? { cursor: "pointer" } : undefined}
                ></div>
                <div
                  className="nav-button-horizontal"
                  onClick={(event) => onPadClick(event, "x")}
                  style={pages.length > 1 ? { cursor: "pointer" } : undefined}
                >
                  <div className="border-top"></div>
                  <div className="border-bottom"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* // ------------------------------------------- Left side ----------------------------------------------------- */}
        {/* // ------------------------------------------- Right side ----------------------------------------------------- */}
        <div className="right-container">
          <div className="right-inner-container">
            <div className="right-above-screen"></div>
            <div className={pokemon ? "right-screen is-on" : "right-screen"}>
              <h3 style={{ width: "90%" }}>{description}</h3>
            </div>
            <div className="little-screens capitalize-me">
              <div className="little-screen">{statLine(0)}</div>
              <div className="little-screen">{statLine(1)}</div>
              <div className="little-screen">{statLine(2)}</div>
            </div>
            <div
              className="little-screens capitalize-me"
              style={{ marginTop: 0 }}
            >
              <div className="little-screen">{statLine(3)}</div>
              <div className="little-screen">{statLine(4)}</div>
              <div className="little-screen">{statLine(5)}</div>
            </div>
            <div className="measurements-container">
              <div className="measurement-screen">
                {pokemon ? `Height: ${pokemon.height}` : ""}
              </div>
              <div className="measurement-screen">
                {pokemon ? `Weight: ${pokemon.weight}` : ""}
              </div>

              <div className="shape-container">
                {bio?.shape?.name ? `Shape: ${bio.shape.name}` : ""}
              </div>
            </div>
            <div className="evolution-container">
              <div
                className="evolves"
                onClick={() => previousName && loadPokemon(previousName)}
                style={previousName ? { cursor: "pointer" } : undefined}
              >
                <h3 className="capitalize-me">{previousName}</h3>
              </div>
              <div className="trigger-container">
                {pokemon ? <p>Evolution Level or Trigger:</p> : null}
                <h3>{method}</h3>
                <h3>{pageLabel}</h3>
              </div>
              <div
                className="evolves"
                onClick={() => nextName && loadPokemon(nextName)}
                style={nextName ? { cursor: "pointer" } : undefined}
              >
                <h3 className="capitalize-me">{nextName}</h3>
              </div>
            </div>
            <div className="types-container">
              <div className="type">
                <h3 className="capitalize-me">
                  {pokemon && pokemon.types[0].type.name}
                </h3>
              </div>
              <div className="type">
                <h3 className="capitalize-me">
                  {pokemon && pokemon.types[1]
                    ? pokemon.types[1].type.name
                    : null}
                </h3>
              </div>
            </div>
          </div>
        </div>
        {/* // ------------------------------------------- Right side ----------------------------------------------------- */}
      </div>
    </div>
  );
};

export default PokedexPage;
