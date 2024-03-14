const z = require('zod')

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is required'
  }),
  year: z.number().min(1900).max(2030).int(),
  director: z.string(),
  duration: z.number(),
  genre: z.array(z.enum([
    'Action',
    'Adventure',
    'Animation',
    'Biography',
    'Comedy',
    'Crime',
    'Documentary',
    'Drama',
    'Family',
    'Fantasy',
    'Sci-Fi'
  ]),
  {
    required_error: 'Movie genre is required'
  }
  ),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({
    message: 'Poster must be a valid URL'
  })

})

const validateMovie = (object) => {
  return movieSchema.safeParse(object)
}

const validatePartialMovie = (object) => {
  return movieSchema.partial().safeParse(object)
}
module.exports = { validateMovie, validatePartialMovie }
