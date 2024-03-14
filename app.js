const express = require('express')
const movies = require('./movies.json')
const cors = require('cors')
const { validateMovie, validatePartialMovie } = require('./validate.js')

const ACCEPTED_ORIGINS = [
  'http://localhost:8080',
  // 'http://localhost:1234/', ===> no responde a solicitud de su mismo origen
  'https://movies.com',
  'https://my-app.com'
]
const app = express()
app.disable('x-powered-by')
const PORT = process.env.PORT ?? 1234

app.use(express.json())
app.use(cors({
  origin: (origin, callback) => {
    if (ACCEPTED_ORIGINS.includes(origin)) {
      callback(null, true)
    }

    if (!origin) { // en el caso de que se pruebe desde el mismo origen (localhost:1234)
      callback(null, true)
    }

    callback(new Error('Not allowed by CORS'))
  }
}))

app.get('/', (req, res) => {
  res.send('<h1>Hola mundo</h1>')
})
// all movies
app.get('/movies', (req, res) => {
  // res.header('Access-Control-Allow-Origin', '*')

  // sin la dependencia cors
  // const origin = req.header('origin')
  // if (ACCEPTED_ORIGINS.includes(origin)) {
  //   res.header('Access-Control-Allow-Origin', origin)
  // }

  // by genre
  const { genre } = req.query
  if (genre) {
    const moviesByGenre = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(moviesByGenre)
  }
  res.json(movies)
})

// single movie
app.get('/movies/:id', (req, res) => {
  const { id } = req.params
  const movie = movies.find(movie => movie.id === id)
  if (!movie) {
    return res.status(404).json({ error: 'Movie not found' })
  }
  res.json(movie)
})

// create a movie
app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)
  console.log(result)
  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }
  // const {
  //   title,
  //   year,
  //   director,
  //   duration,
  //   genre,
  //   rate,
  //   poster
  // } = req.body

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data
    // title,
    // year,
    // director,
    // duration,
    // genre,
    // rate: rate || 0,
    // poster
  }

  movies.push(newMovie)
  res.status(201).json(newMovie)
})

// update a movie
app.patch('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) {
    return res.status(404).json({ error: 'Movie not found' })
  }

  const result = validatePartialMovie(req.body)

  if (result.error) {
    return res.status(400).json({ error: JSON.parse(result.error.message) })
  }

  const updatedMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updatedMovie
  res.json(updatedMovie)
})

app.delete('/movies/:id', (req, res) => {
  // sin la dependencia cors
  // const origin = req.header('origin')
  // if (ACCEPTED_ORIGINS.includes(origin)) {
  //   res.header('Access-Control-Allow-Origin', origin)
  // }

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) {
    return res.status(404).json({ error: 'Movie not found' })
  }
  movies.splice(movieIndex, 1)
  res.status(204)
  return res.json({ message: 'Movie deleted' })
})

// sin la dependencia cors
// app.options('/movies/:id', (req, res) => {
//   const origin = req.header('origin')
//   if (ACCEPTED_ORIGINS.includes(origin)) {
//     res.header('Access-Control-Allow-Origin', origin)
//   }
//   res.header('Access-Control-Allow-Methods', 'DELETE, PATCH')
//   res.header('Access-Control-Allow-Headers', 'Content-Type')
//   res.send(200)
// })

// search all movies by genre
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`)
})
