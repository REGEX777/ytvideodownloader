import express from 'express';
import { videoDetail } from '../controllers/videoDetailController.js';

const router = express.Router();

router.get('/video/:id', videoDetail);

export default router;
