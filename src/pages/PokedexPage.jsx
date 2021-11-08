import { useEffect, useState } from "react";
import axios from "axios";

const PokedexPage = () => {
  const [search, setSearch] = useState("");
  const [pokemon, setPokemon] = useState();
  const [bio, setBio] = useState("");
  const [description, setDescription] = useState("");
  const [evolution, setEvolution] = useState();

  useEffect(() => {
    if (bio && bio.flavor_text_entries[1].language.name === "en") {
      setDescription(bio && bio.flavor_text_entries[1].flavor_text);
    } else if (bio && bio.flavor_text_entries[6].language.name === "en") {
      setDescription(bio && bio.flavor_text_entries[6].flavor_text);
    } else if (bio && bio.flavor_text_entries[7].language.name === "en") {
      setDescription(bio && bio.flavor_text_entries[7].flavor_text);
    } else if (bio && bio.flavor_text_entries[8].language.name === "en") {
      setDescription(bio && bio.flavor_text_entries[8].flavor_text);
    } else if (bio && bio.flavor_text_entries[15].language.name === "en") {
      setDescription(bio && bio.flavor_text_entries[15].flavor_text);
    } else if (bio && bio.flavor_text_entries[70].language.name === "en") {
      setDescription(bio && bio.flavor_text_entries[70].flavor_text);
    }
  }, [bio]);

  const getPokemon = async (name) => {
    await axios
      .get(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((response) => {
        setPokemon(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.log("Error fetching data: ", error);
      });
  };

  const getBio = async (name) => {
    await axios
      .get(`https://pokeapi.co/api/v2/pokemon-species/${name}/`)
      .then((response) => {
        setBio(response.data);
        getEvolution(response.data.evolution_chain.url);
        console.log(response.data);
      })
      .catch((error) => {
        console.log("Error fetching data: ", error);
      });
  };

  const getEvolution = async (url) => {
    await axios
      .get(url)
      .then((response) => {
        setEvolution(response.data);
        console.log(response.data);
      })
      .catch((error) => {
        console.log("Error fetching data: ", error);
      });
  };

  const getPokemonNextEvolution = () => {
    // let evolutionChain = evolution && evolution.chain.evolves_to;
    if (evolution && evolution.chain.evolves_to.length !== 0) {
      if (
        evolution.chain.species.name === pokemon.name &&
        evolution.chain.evolves_to.length > 1
      ) {
        return `${evolution.chain.evolves_to[0].species.name}
         or 
         ${evolution.chain.evolves_to[1].species.name}`;
      } else if (
        evolution.chain.species.name === pokemon.name &&
        evolution.chain.evolves_to.length === 1
      ) {
        return evolution.chain.evolves_to[0].species.name;
      } else if (
        evolution.chain.evolves_to[0].species.name === pokemon.name &&
        !evolution.chain.evolves_to[0].evolves_to[1]?.species?.name &&
        evolution.chain.evolves_to[0].evolves_to.length !== 0
      ) {
        return evolution.chain.evolves_to[0].evolves_to[0].species.name;
      } else if (
        evolution.chain.evolves_to[0].species.name === pokemon.name &&
        evolution.chain.evolves_to[0].evolves_to[1]?.species?.name &&
        evolution.chain.evolves_to[0].evolves_to.length !== 0
      ) {
        return `${evolution.chain.evolves_to[0].evolves_to[0].species.name}
        or
        ${evolution.chain.evolves_to[0].evolves_to[1].species.name}`;
      } else {
        return null;
      }
    }
  };

  const getPokemonNextEvolutionDetails = () => {
    // let evolutionChain = evolution && evolution.chain.evolves_to;
    if (evolution && evolution.chain.evolves_to.length !== 0) {
      if (evolution.chain.species.name === pokemon.name) {
        console.log(pokemon);
        const minLevel =
          evolution.chain.evolves_to[0].evolution_details[0]?.min_level;
        const itemName =
          evolution.chain.evolves_to[0].evolution_details[0]?.item?.name;
        const triggerName =
          evolution.chain.evolves_to[0].evolution_details[0]?.trigger?.name;
        return minLevel || itemName || triggerName;
      } else if (
        evolution &&
        evolution.chain.evolves_to[0].evolves_to[0]?.evolution_details[0] &&
        evolution.chain.evolves_to[0].species.name === pokemon.name &&
        evolution.chain.evolves_to[0].evolves_to.length !== 0
      ) {
        const minLevel =
          evolution.chain.evolves_to[0].evolves_to[0].evolution_details[0]
            ?.min_level;
        const itemName =
          evolution.chain.evolves_to[0].evolves_to[0].evolution_details[0]?.item
            ?.name;
        const triggerName =
          evolution.chain.evolves_to[0].evolves_to[0].evolution_details[0]
            ?.trigger?.name;
        return minLevel || itemName || triggerName;
      } else {
        return null;
      }
    }
  };

  // ------------------------------------------GETTING A SECOND EVOLUTION TRIGGER --------------------------------- //

  const getPokemonSecondNextEvolutionDetails = () => {
    // let evolutionChain = evolution && evolution.chain.evolves_to;
    if (evolution && evolution.chain.evolves_to.length !== 0) {
      if (evolution.chain.species.name === pokemon.name) {
        console.log(pokemon);
        const minLevel =
          evolution.chain.evolves_to[1]?.evolution_details[0]?.min_level;
        const itemName =
          evolution.chain.evolves_to[1]?.evolution_details[0]?.item?.name;
        const triggerName =
          evolution.chain.evolves_to[1]?.evolution_details[0]?.trigger?.name;
        return minLevel || itemName || triggerName;
      } else if (
        evolution &&
        evolution.chain.evolves_to[0].evolves_to[1]?.evolution_details[0] &&
        evolution.chain.evolves_to[0].species.name === pokemon.name &&
        evolution.chain.evolves_to[0].evolves_to.length !== 0
      ) {
        const minLevel =
          evolution.chain.evolves_to[0].evolves_to[1].evolution_details[0]
            ?.min_level;
        const itemName =
          evolution.chain.evolves_to[0].evolves_to[1].evolution_details[0]?.item
            ?.name;
        const triggerName =
          evolution.chain.evolves_to[0].evolves_to[1].evolution_details[0]
            ?.trigger?.name;
        return minLevel || itemName || triggerName;
      } else {
        return null;
      }
    }
  };

  // ------------------------------------------GETTING A SECOND EVOLUTION TRIGGER --------------------------------- //

  const handleChange = (event) => {
    setSearch(event.target.value);
  };

  const handleClick = async (event) => {
    event.preventDefault();
    await getPokemon(search);
    await getBio(search);
    setSearch("");
  };

  return (
    <div>
      <h1>Pokedex</h1>

      <div className="pokedex">
        {/* // ------------------------------------------- Left side ----------------------------------------------------- */}
        <div className="left-container">
          <div className="left-above-screen">
            <div className="light"></div>
          </div>
          <div className="left-inner-container">
            <div className="left-screen-container">
              <div style={{ display: "flex" }}>
                <div className="red-dot"></div>
                <div className="red-dot"></div>
              </div>
              <div className="left-screen">
                <img
                  src={pokemon && pokemon.sprites.front_default}
                  atl="Front default image of the Pokemon searched"
                />
              </div>
              <div style={{ display: "flex", marginTop: "20px" }}>
                <div className="search-red-dot"></div>
                <form>
                  <input
                    type="text"
                    onChange={(event) => handleChange(event)}
                    value={search}
                    placeholder="name or number..."
                  />
                  <button onClick={(event) => handleClick(event)}>
                    Search
                  </button>
                </form>
              </div>
            </div>
            <div
              className="under-left-screen-details-container"
              style={{ marginLeft: 0 }}
            >
              <div className="grey-circle">
                <h2>{`#${pokemon && pokemon.id ? pokemon.id : ""}`}</h2>
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
              <div className="trigger-container" style={{ width: "210px" }}>
                <h1 className="capitalize-me">{pokemon && pokemon.name} </h1>
              </div>
              <div class="nav-button" style={{ marginLeft: "100px" }}>
                <div class="nav-center-circle"></div>
                <div class="nav-button-vertical"></div>
                <div class="nav-button-horizontal">
                  <div class="border-top"></div>
                  <div class="border-bottom"></div>
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
            <div className="right-screen">
              <h3 style={{ width: "90%" }}>{description}</h3>
            </div>
            <div className="little-screens capitalize-me">
              <div className="little-screen">
                {`${pokemon && pokemon.stats[0].stat.name}: ${
                  pokemon && pokemon.stats[0].base_stat
                }`}
              </div>
              <div className="little-screen">{`${
                pokemon && pokemon.stats[1].stat.name
              }: ${pokemon && pokemon.stats[1]?.base_stat}`}</div>
              <div className="little-screen">{`${
                pokemon && pokemon.stats[2].stat.name
              }: ${pokemon && pokemon.stats[2].base_stat}`}</div>
            </div>
            <div
              className="little-screens capitalize-me"
              style={{ marginTop: 0 }}
            >
              <div className="little-screen">{`${
                pokemon && pokemon.stats[3].stat.name
              }: ${pokemon && pokemon.stats[3].base_stat}`}</div>
              <div className="little-screen">{`${
                pokemon && pokemon.stats[4].stat.name
              }: ${pokemon && pokemon.stats[4].base_stat}`}</div>
              <div className="little-screen">{`${
                pokemon && pokemon.stats[5].stat.name
              }: ${pokemon && pokemon.stats[5].base_stat}`}</div>
            </div>
            <div className="measurements-container">
              <div className="measurement-screen">{`Height: ${
                pokemon && pokemon.height
              }`}</div>
              <div className="measurement-screen">{`Weight: ${
                pokemon && pokemon.weight
              }`}</div>

              <div className="shape-container">{`Shape: ${
                bio && bio.shape.name
              }`}</div>
            </div>
            <div className="evolution-container">
              <div className="evolves">
                <h3 className="capitalize-me">
                  {bio && bio.evolves_from_species !== null
                    ? bio.evolves_from_species.name
                    : null}
                </h3>
              </div>
              <div className="trigger-container">
                <p>Evolution Level or Trigger:</p>
                <h3>{getPokemonNextEvolutionDetails()}</h3>
                <h3>{getPokemonSecondNextEvolutionDetails()}</h3>
              </div>
              <div className="evolves">
                <h3 className="capitalize-me">{getPokemonNextEvolution()}</h3>
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
