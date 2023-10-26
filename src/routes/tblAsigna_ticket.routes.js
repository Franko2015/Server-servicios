import { Router } from 'express';
import { getAll, getOne, put, del, post } from '../controllers/tblAsigna_ticket.controller.js'

const router = Router();

// Get All
router.get('/api/asignacion', getAll);

// Get One
router.get('/api/asignacion/:id', getOne);

// Update
router.put('/api/asignacion/:id', put);

// Delete
router.delete('/api/asignacion/:id', del);

// Create
router.post('/api/asignacion', post);

export const Asignacion = router;
