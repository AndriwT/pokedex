import { useEffect, useState } from "react";
import axios from "axios";

const PokedexPage = () => {
  const [pokemon, setPokemon] = useState({});
  const [search, setSearch] = useState("");

  // const getPokemon = async (name) => {
  //   const url = `https://pokeapi.co/api/v2/pokemon/${name}`;
  //   const res = await fetch(url);
  //   await setPokemon(res.json());
  // };

  useEffect(() => {
    getPokemon(search);
  }, []);

  const getPokemon = async (name) => {
    await axios(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((response) => {
        setPokemon(response.data);
        console.log(pokemon);
      })
      .catch((error) => {
        console.log("Error fetching data: ", error);
      });
  };

  const handleChange = (event) => {
    setSearch(event.target.value);
  };

  const handleClick = (name) => {
    setPokemon(name);
  };

  return (
    <div>
      <h1>Pokedex</h1>
      <p>{}</p>
      <form>
        <input type="text" value={search} onChange={handleChange} />
        <button onClick={() => handleClick(search)}>Search</button>
      </form>
    </div>
  );
};

export default PokedexPage;
