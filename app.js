const express = require('express');
const crypto = require('node:crypto');
const cors = require('cors');

const movies = require('./movies.json');
const { validateMovie, validatePartialMovie } = require('./Schemas/movies');

const app = express();

app.use(express.json())
app.use(cors())
app.disable('x-powered-by');

// const ACCEPTED_ORIGINS =[
//     'http://localhost:1234',
//     'http://localhost:8080',
//     'http://movies.com'
// ]

// app.get('/', ( req, res )=>{
//     res.json({ message: 'hola mundo' })
// } )

app.get('/movies',( req, res )=>{
    // const origin = req.header('origin')
    // if(ACCEPTED_ORIGINS.includes(origin) || !origin){
    //     res.header('Access-Control-Allow-Origin',origin);
    // }
    
    const { genre } = req.query;
    if( genre ){
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g=> g.toLowerCase()=== genre.toLocaleLowerCase())
        )
        return res.json(filteredMovies)
    }
    res.json(movies)
})

app.get('/movies/:id', ( req, res)=>{ //path-to-regexp
    const { id } = req.params;
    const movie = movies.find(movie => movie.id === id);
    if( movie ) return res.json(movie)

    res.status(404).json({ message: 'Movie not found' });
})

app.post('/movies', ( req, res )=>{
   const result = validateMovie(req.body)

   if (!result.success){
    return res.status(400).json({ error: JSON.parse(result.error.message) })
   }

    // const {
    //     title,
    //     genre,
    //     year,
    //     director,
    //     duration,
    //     rate,
    //     poster
    // } = req.body

    // if ( !title || !genre || !year || ! director || !duration || !poster){
    //     return res.status(400).json({ message: 'Missing required fields'});
    // }

    const newMovie = {
        id: crypto.randomUUID(), //uuid v4   id unica automatica
        ...result.data
        // title,
        // genre,
        // year,
        // director,
        // duration,
        // rate: rate ?? 0,
        // poster
    }

    movies.push(newMovie);
    res.status(201).json(newMovie)
})

app.patch('/movies/:id',( req, res )=>{
    const result = validatePartialMovie(req.body);
    
    if(!result.success){
        return res.status(400).json({ error: JSON.parse(result.error.message) })
    }
    
    const { id } = req.params;
    const movieIndex = movies.findIndex(movie=> movie.id === id);

    if(movieIndex == -1) return res.status(404).json({ message: 'Movie not found' })

    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    }

    movies[movieIndex] = updateMovie;

    return res.json(updateMovie);
})


const PORT = process.env.PORT ?? 1234;

app.listen(PORT, ()=> {
    console.log(`Server running on port ${PORT}`);
})