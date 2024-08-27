import express from 'express';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const DOWNLOAD_DIR = path.join(__dirname, '../downloads');

// make sure folder exists otherwise make it 
if (!fs.existsSync(DOWNLOAD_DIR)) {
    fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
}

// clean up the filename so it doesn’t have bad characters
const sanitizeFileName = (name) => {
    return name.replace(/[\/\\?%*:|"<>]/g, '-');
};

router.get('/download/formats', async (req, res) => {
    const { url } = req.query;

    if (!ytdl.validateURL(url)) {
        return res.status(400).send('Invalid YouTube URL');
    }

    try {
        const info = await ytdl.getInfo(url);
        const formats = info.formats.map(format => ({
            itag: format.itag,
            quality: format.qualityLabel,
            mimeType: format.mimeType,
            size: format.contentLength ? (format.contentLength / (1024 * 1024)).toFixed(2) + ' MB' : 'N/A'
        }));

        res.json(formats);
    } catch (err) {
        console.error('Error fetching video formats:', err);
        res.status(500).send('Error fetching video formats');
    }
});

router.get('/download/video', async (req, res) => {
    const { url, itag } = req.query;

    if (!ytdl.validateURL(url)) {
        return res.status(400).send('Invalid YouTube URL');
    }

    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: itag });

        res.header('Content-Disposition', `attachment; filename="${sanitizeFileName(info.videoDetails.title)}.${format.container}"`);
        ytdl(url, { format }).pipe(res);
    } catch (err) {
        console.error('error while downloading video:', err);
        res.status(500).send('error while processing video download');
    }
}); 


export default router;
