import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.render('home', { title: 'YouTube Video Downloader' });
});

export default router;
