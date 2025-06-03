const express = require('express');
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const downloadDir = path.join(__dirname, '..', 'downloads');
if (!fs.existsSync(downloadDir)) {
  fs.mkdirSync(downloadDir);
}

app.post('/download', async (req, res) => {
  const { fileUrl } = req.body;
  if (!fileUrl) return res.status(400).send({ error: 'No URL provided' });

  try {
    const fileName = path.basename(fileUrl.split('?')[0]);
    const filePath = path.join(downloadDir, fileName);

    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      res.status(200).send({ message: 'Download complete', fileName });
    });

    writer.on('error', () => {
      res.status(500).send({ error: 'Failed to write file' });
    });
  } catch (err) {
    res.status(500).send({ error: 'Download failed', detail: err.message });
  }
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000${PORT}');
});
