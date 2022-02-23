import express from 'express'
import morgan from 'morgan'
import mongoose from 'mongoose'
import Blog from './models/blog'
import BlogImage from './models/images'
import multer from 'multer'
import path from 'path'

/*
 * The application instance
 *
 */
const app = express()

/*
 * The application port
 *
 */
const port = 5000

/**
 * Connect to MongoDB. If connected, start
 * server instance.
 *
 */
const dbURI = 'mongodb+srv://cyril:cyriltest@cluster0.z0hpt.mongodb.net/cyriltest?retryWrites=true&w=majority'
mongoose.connect(dbURI)
  .then(() => {
    app.listen(port)
    console.log(`Application listening on port ${port}`)
  })
  .catch(err => console.log(err))

/*
 * For middlewares & static files
 * 
 */
app.use(express.static('public'))
app.use(express.json())
app.use(morgan('dev'))
app.use((request, response, next) => {
  response.locals.path = request.path
  next()
})

/*
 * Upload files (e.g. images) using Multer
 * and store the file into the uploads folder.
 */
const destination = __dirname + '/uploads'
const storage = multer.diskStorage({
  destination: destination,
  filename: (request, file, cb) => {
    cb(null, `file-${file.originalname}${path.extname(file.originalname)}`)
  }
})
const upload = multer({
  storage: storage,
  preservePath: true
})

/*
 * Blog Routes
 *
 */

// get all blogs
app.get('/blogs', (request, response) => {
  Blog.find().sort({ createdAt: -1 })
    .then((result: any) => {
      response.send(result)
    })
    .catch((err: any) => {
      console.log(err)
      response.send(err.message)
    })
})

// create blog
app.post('/blogs', (request, response) => {
  const blog = new Blog(request.body)

  blog.save()
    .then(result => {
      response.send(`Successfully saved new blog ${result}`)
    })
    .catch(err => {
      console.log(err)
      response.send(`Unable to create blog. ${err.message}`)
    })
})

// get blog by id
app.get('/blogs/:id', (request, response) => {
  const id = request.params.id

  Blog.findById(id)
    .then(result => {
      response.send(`Found blog, ${result}`)
    })
    .catch(err => {
      console.log(err)
      response.send(`Unable to get blog with the supplied id. ${err.message}`)
    })
})

// update blog by id
app.put('/blogs/:id', (request, response) => {
  const id = request.params.id

  Blog.findOneAndUpdate(
    { "_id": id },
    request.body,
    { new: true }
  )
  .then(result => {
    response.send(`Blog updated. ${result}`)
  })
  .catch(err => {
    console.log(err)
    response.send(`Unable to update blog. ${err.message}`)
  })
})

// delete blog by id
app.delete('/blogs/:id', (request, response) => {
  const id = request.params.id
  
  Blog.findByIdAndDelete(id)
    .then(result => {
      response.send(`Blog has been deleted, ${result}`)
    })
    .catch(err => {
      console.log(err)
      response.send(`Could not delete blog. ${err.message}`)
    })
})


/*
 * Blog Image Routes
 *
 */

// get images associated with a blog
app.get('/blogs/:id/images', (request, response) => {
  const id = request.params.id

  BlogImage.find().select({ post: id })
    .then(result => {
      response.send(`Images of a blog with an id of ${id}. ${result}`)
    })
    .catch(err => {
      response.send(`Could not retrieve associated images for this blog. ${err}`)
    })
})

// upload image for a specific blog
app.post('/blogs/:id/upload', upload.single('image'), (request, response) => {
  const filename = request.file.filename
  const id = request.params.id
  const params = {
    post: id,
    fileName: filename,
    path: `${destination}/${filename}`
  }

  // const image = new BlogImage(params)

  console.log(`${destination}/${filename}`)

  BlogImage.findOneAndUpdate(
    { fileName: filename, post: id },
    { $setOnInsert: params },
    { upsert: true, new: true, rawResult: true }
  )
    .then(result => {
      response.send(`uploaded image ${result}`)
    })
    .catch(err => {
      response.send(`failed to upload. ${err}`)
    })
})
