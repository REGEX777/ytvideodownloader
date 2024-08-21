import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

export const downloadVideo = async (req, res) => {
    const { url, quality } = req.body;

    if (!ytdl.validateURL(url)) {
        return res.render('error', { message: 'Invalid YouTube URL' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const videoTitle = info.videoDetails.title;
        const format = ytdl.chooseFormat(info.formats, { quality });

        const filePath = path.resolve(process.cwd(), 'downloads', `${videoTitle}.mp4`);
        const videoStream = ytdl(url, { format });

        videoStream.pipe(fs.createWriteStream(filePath));

        videoStream.on('end', () => {
            saveToHistory(videoTitle, url);
            res.download(filePath, `${videoTitle}.mp4`, (err) => {
                if (err) {
                    console.error('Error downloading video:', err);
                    res.render('error', { message: 'Failed to download video' });
                }
                fs.unlinkSync(filePath);
            });
        });
    } catch (error) {
        console.error('Error processing video:', error);
        res.render('error', { message: 'An error occurred while processing the video' });
    }
};

export const getVideoDetails = async (req, res) => {
    const { url } = req.body;

    if (!ytdl.validateURL(url)) {
        return res.render('error', { message: 'Invalid YouTube URL' });
    }

    try {
        const info = await ytdl.getInfo(url);
        res.render('preview', {
            title: 'Preview Video Details',
            videoDetails: {
                title: info.videoDetails.title,
                description: info.videoDetails.description,
                thumbnail: info.videoDetails.thumbnails[0].url
            }
        });
    } catch (error) {
        console.error('Error fetching video details:', error);
        res.render('error', { message: 'Failed to fetch video details' });
    }
};

const saveToHistory = (title, url) => {
    const historyPath = path.resolve(process.cwd(), 'downloads', 'history.json');
    let history = [];

    if (fs.existsSync(historyPath)) {
        history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
    }

    history.push({ title, url, date: new Date().toISOString() });

    fs.writeFileSync(historyPath, JSON.stringify(history, null, 2));
};
