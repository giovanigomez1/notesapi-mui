import mongoose from "mongoose";
import crypto from 'crypto'
import validator from "validator";
import bcript from 'bcryptjs'


const userSchema = mongoose.Schema({
  firstName: {
    type: String, 
    required: [true, 'Please tell us your name'],
    minlegth: 2,
    lowercase: true
  },
  lastName: {
    type: String, 
    required: [true, 'Please tell us your name'],
    minlegth: 2,
    lowercase: true
  },
  email: {
    type: String,
    required: [true, 'Please provide a valid email address'],
    unique: true, 
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  }, 
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlegth: 6,
    select: false
  }, 
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    validate: {
      validator: function(el) {
        return el === this.password
      },
      message: 'Passwords are not the same'
    }
  },
  note: {
    type: mongoose.Schema.ObjectId,
    ref: 'Note'
  },
  passwordChangedAt: Date, 
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})


userSchema.virtual('notes', {
  ref: 'Note',
  foreignField: 'user',
  localField: '_id'
})


userSchema.pre(/^find/, function(next) {
  this.populate({
    path: 'note', 
    select: 'title text'
  })
  next()
})


userSchema.pre('save', async function(next) {
  if(!this.isModified('password')) return next()
  this.password = await bcript.hash(this.password, 12)
  this.passwordConfirm = undefined
  next()
 })


// Change password functionality is not implemented on this demo
userSchema.pre('save', function(next) {
  if(!this.isModified('password') || this.isNew) return next()
  this.passwordChangedAt = Date.now() - 1000
  next()
})


userSchema.methods.correctPassword = async function(candidatePassword, usePassword) {
  return await bcript.compare(candidatePassword, usePassword)
}


// Change password functionality is not implemented on this demo
userSchema.methods.changePasswordAfter = function(JWTTimestamp) {
  if(this.passwordChangedAt) {
    const changeTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)
    return JWTTimestamp < changeTimestamp
  }
  return false
}


// Forgot password reset is not implemented on this demo
userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex')
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
    this.passwordResetExpires = Date.now + 10 * 60 * 1000
    return resetToken
}



const User = mongoose.model('User', userSchema)
export default User