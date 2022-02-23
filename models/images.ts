import mongoose from 'mongoose'
const Schema = mongoose.Schema


/*
export type Image = {
  data: typeof Schema.Types.Buffer
  contentType: string
}
*/

export type BlogImage = {
  post: typeof mongoose.Schema.Types.ObjectId | string
  fileName: string
  path: string
}

const blogImageSchema = new Schema<BlogImage>({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Blog',
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: false
  }
}, { timestamps: true })

const BlogImage = mongoose.model('BlogImage', blogImageSchema)

export default BlogImage
