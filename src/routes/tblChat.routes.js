import { Router } from 'express';
import { getChat, postChat, leido, getAllChats } from '../controllers/tblChat.controller.js'
import validateToken from '../middleware/validate-token.js';

const router = Router();

// Get All
router.get('/api/chat', validateToken, getAllChats);

//Get One chat
router.get('/api/chat/:rut_cliente', validateToken, getChat);

// Post
router.post('/api/chat', validateToken, postChat);

// Read
router.put('/api/chat/read/:rut_cliente', validateToken, leido);


export const Chat = router;