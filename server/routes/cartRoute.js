import express from 'express'
import { updateCart } from '../controllers/cartController.js';

const cartRouter = mongoose.Router();

cartRouter.post('/update', authUser, updateCart)

export default cartRouter;