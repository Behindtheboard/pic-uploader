// api/upload.js
import { google } from 'googleapis';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' });

  try {
    await new Promise((resolve, reject) => {
      const form = new formidable.IncomingForm();
      form.parse(req, async (err, fields, files) => {
        if (err) return reject(err);
        if (!files.file) return reject(new Error('No file was uploaded'));

        const stream = fs.createReadStream(files.file.filepath);
        const keyJson = Buffer.from(
          process.env.SERVICE_ACCOUNT_KEY, 'base64'
        ).toString();

        let key;
        try {
          key = JSON.parse(keyJson);
        } catch (parseErr) {
          return reject(new Error('Invalid SERVICE_ACCOUNT_KEY JSON'));
        }

        const auth = new google.auth.JWT(
          key.client_email,
          null,
          key.private_key,
          ['https://www.googleapis.com/auth/drive.file']
        );
        const drive = google.drive({ version: 'v3', auth });

        try {
          const response = await drive.files.create({
            requestBody: {
              name: files.file.originalFilename,
              parents: [process.env.UPLOAD_FOLDER_ID],
            },
            media: {
              mimeType: files.file.mimetype,
              body: stream,
            },
            fields: 'id',
          });
          res.status(200).json({ fileId: response.data.id });
          resolve();
        } catch (uploadErr) {
          reject(uploadErr);
        }
      });
    });
  } catch (err) {
    console.error('🛑 /api/upload error:', err);
    return res.status(500).json({ error: err.message });
  }
}
