// api/upload.js
import { google } from 'googleapis'
import formidable from 'formidable'
import fs from 'fs'

export const config = { api: { bodyParser: false } }

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Method Not Allowed' })

  const form = new formidable.IncomingForm()
  form.parse(req, async (err, fields, files) => {
    if (err || !files.file)
      return res.status(400).json({ error: 'No file uploaded' })

    const stream = fs.createReadStream(files.file.filepath)
    const key = JSON.parse(
      Buffer.from(process.env.SERVICE_ACCOUNT_KEY, 'base64').toString()
    )
    const auth = new google.auth.JWT(
      key.client_email, null, key.private_key,
      ['https://www.googleapis.com/auth/drive.file']
    )
    const drive = google.drive({ version: 'v3', auth })

    try {
      const response = await drive.files.create({
        requestBody: {
          name: files.file.originalFilename,
          parents: [process.env.UPLOAD_FOLDER_ID],
        },
        media: { mimeType: files.file.mimetype, body: stream },
        fields: 'id'
      })
      res.status(200).json({ fileId: response.data.id })
    } catch (uploadErr) {
      console.error(uploadErr)
      res.status(500).json({ error: 'Upload failed' })
    }
  })
}
