import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: {
    type: String, 
    required: [true, 'A note must have a title'], 
    minlength: 1,
    maxlength: 60
  }, 
  text: {
    type: String,
    required: [true, 'Please add a content to the note'],
    maxlength: 700
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'A note must belong to a user']
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})


noteSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'user',
    select: 'firstName email'
  })
  next()
})


const Note = mongoose.model('Note', noteSchema)
export default Note


