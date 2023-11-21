import { Router } from 'express';
import { getOne, edit, del, create, addCash } from '../controllers/tblCartera.controller.js'
import validateToken from '../middleware/validate-token.js';

const router = Router();

// Get One
router.get('/api/cartera/:id', validateToken, getOne);

// Update
router.put('/api/cartera', validateToken, edit);

// Delete
router.delete('/api/cartera/:id', validateToken, del);

// Create
router.post('/api/cartera', validateToken, create);

// Payment
router.put('/api/cartera/payment', validateToken, addCash);

export const Cartera = router;
