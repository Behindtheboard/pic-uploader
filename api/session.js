import { google } from 'googleapis';
import fetch from 'node-fetch';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { name, mimeType } = req.body;
    const key = JSON.parse(
      Buffer.from(process.env.local.SERVICE_ACCOUNT_KEY, 'base64').toString('utf8')
    );
    const auth = new google.auth.JWT(
      key.client_email,
      null,
      key.private_key,
      ['https://www.googleapis.com/auth/drive.file']
    );
    await auth.authorize();

    // Initiate a resumable upload session
    const initRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${auth.credentials.access_token}`,
          'Content-Type': 'application/json; charset=UTF-8',
          'X-Upload-Content-Type': mimeType
        },
        body: JSON.stringify({
          name,
          parents: [process.env.local.UPLOAD_FOLDER_ID]
        })
      }
    );
    if (!initRes.ok) {
      const errText = await initRes.text();
      throw new Error(`Failed to start session: ${initRes.status} ${errText}`);
    }
    const sessionUrl = initRes.headers.get('location');
    if (!sessionUrl) throw new Error('No session URL returned');

    res.status(200).json({ sessionUrl, token: auth.credentials.access_token });
  } catch (err) {
    console.error('🛑 /api/session error:', err);
    res.status(500).json({ error: err.message });
  }
}
