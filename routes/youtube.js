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

router.get('/download', async (req, res) => {
    const { url: videoURL, quality = 'highest', format = 'mp4', save = false, type = 'video' } = req.query;

    // check if url is valid or else stop
    if (!ytdl.validateURL(videoURL)) {
        return res.status(400).send('invalid youtube url');
    }

    try {
        // get video info like title n stuff
        const videoInfo = await ytdl.getInfo(videoURL);
        const videoTitle = sanitizeFileName(videoInfo.videoDetails.title);
        const outputFileName = `${videoTitle}.${format}`;
        const outputFilePath = path.join(DOWNLOAD_DIR, outputFileName);

        console.log(`downloading video: ${videoTitle} from ${videoInfo.videoDetails.video_url}`);
        console.log(`quality: ${quality}, format: ${format}, type: ${type}`);

        let filterFunction = null;
        if (type === 'audio') {
            filterFunction = format => format.hasAudio && !format.hasVideo;
        } else if (type === 'video') {
            filterFunction = format => format.hasVideo;
        }

        // get the video from youtube
        const videoStream = ytdl(videoURL, {
            quality,
            filter: filterFunction
        });

        if (save) {
            // save video to disk
            const fileStream = fs.createWriteStream(outputFilePath);
            videoStream.pipe(fileStream);

            fileStream.on('finish', () => {
                console.log(`video saved to ${outputFilePath}`);
                res.send(`video saved at ${outputFilePath}`);
            });

            fileStream.on('error', (err) => {
                console.error(`error saving file`, err);
                res.status(500).send('error saving video');
            });
        } else {
            // stream video to user directly
            res.setHeader('Content-Disposition', `attachment; filename="${outputFileName}"`);
            videoStream.pipe(res);

            videoStream.on('finish', () => {
                console.log(`video streamed to user`);
            });

            videoStream.on('error', (err) => {
                console.error(`stream error`, err);
                res.status(500).send('error streaming video');
            });
        }
    } catch (err) {
        console.error(`error processing video`, err);
        res.status(500).send('error processing video');
    }
});

export default router;
