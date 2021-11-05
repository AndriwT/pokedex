import { useState } from "react";
import axios from "axios";

const PokedexPage = () => {
  const [pokemon, setPokemon] = useState();
  const [bio, setBio] = useState("");
  const [evolution, setEvolution] = useState();
  const [search, setSearch] = useState("");

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
      if (evolution && evolution.chain.species.name === pokemon.name) {
        return evolution.chain.evolves_to[0].species.name;
      } else if (
        evolution &&
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
      if (evolution && evolution.chain.species.name === pokemon.name) {
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
        evolution.chain.evolves_to[0].evolves_to[0].evolution_details[0] &&
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

  const handleChange = (event) => {
    setSearch(event.target.value);
  };

  const handleClick = async (event) => {
    event.preventDefault();
    await getPokemon(search);
    await getBio(search);
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
              <form>
                <input
                  type="text"
                  onChange={(event) => handleChange(event)}
                  value={search}
                />
                <button onClick={(event) => handleClick(event)}>Search</button>
              </form>
            </div>
          </div>
        </div>
        {/* // ------------------------------------------- Left side ----------------------------------------------------- */}
        <div className="right-container">
          <div className="right-above-screen"></div>
          <div className="right-screen">
            <h1 className="capitalize-me">
              {pokemon && pokemon.name} {pokemon && pokemon.id}
            </h1>
            <p style={{ width: "90%" }}>
              {(bio && bio.flavor_text_entries[1]?.flavor_text) ||
                (bio && bio.flavor_text_entries[6]?.flavor_text)}
            </p>
          </div>
          <div className="little-screens">
            <div className="little-screen">
              {`Base Exp: ${pokemon && pokemon.base_experience}`}
            </div>
            <div className="little-screen">{`Height: ${
              pokemon && pokemon.height
            }`}</div>
            <div className="little-screen">{`Weight: ${
              pokemon && pokemon.weight
            }`}</div>

            <div className="little-screen">{`Shape: ${
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
            <div className="">
              <p>Evolves By:</p>
              {/* <span>{getPokemonNextEvolutionDetails()}</span> */}
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
    </div>
  );
};

export default PokedexPage;
