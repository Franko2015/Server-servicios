import { Router } from 'express';
import { getAll, getOne, put, post } from '../controllers/tblUsuario.controller.js'

const router = Router();

// Get All
router.get('/api/usuarios', getAll);

// Get One
router.get('/api/usuarios/:id', getOne);

// Update
router.put('/api/usuarios/:id', put);

// Create
router.post('/api/usuarios', post);

export const Usuario = router;
