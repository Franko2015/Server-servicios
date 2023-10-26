import { Router } from 'express';
import { getAllLog, postLog } from '../controllers/tblLog.controller.js'

const router = Router();

// Get All
router.get('/api/logs', getAllLog);

// Create
router.post('/api/logs', postLog);

export const Log = router;
