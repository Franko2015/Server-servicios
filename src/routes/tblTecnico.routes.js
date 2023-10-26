import { Router } from 'express';
import { getAll, getOne, put, post } from '../controllers/tblTecnico.controller.js'

const router = Router();

// Get All
router.get('/api/tecnico', getAll);

// Get One
router.get('/api/tecnico/:id', getOne);

// Update
router.put('/api/tecnico/:id', put);

// Create
router.post('/api/tecnico', post);

export const Tecnico = router;
