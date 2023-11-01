import { Router } from 'express';
import { getAll, getOne, edit, create, login } from '../controllers/tblUsuario.controller.js'
import validateToken from '../middleware/validate-token.js';

const router = Router();

// Get All
router.get('/api/usuarios', validateToken, getAll);

// Get One
router.get('/api/usuarios/:rut', validateToken, getOne);

// Update
router.put('/api/usuarios/:rut', validateToken, edit);

// Create
router.post('/api/usuarios', create);

// Login
router.post( '/api/login', login);

export const Usuario = router;
