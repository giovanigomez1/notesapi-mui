import express from "express";

const router = express.Router()

router.route('/')
  .get((req, res) => {
    res.send('Hello there, I am the Api, ready when you are.')
  })

export default router

