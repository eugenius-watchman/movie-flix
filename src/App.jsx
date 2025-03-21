import React, { useEffect, useState } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { useDebounce } from 'react-use';
import { getTrendingMovies, updateSearchCount } from './appwrite';


// URL for getting movies from TMDB
const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

// Define the API options
const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}` // verifies who is making the request
  }
}


const App = () => {
  // Debounce
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [searchTerm, setSearchTerm] = useState(''); 

  // Container for storing movies fetched 
  const [movieList, setMovieList] = useState([]);

  // Display error in the browser 
  const [errorMessage, setErrorMessage] = useState('');

  // Loader
  const [isLoading, setIsLoading] = useState(false);

  // Trending movies
  const [trendingMovies, setTrendingMovies] = useState([])

  

  // Call the useDebounce hook ...to prevent too many API requests for every 500ms
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm])

  // Fetch movies
  const fetchMovies = async (query = '') => {
    // Set is loading to true before anything starts
    setIsLoading(true);
    setErrorMessage('');


    try {
      const endpoint = query 
      ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
      :`${API_BASE_URL}/discover/movie?sort_by=popularity.desc`

      const response = await fetch(endpoint, API_OPTIONS)

      // Pass response in a JSON object
      if(!response.ok){
        const errorData = await response.json()
        throw new Error(errorData || 'Failed to fetch movies.')
      }
       
      const data = await response.json();
      
      if(data.response === 'false') {
        setErrorMessage(data.Error || 'Failed to fetch movies.');
        setMovieList([]);
        return;
      }
      setMovieList(data.results || []);

      if(query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }

    } catch(error) {
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage('Error fetching movies. Please try again later.')
    } finally {
      setIsLoading(false);
    }
  }

// Trending movies 
const loadTrendingMovies = async () => {
  try {
    const movies = await getTrendingMovies();

    setTrendingMovies(movies);
  } catch(error) {
    console.log(`Error fetching trending movies: ${error}`);
  }
}


useEffect(() => {
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    loadTrendingMovies();
  }, [debouncedSearchTerm]);



  return (
    <main>
      <div className='pattern'/>

      <div className='wrapper'>
        <header>
          <img src="./hero.png" alt="Hero Banner" />
          <h1> Find <span className='text-gradient'>Best Movies</span> You'll Enjoy </h1>
        
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        </header>

        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies'>
          <h2 >All Movies</h2>

          {isLoading ? (
            <Spinner/>
          ) : errorMessage ? (
            <p className='text-red-500'>{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => (
                // <p key={movie.id} className='text-white'>{movie.title}</p>
                <MovieCard key={movie.id} movie={movie}/>
              ))}
            </ul>
          )}
        </section>

      </div>
    </main>
  )
}

export default App








 



















// import { useEffect, useState } from "react";

// const Card = ({title }) => {
// // Track activity of user 
// const [count, setCount] = useState(0);

// // State that allows users to interact with each card 
// const [hasLiked, setHasLiked] = useState(false);


// useEffect(() => {
//   console.log(`${title} has been liked: ${hasLiked}`);
// },[hasLiked]);
 

//   return (
//     <div className="card" onClick={() => setCount(count + 1)}>
//       <h2>{title} <br/> {count ? count : null}</h2>

//       <button onClick={() => setHasLiked(!hasLiked)}>
//         {hasLiked ? '❤️' : '🤍'}
//       </button>
//     </div>
//   )
// }


// const App = () => {



//   return (
//     <div className="card-container">
//      <Card title="Star Wars" rating={5} isCool={true}/>
//      <Card title="Avatar"/>
//      <Card title="The Lion King"/>
//    </div>    
//   )
// }

// export default App

