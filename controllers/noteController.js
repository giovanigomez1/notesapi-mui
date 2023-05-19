import Note from "../models/noteModel.js";
import * as factory from './handlerFactory.js'


export const setNoteUserIds = (req, res, next) => {
  if(!req.body.user) req.body.user = req.user.id
  next()
}

export const getAllNotes = factory.getAll(Note)
export const getNote = factory.getOne(Note, {path: 'user'})
export const createNote = factory.createOne(Note)
export const updateNote = factory.updateOne(Note)
export const deleteNote = factory.deleteOne(Note)
export const deleteAllNotes = factory.deleteMany(Note)

