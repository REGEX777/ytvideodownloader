import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';
import ffmpeg from 'fluent-ffmpeg';
import progress from 'progress-stream';

export const downloadVideo = async (url, quality = 'highestvideo') => {
    console.log(url);

    if (!ytdl.validateURL(url)) {
        
        console.error('Invalid YouTube URL');
        return;
    }

    try {
        const info = await ytdl.getInfo(url);
        const videoTitle = info.videoDetails.title.replace(/[\/:*?"<>|]/g, '');
        const format = ytdl.chooseFormat(info.formats, { quality });

        const outputFilePath = path.resolve(process.cwd(), 'downloads', `${videoTitle}.mp4`);

        if (!fs.existsSync(path.resolve(process.cwd(), 'downloads'))) {
            fs.mkdirSync(path.resolve(process.cwd(), 'downloads'));
        }

        const str = progress({ length: format.contentLength, time: 100 });

        const videoStream = ytdl(url, { format });
        videoStream.pipe(str).pipe(fs.createWriteStream(outputFilePath));

        str.on('progress', (progress) => {
            console.log(`Downloading: ${progress.percentage.toFixed(2)}% complete`);
        });

        videoStream.on('end', () => {
            console.log(`Download complete: ${outputFilePath}`);
        });

    } catch (error) {
        console.error('Error downloading video:', error);
    }
};

const downloadAudio = async (url) => {
    if (!ytdl.validateURL(url)) {
        console.error('Invalid YouTube URL');
        return;
    }

    try {
        const info = await ytdl.getInfo(url);
        const videoTitle = info.videoDetails.title.replace(/[\/:*?"<>|]/g, '');
        const tempVideoPath = path.resolve(process.cwd(), 'downloads', `${videoTitle}.mp4`);
        const audioFilePath = path.resolve(process.cwd(), 'downloads', `${videoTitle}.mp3`);

        if (!fs.existsSync(path.resolve(process.cwd(), 'downloads'))) {
            fs.mkdirSync(path.resolve(process.cwd(), 'downloads'));
        }

        const videoStream = ytdl(url, { quality: 'highestaudio' });

        const str = progress({ time: 100 });

        videoStream.pipe(str).pipe(fs.createWriteStream(tempVideoPath));

        str.on('progress', (progress) => {
            console.log(`Downloading audio: ${progress.percentage.toFixed(2)}% complete`);
        });

        videoStream.on('end', () => {
            console.log(`Download complete: ${tempVideoPath}`);
            ffmpeg(tempVideoPath)
                .audioBitrate(128)
                .save(audioFilePath)
                .on('end', () => {
                    console.log(`Audio conversion complete: ${audioFilePath}`);
                    fs.unlinkSync(tempVideoPath);
                })
                .on('error', (error) => {
                    console.error('Error during audio conversion:', error);
                });
        });

    } catch (error) {
        console.error('Error downloading audio:', error);
    }
};