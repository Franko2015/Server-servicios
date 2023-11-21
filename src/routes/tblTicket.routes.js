import { Router } from 'express';
import { getAll, getOne, put, del, post, getTickets } from '../controllers/tblTicket.controller.js'
import validateToken from '../middleware/validate-token.js';

const router = Router();

// Get All
router.get('/api/ticket',validateToken, getAll);

// Get One
router.get('/api/ticket/:id',validateToken, getOne);

// Update
router.put('/api/ticket/:id',validateToken, put);

// Delete
router.delete('/api/ticket/:id',validateToken, del);

// Create
router.post('/api/ticket',validateToken, post);

// Get tickets user
router.get('/api/tickets/:rut_usuario', validateToken, getTickets)

export const Ticket = router;
