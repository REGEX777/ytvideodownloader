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

    console.log('Received download request:', { url, itag });

    // Validate the YouTube URL
    if (!ytdl.validateURL(url)) {
        console.log('Invalid YouTube URL:', url);
        return res.status(400).send('Invalid YouTube URL');
    }

    try {
        console.log('Fetching video info for URL:', url);
        const info = await ytdl.getInfo(url);

        console.log('Video info fetched successfully:', {
            title: info.videoDetails.title,
            formatsAvailable: info.formats.length,
        });

        // format will depend on the selected itag
        console.log('Choosing format with itag:', itag);
        const format = ytdl.chooseFormat(info.formats, { quality: itag });

        console.log('Selected format:', {
            container: format.container,
            qualityLabel: format.qualityLabel,
            mimeType: format.mimeType,
        });

        const sanitizedFileName = sanitizeFileName(info.videoDetails.title);
        console.log('Sanitized file name:', sanitizedFileName);

        res.header('Content-Disposition', `attachment; filename="${sanitizedFileName}.${format.container}"`);
        console.log('Response headers set, starting video download...');

        ytdl(url, { format })
            .on('progress', (chunkLength, downloaded, total) => {
                console.log(`Downloading: ${((downloaded / total) * 100).toFixed(2)}% complete`);
            })
            .on('end', () => {
                console.log('Video download complete.');
            })
            .on('error', (err) => {
                console.error('Error during video download:', err);
                res.status(500).send('Error while downloading video');
            })
            .pipe(res);

    } catch (err) {
        console.error('Error while processing video download:', err);
        res.status(500).send('Error while processing video download');
    }
});



export default router;
