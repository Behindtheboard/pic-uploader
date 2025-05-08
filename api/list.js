// api/list.js
import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {

    console.log('🔑 SERVICE_ACCOUNT_KEY present?', !!process.env.SERVICE_ACCOUNT_KEY);
    console.log('📂 UPLOAD_FOLDER_ID:', process.env.UPLOAD_FOLDER_ID);
    
    const keyJson = Buffer.from(
      process.env.SERVICE_ACCOUNT_KEY,
      "base64"
    ).toString("utf8");
    const key = JSON.parse(keyJson);

    const auth = new google.auth.JWT(key.client_email, null, key.private_key, [
      "https://www.googleapis.com/auth/drive.readonly",
    ]);
    const drive = google.drive({ version: "v3", auth });

    const listRes = await drive.files.list({
      q: `'${process.env.UPLOAD_FOLDER_ID}' in parents and trashed=false`,
      fields: "files(id,name,mimeType,createdTime)",
      orderBy: "createdTime desc",
      pageSize: 1000,
    });

    console.log('🔍 Drive files.list returned:', JSON.stringify(listRes.data.files, null, 2));


    return res.status(200).json(listRes.data.files);
  } catch (err) {
    console.error("🛑 /api/list error:", err);
    return res.status(500).json({ error: err.message });
  }
}
