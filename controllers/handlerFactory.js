import catchAsync from '../util/catchAsync.js'
import AppError from '../util/appError.js'
import ApiFeatures from '../util/apiFeatures.js'


export const getAll = Model => catchAsync(async(req, res, next) => {
  let filter = {}
  if(req.params.noteId) filter = {note: req.params.noteId}

  const features = new ApiFeatures(Model.find(filter), req.query)
    .filter()
    .sort()
    .limitFields()
    .pagination()

  const docs = await features.query

  res.status(200).json({
    status: 'success', 
    results: docs.length,
    data: {
      data: docs
    }
  })
})


export const getOne = (Model, popOptions) => catchAsync(async(req, res, next) => {
  let query = Model.findById(req.params.id)
  if(popOptions) query = query.populate(popOptions)
  const doc = await query
  if(!doc) {
    return next(new AppError('No doc found with that Id', 404))
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc
    }
  })
})


export const createOne = Model => catchAsync(async(req, res, next) => {
  const doc = await Model.create(req.body)
  res.status(201).json({
    status: 'success', 
    data: {
      data: doc
    }
  })
})



export const updateOne = Model =>catchAsync(async(req, res, next) => {
  const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  })
  if(!doc) {
    return next(new AppError('No doc found with that Id', 404))
  }

  res.status(200).json({
    status: 'success', 
    data: {
      doc
    }
  })
})


export const deleteOne = Model => catchAsync(async(req, res, next) => {
  console.log(req.params)
  const doc = await Model.findByIdAndDelete(req.params.id)
  
  if(!doc) {
    return next(new AppError('No doc found with that Id', 404))
  }

  res.status(204).json({
    status: 'success',
    data: 'null'
  })
})



export const deleteMany = Model => catchAsync(async(req, res, next) => {
  console.log('delete muchos')
  console.log(req.query)
  const docs = await Model.deleteMany(req.query)
  console.log(docs)
  res.status(204).json({
    data: 'null'
  })
})


