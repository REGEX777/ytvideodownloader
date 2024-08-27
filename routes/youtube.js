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
    const { url: videoURL } = req.query;

    // check if url is valid
    if (!ytdl.validateURL(videoURL)) {
        return res.status(400).send('Invalid YouTube URL');
    }

    try {
        const videoInfo = await ytdl.getInfo(videoURL);
        const formats = ytdl.filterFormats(videoInfo.formats, 'audioandvideo');
        const formattedData = formats.map(format => ({
            quality: format.qualityLabel,
            mimeType: format.mimeType,
            size: format.contentLength || 'Unknown size',
            url: format.url,
        }));
        res.header('Content-Disposition', `attachment; filename="${videoInfo.videoDetails.title}.${format.container}"`);
        ytdl(videoURL, { quality: itag }).pipe(res);
    } catch (err) {
        console.error('Error fetching video formats', err);
        res.status(500).send('Error processing video');
    }
});


export default router;
