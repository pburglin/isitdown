import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { checkURLStatus } from './src/utils.js';
import fs from 'fs';

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distPath = join(__dirname, 'dist');

app.use(express.json());

// Check if the dist directory exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  app.get('*', (req, res) => {
    res.sendFile(join(distPath, 'index.html'));
  });
} else {
  console.error("The 'dist' directory does not exist. Please run 'npm run build' first.");
  app.get('*', (req, res) => {
    res.status(500).send('The frontend build is missing. Please run `npm run build` first.');
  });
}


app.post('/api/check', async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).send({ error: 'URL is required' });
  }
  try {
    const status = await checkURLStatus(url);
    res.send(status);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
