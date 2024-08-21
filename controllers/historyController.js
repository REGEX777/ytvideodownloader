import fs from 'fs';
import path from 'path';

export const getDownloadHistory = (req, res) => {
    const historyPath = path.resolve(process.cwd(), 'downloads', 'history.json');
    
    if (fs.existsSync(historyPath)) {
        const history = JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
        res.render('history', { title: 'Download History', history });
    } else {
        res.render('history', { title: 'Download History', history: [] });
    }
};
