import express from 'express';
import path from 'path';
import youtubeRouter from './routes/youtube.js';

const app = express();

app.set('view engine', 'ejs');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('home', { title: 'YouTube Downloader' });
});

app.use('/api/youtube', youtubeRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
