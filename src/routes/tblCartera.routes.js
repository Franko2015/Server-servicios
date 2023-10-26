import { Router } from 'express';
import { getAll, getOne, put, del, post } from '../controllers/tblCartera.controller.js'

const router = Router();

// Get All
router.get('/api/cartera', getAll);

// Get One
router.get('/api/cartera/:id', getOne);

// Update
router.put('/api/cartera/:id', put);

// Delete
router.delete('/api/cartera/:id', del);

// Create
router.post('/api/cartera', post);

export const Cartera = router;
