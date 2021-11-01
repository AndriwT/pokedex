import { useState } from "react";

const PokedexPage = () => {
  const [pokemon, setPokemon] = useState({});

  const getPokemon = async (name) => {
    const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
    const res = await fetch(url);
    await setPokemon(res.json());
  };

  const handleClick = (name) => {
    getPokemon(name);
  };

  console.log(pokemon);

  return (
    <div>
      <h1>Pokedex</h1>
      <p>{pokemon.name}</p>
      <form>
        <input type="text" />
        <button onClick={() => handleClick}>Search</button>
      </form>
    </div>
  );
};

export default PokedexPage;
