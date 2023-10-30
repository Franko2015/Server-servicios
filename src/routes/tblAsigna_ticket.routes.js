import { Router } from 'express';
import { getAll, getOne, put, del, post } from '../controllers/tblAsigna_ticket.controller.js'
import validateToken from '../middleware/validate-token.js';

const router = Router();

// Get All
router.get('/api/asignacion', validateToken, getAll);

// Get One
router.get('/api/asignacion/:id', validateToken, getOne);

// Update
router.put('/api/asignacion/:id', validateToken, put);

// Delete
router.delete('/api/asignacion/:id', validateToken, del);

// Create
router.post('/api/asignacion', validateToken, post);

export const Asignacion = router;
