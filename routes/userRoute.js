import express from 'express'
import * as userController from '../controllers/userController.js'
import * as authController from '../controllers/authController.js'

const router = express.Router({mergeParams: true})

router.post('/signup', authController.signup)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.get('/isLogged', authController.isLoggedIn)

router.route('/')
  .get(authController.protect, authController.restrictTo('admin'), userController.getAllUsers)

router.route('/:id')
  .get(userController.getUser)
  .delete(userController.deleteUser)

export default router

