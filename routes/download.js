import express from 'express';
import ytdl from 'ytdl-core';

const router = express.Router();

router.post('/', async (req, res) => {
    const { url, quality } = req.body;

    if (!ytdl.validateURL(url)) {
        return res.status(400).render('error', { message: 'Invalid YouTube URL' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const format = ytdl.chooseFormat(info.formats, { quality: quality });
        
        res.header('Content-Disposition', `attachment; filename="${info.videoDetails.title}.mp4"`);
        ytdl(url, { format: format }).pipe(res);
    } catch (error) {
        console.error('Error downloading video:', error);
        res.status(500).render('error', { message: 'Failed to download video' });
    }
});

export default router;
