import axios from 'axios';

export const videoDetail = async (req, res) => {
    const videoId = req.params.id;
    const API_KEY = process.env.YOUTUBE_API_KEY;
    const API_URL = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${API_KEY}`;

    try {
        const response = await axios.get(API_URL);
        const videoData = response.data.items[0];

        if (!videoData) {
            return res.status(404).render('404', { message: 'Video not found' });
        }

        const video = {
            title: videoData.snippet.title,
            description: videoData.snippet.description,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            publishedAt: videoData.snippet.publishedAt
        };

        res.render('videoDetail', { video });
    } catch (error) {
        console.error('Error fetching video details:', error);
        res.status(500).render('500', { message: 'Internal Server Error' });
    }
};
