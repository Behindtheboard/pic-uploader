// api/list.js
import { google } from 'googleapis'

export default async function handler(req, res) {
  if (req.method !== 'GET')
    return res.status(405).json({ error: 'Method Not Allowed' })

  const key = JSON.parse(
    Buffer.from(process.env.SERVICE_ACCOUNT_KEY, 'base64').toString()
  )
  const auth = new google.auth.JWT(
    key.client_email, null, key.private_key,
    ['https://www.googleapis.com/auth/drive.readonly']
  )
  const drive = google.drive({ version: 'v3', auth })

  try {
    const listRes = await drive.files.list({
      q: `'${process.env.UPLOAD_FOLDER_ID}' in parents and trashed=false`,
      fields: 'files(id,name,mimeType,createdTime)',
      orderBy: 'createdTime desc',
      pageSize: 1000,
    })
    res.status(200).json(listRes.data.files)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Unable to list files' })
  }
}
