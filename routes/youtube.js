import express from 'express';
import ytdl from 'ytdl-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

router.get('/download', async (req, res) => {
    const videoURL = req.query.url;
    const quality = req.query.quality || 'highest';

    if (!ytdl.validateURL(videoURL)) {
        return res.status(400).send('Invalid YouTube URL.');
    }

    try {
        const videoInfo = await ytdl.getInfo(videoURL);
        const videoTitle = videoInfo.videoDetails.title.replace(/[\/\\?%*:|"<>]/g, '-');
        
        res.setHeader('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');

        ytdl(videoURL, { quality }).pipe(res);
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Failed to stream video.');
    }
});

export default router;
