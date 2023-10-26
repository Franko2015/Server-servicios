import { Router } from 'express';
import { getAll, getOne, put, del, post } from '../controllers/tblTicket.controller.js'

const router = Router();

// Get All
router.get('/api/ticket', getAll);

// Get One
router.get('/api/ticket/:id', getOne);

// Update
router.put('/api/ticket/:id', put);

// Delete
router.delete('/api/ticket/:id', del);

// Create
router.post('/api/ticket', post);

export const Ticket = router;
