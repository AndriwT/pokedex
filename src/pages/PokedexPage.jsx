import { useState } from "react";
import axios from "axios";

const PokedexPage = () => {
  const [pokemon, setPokemon] = useState();
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
    const options = {
      url: `https://pokeapi.co/api/v2/pokemon/${name}`,
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json;charset=UTF-8",
      },
    };
    await axios(options)
      .then((response) => {
        setPokemon(response.data);
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
  };

  return (
    <div>
      <h1>Pokedex</h1>
      <form>
        <input type="text" onChange={(event) => handleChange(event)} />
        <button onClick={(event) => handleClick(event)}>Search</button>
      </form>
      <div className="pokedex">
        <div className="left-container">
          <div className="left-above-screen"></div>
          <div className="left-screen-container">
            <div className="left-screen">
              <img src={pokemon && pokemon.sprites.front_default} />
            </div>
          </div>
          <p>Hello</p>
        </div>
        <div className="right-container">
          <div className="right-above-screen"></div>
          <div className="right-screen">
            <h1 className="capitalize-me">{pokemon && pokemon.name}</h1>
          </div>
          <p>World</p>
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
