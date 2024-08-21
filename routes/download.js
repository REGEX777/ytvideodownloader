import express from 'express';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import { downloadVideo, getVideoDetails } from '../controllers/downloadController.js';


const router = express.Router();


router.post('/', downloadVideo);

router.post('/preview', getVideoDetails);

export default router;
