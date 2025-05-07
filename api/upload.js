import { google } from "googleapis";
import formidable from "formidable";
import fs from "fs";

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { file } = await new Promise((resolve, reject) => {
      const form = formidable({ multiples: false });
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        if (!files.file) return reject(new Error("No file uploaded"));
        resolve(files);
      });
    });

    const stream = fs.createReadStream(file.filepath);
    const keyJson = Buffer.from(
      process.env.SERVICE_ACCOUNT_KEY,
      "base64"
    ).toString("utf8");

    let key;
    try {
      key = JSON.parse(keyJson);
    } catch {
      throw new Error("Invalid SERVICE_ACCOUNT_KEY JSON");
    }

    const auth = new google.auth.JWT(key.client_email, null, key.private_key, [
      "https://www.googleapis.com/auth/drive.file",
    ]);
    const drive = google.drive({ version: "v3", auth });

    const driveRes = await drive.files.create({
      requestBody: {
        name: file.originalFilename,
        parents: [process.env.UPLOAD_FOLDER_ID],
      },
      media: { mimeType: file.mimetype, body: stream },
      fields: "id",
    });

    return res.status(200).json({ fileId: driveRes.data.id });
  } catch (err) {
    console.error("🛑 /api/upload error:", err);
    return res.status(500).json({ error: err.message });
  }
}
