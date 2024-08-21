import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import progress from 'progress-stream';

export const downloadVideo = async (req, res) => {
    const { url, quality } = req.body;

    if (!ytdl.validateURL(url)) {
        return res.render('error', { message: 'Invalid YouTube URL' });
    }

    try {
        const info = await ytdl.getInfo(url);
        const videoTitle = info.videoDetails.title;
        const format = ytdl.chooseFormat(info.formats, { quality });

        if (quality === 'highestaudio') {
            const tempVideoPath = path.resolve(process.cwd(), 'downloads', `${videoTitle}.mp4`);
            const audioFilePath = path.resolve(process.cwd(), 'downloads', `${videoTitle}.mp3`);

            // video size
            const videoStream = ytdl(url, { format });
            const videoSize = info.formats.find(f => f.itag === format.itag).contentLength;

            const progressStream = progress({
                length: videoSize,
                time: 100 // time in ms
            });

            progressStream.on('progress', (p) => {
                console.log(`Downloading: ${Math.round(p.percentage)}% (${p.transferred}/${p.length})`);
            });

            videoStream.pipe(progressStream).pipe(fs.createWriteStream(tempVideoPath));

            progressStream.on('end', () => {
                // Convert the video to audio
                ffmpeg(tempVideoPath)
                    .audioBitrate(128)
                    .save(audioFilePath)
                    .on('end', () => {
                        fs.unlinkSync(tempVideoPath); // Delete temporary video file
                        res.download(audioFilePath, `${videoTitle}.mp3`, (err) => {
                            if (err) {
                                console.error('Error downloading audio:', err);
                                res.render('error', { message: 'Failed to download audio' });
                            }
                            fs.unlinkSync(audioFilePath); // Delete audio file after download
                        });
                    })
                    .on('error', (error) => {
                        console.error('Error converting audio:', error);
                        res.render('error', { message: 'Failed to convert audio' });
                    });
            });
        } else {
            const filePath = path.resolve(process.cwd(), 'downloads', `${videoTitle}.mp4`);
            const videoStream = ytdl(url, { format });
            const videoSize = info.formats.find(f => f.itag === format.itag).contentLength;

            const progressStream = progress({
                length: videoSize,
                time: 100 /* Update interval in ms */
            });

            progressStream.on('progress', (p) => {
                console.log(`Downloading: ${Math.round(p.percentage)}% (${p.transferred}/${p.length})`);
            });

            videoStream.pipe(progressStream).pipe(fs.createWriteStream(filePath));

            progressStream.on('end', () => {
                saveToHistory(videoTitle, url);
                res.download(filePath, `${videoTitle}.mp4`, (err) => {
                    if (err) {
                        console.error('Error downloading video:', err);
                        res.render('error', { message: 'Failed to download video' });
                    }
                    fs.unlinkSync(filePath); // Remove video file after download
                });
            });
        }
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
