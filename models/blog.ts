import mongoose from 'mongoose'
const Schema = mongoose.Schema


export type Blog = {
  title: string
  description: string
  body: string
}

const blogSchema = new Schema<Blog>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true
  }
}, { timestamps: true })

const Blog = mongoose.model('Blog', blogSchema)

export default Blog
