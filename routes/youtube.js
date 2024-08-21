import express from 'express';
import ytdl from 'ytdl-core';
import { fileURLToPath } from 'url';
import path from 'path';

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

        ytdl(videoURL, { quality })
            .on('error', (error) => {
                console.error('Stream error:', error);
                res.status(500).send('Failed to stream video.');
            })
            .pipe(res)
            .on('finish', () => {
                console.log('Video stream finished');
            });
    } catch (err) {
        console.error('Error:', err);
        res.status(500).send('Failed to process the video.');
    }
});

export default router;
