import { useState } from "react";
import axios from "axios";

const PokedexPage = () => {
  const [pokemon, setPokemon] = useState();
  const [bio, setBio] = useState("");
  const [search, setSearch] = useState("");

  // const getPokemon = async (name) => {
  //   const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
  //   const res = await fetch(url);
  //   await setPokemon(res.json());
  // };

  // useEffect(
  //   (pokemon) => {
  //     console.log(pokemon);
  //     // getPokemon();
  //   },
  //   [pokemon]
  // );

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
        console.log(response.data);
      })
      .catch((error) => {
        console.log("Error fetching data: ", error);
      });
  };

  const handleChange = (event) => {
    setSearch(event.target.value);
  };

  const handleClick = (event) => {
    event.preventDefault();
    getPokemon(search);
    getBio(search);
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
                <img src={pokemon && pokemon.sprites.front_default} />
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
              {bio && bio.flavor_text_entries[1].flavor_text}
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
                {bio && bio.evolves_from_species
                  ? bio.evolves_from_species.name
                  : null}
              </h3>
            </div>
            <div className="evolves"></div>
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

// <img src={pokemon && pokemon.sprites.front_default} />
//       <p>{pokemon && pokemon.name}</p>
//       <p>{pokemon && pokemon.id}</p>
//       <p>{pokemon && pokemon.types[0].type.name}</p>
//       <p>{pokemon && pokemon.height}</p>
//       <p>{pokemon && pokemon.weight}</p>
