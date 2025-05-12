// api/image.js
import { google } from 'googleapis';

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).send('Missing file id');
  }

  // Decode your service account JSON
  const key = JSON.parse(
    Buffer.from(process.env.local.SERVICE_ACCOUNT_KEY, 'base64').toString()
  );
  const auth = new google.auth.JWT(
    key.client_email,
    null,
    key.private_key,
    ['https://www.googleapis.com/auth/drive.readonly']
  );
  await auth.authorize();

  const drive = google.drive({ version: 'v3', auth });

  try {
    // Fetch the raw file bytes
    const resp = await drive.files.get(
      { fileId: id, alt: 'media' },
      { responseType: 'stream' }
    );

    // Set the correct headers for the browser
    res.setHeader('Content-Type', resp.headers['content-type']);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Pipe the file stream to the response
    resp.data.pipe(res);
  } catch (err) {
    console.error('🛑 /api/image error:', err);
    res.status(500).send('Error fetching image');
  }
}
