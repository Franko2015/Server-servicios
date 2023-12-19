import { Router } from 'express';
import { validate, reset } from '../controllers/email.controller.js'

const router = Router();

router.post('/api/recover', validate);
router.get('/api/reset/:token', reset);

export const Email = router;