import { Router } from 'express';
import { getAll, getOne, put, post } from '../controllers/tblTecnico.controller.js'
import validateToken from '../middleware/validate-token.js';

const router = Router();

// Get All
router.get('/api/tecnico', validateToken, getAll);

// Get One
router.get('/api/tecnico/:id', validateToken, getOne);

// Update
router.put('/api/tecnico/:id', validateToken, put);

// Create
router.post('/api/tecnico', validateToken, post);

export const Tecnico = router;
