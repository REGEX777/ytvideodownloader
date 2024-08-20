import express from 'express';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

const router = express.Router();

router.post('/', async (req, res) => {
    const videoUrl = req.body.videoUrl;

    try {
        const info = await ytdl.getInfo(videoUrl);
        const videoDetails = {
            title: info.videoDetails.title,
            thumbnail: info.videoDetails.thumbnails[0].url,
            duration: info.videoDetails.lengthSeconds,
        };

        const outputFileName = `${videoDetails.title}.mp4`;
        const outputPath = path.join('downloads', outputFileName);

        res.render('index', { videoDetails });

        const stream = ytdl(videoUrl, { format: 'mp4' }).pipe(fs.createWriteStream(outputPath));

        stream.on('finish', () => {
            console.log('Download completed');
        });

    } catch (error) {
        console.error('Error:', error);
        res.render('index', { errorMessage: 'Failed to download video. Please check the URL and try again.' });
    }
});

export default router;
