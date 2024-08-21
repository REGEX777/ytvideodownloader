import express from 'express';
import { getDownloadHistory } from '../controllers/historyController.js';

const router = express.Router();

router.get('/', getDownloadHistory);

export default router;
