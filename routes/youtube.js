import express from 'express';
import ytdl from 'ytdl-core';
import fs from 'fs';
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

    const videoInfo = await ytdl.getInfo(videoURL);
    const videoTitle = videoInfo.videoDetails.title.replace(/[\/\\?%*:|"<>]/g, '-');
    const outputPath = path.join(__dirname, '../downloads', `${videoTitle}.mp4`);

    res.setHeader('Content-Disposition', `attachment; filename="${videoTitle}.mp4"`);

    ytdl(videoURL, { quality })
        .pipe(fs.createWriteStream(outputPath))
        .on('finish', () => {
            res.download(outputPath, `${videoTitle}.mp4`, (err) => {
                if (err) {
                    console.error('Download error:', err);
                    return res.status(500).send('Failed to download video.');
                }
                fs.unlink(outputPath, (err) => {
                    if (err) console.error('Error deleting file:', err);
                });
            });
        });
});

export default router;
