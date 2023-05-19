import User from "../models/userModel.js";
import * as factory from './handlerFactory.js'

export const getAllUsers = factory.getAll(User)
export const getUser = factory.getOne(User, {path: 'note'})
export const deleteUser = factory.deleteOne(User)

