import express from 'express'
import * as noteController from '../controllers/noteController.js'
import * as authController from '../controllers/authController.js'

const router = express.Router({mergeParams: true})

router.use(authController.protect)

router.route('/')
  .get(noteController.getAllNotes)
  .post(noteController.setNoteUserIds, noteController.createNote)
  .delete(noteController.deleteAllNotes)

router.route('/:id')
  .get(noteController.getNote)
  .patch(noteController.updateNote)
  .delete(noteController.deleteNote)



export default router