const express = require('express')
const movies = require('./movies.json')
const { z } = require('zod');
const app = express()
app.use(express.json());
app.disable('x-powered-by')

// Middleware para agregar CORS en todas las respuestas
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // Permitir todas las solicitudes de cualquier origen
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE'); // Métodos permitidos
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type'); // Encabezados permitidos
    next();
  });

// Esquema de validación de Zod
const movieSchema = z.object({
    title: z.string().min(1).optional(),
    year: z.number().min(1900).max(new Date().getFullYear()).optional(),
    director: z.string().min(1).optional(),
    duration: z.number().min(1).optional(),
    poster: z.string().url().optional(),
    genre: z.array(z.string()).min(1).optional(),
    rate: z.number().min(0).max(10).optional()
  });

app.get('/', (req, res) => {
    res.json({message: 'hola mundo'})
})

//Recuperar todas las MOVIES o filtradas por título o género
app.get('/movies', (req, res) => {
    res.header('Access-Control-Allow-Origin', '*')
    const { genre, title, year } = req.query
    let filteredMovies = movies;

    if (genre) {
        filteredMovies = filteredMovies.filter(movie =>
            movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
        );
    }

    if (title) {
        filteredMovies = filteredMovies.filter(movie =>
            movie.title.toLowerCase().includes(title.toLowerCase())
        );
    }

    if (year) {
        filteredMovies = filteredMovies.filter(movie =>
            movie.year === parseInt(year) // Convertir el año a número
        );
    }

    return res.json(filteredMovies);
})




//Recuperar MOVIES por ID
app.get('/movies/:id', (req, res) => {
    const { id } = req.params
    const movie = movies.find(movie => movie.id == id)

    if (movie) return res.json(movie)

        res.status(404).json({ message: 'Movie not found'})
})

//Postear una peli nueva
app.post('/movies', (req, res) => {
    const { title, year, director, duration, poster, genre, rate } = req.body;

    // Validar los datos con Zod
    try {
    const validatedMovie = movieSchema.parse({
      title, year, director, duration, poster, genre, rate
    });


    // Crear un nuevo objeto de película
    const newMovie = {
        id: require('crypto').randomUUID(),  // Genera un ID único
        ...validatedMovie
    };

    // Agregar la nueva película al arreglo
    movies.push(newMovie);

    // Devolver la película agregada
    res.status(201).json(newMovie);
    } catch (error) {
    // Si la validación falla, devolver un error con los detalles
    return res.status(400).json({ message: error.errors });
  }
});

/*
//Actualizar MOVIES por ID
app.patch('/movies/:id', (req, res) => {
    const { id } = req.params; // Obtener el ID de la película de la URL
    const updateData = req.body; // Obtener los datos a actualizar desde el cuerpo
  
    // Validar los datos de la película con el esquema
    try {
      const validatedData = movieSchema.parse(updateData);
  
      // Buscar la película por su ID
      const movieIndex = movies.findIndex(movie => movie.id === id);
      if (movieIndex === -1) {
        return res.status(404).json({ message: "Movie not found" });
      }
  
      // Actualizar los campos de la película con los datos validados
      movies[movieIndex] = {
        ...movies[movieIndex], // Mantener los datos existentes
        ...validatedData // Actualizar solo los campos enviados
      };
  
      return res.status(200).json(movies[movieIndex]); // Devolver la película actualizada
    } catch (error) {
      // Si la validación falla, devolver un error
      return res.status(400).json({ message: error.errors });
    }
  });*/


// Endpoint para eliminar una película
app.delete('/movies/:id', (req, res) => {
    const { id } = req.params; // Obtener el ID de la película de la URL
  
    // Buscar la película por su ID
    const movieIndex = movies.findIndex(movie => movie.id === id);
    if (movieIndex === -1) {
      return res.status(404).json({ message: "Movie not found" });
    }
  
    // Eliminar la película del arreglo
    const deletedMovie = movies.splice(movieIndex, 1)[0]; // Guardar la película eliminada para devolverla
  
    return res.status(200).json({
      message: "Movie deleted successfully",
      deletedMovie
    });
  });


const PORT = process.env.PORT ?? 1234

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`)
})