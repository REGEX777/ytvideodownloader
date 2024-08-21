import express from 'express';
import ytdl from 'ytdl-core';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const sanitizeFileName = (name) => {
    return name.replace(/[\/\\?%*:|"<>]/g, '-');
};

router.get('/download', async (req, res) => {
    const videoURL = req.query.url;
    const quality = req.query.quality || 'highest';

    // Validate the YouTube URL
    if (!ytdl.validateURL(videoURL)) {
        console.error('Invalid YouTube URL:', videoURL);
        return res.status(400).send('Invalid YouTube URL.');
    }

    try {
        const videoInfo = await ytdl.getInfo(videoURL);
        const videoTitle = sanitizeFileName(videoInfo.videoDetails.title);

        console.log(`Downloading: ${videoTitle} (${videoInfo.videoDetails.video_url})`);
        console.log(`Chosen quality: ${quality}`);

        res.setHeader('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);
        res.setHeader('Content-Type', 'video/mp4');

        const videoStream = ytdl(videoURL, { quality });

        videoStream
            .on('response', (httpResponse) => {
                console.log('Starting download...');
                console.log('Content-Length:', httpResponse.headers['content-length']);
            })
            .on('progress', (chunkLength, downloaded, total) => {
                console.log(`Downloaded: ${(downloaded / total * 100).toFixed(2)}%`);
            })
            .on('error', (error) => {
                console.error('Stream error:', error);
                res.status(500).send('Failed to stream video.');
            })
            .pipe(res)
            .on('finish', () => {
                console.log('Download complete');
            });

    } catch (err) {
        console.error('Error processing video:', err);
        res.status(500).send('Failed to process the video.');
    }
});

export default router;
