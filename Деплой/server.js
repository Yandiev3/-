const express = require('express');
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(express.static('public'));

app.get('/keywords', (req, res) => {
    const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8'));
    const keyword = req.query.keyword;
    if (data[keyword]) {
        res.json(data[keyword]);
    } else {
        res.status(404).json({ error: 'Keyword not found' });
    }
});

app.get('/download', async (req, res) => {
    const url = req.query.url;
    try {
        const response = await axios.get(url, { responseType: 'arraybuffer', onDownloadProgress: (progressEvent) => {
            res.write(JSON.stringify({
                total: progressEvent.total,
                loaded: progressEvent.loaded
            }));
        }});
        res.end(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to download content' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});