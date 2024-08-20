import 'dotenv/config';
import express from 'express';
import path from 'path';

import indexRoute from './routes/index.js';
import downloadRoute from './routes/download.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');

app.use(express.static(path.join(path.resolve(), 'public')));
app.use(express.urlencoded({ extended: true }));

app.use('/', indexRoute);
app.use('/download', downloadRoute);

app.use((req, res, next) => {
    res.status(404).render('error', { message: 'Page not found' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
