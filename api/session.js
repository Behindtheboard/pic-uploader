import { google } from "googleapis";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { name, mimeType } = req.body;
    const key = JSON.parse(
      Buffer.from(process.env.SERVICE_ACCOUNT_KEY, "base64").toString("utf8")
    );
    const auth = new google.auth.JWT(key.client_email, null, key.private_key, [
      "https://www.googleapis.com/auth/drive.file",
    ]);
    await auth.authorize();
    const drive = google.drive({ version: "v3", auth });

    const resp = await drive.files.create(
      { requestBody: { name, parents: [process.env.UPLOAD_FOLDER_ID] } },
      {
        params: { uploadType: "resumable" },
        headers: { "X-Upload-Content-Type": mimeType },
      }
    );

    const sessionUrl = resp.headers.location;
    const token = auth.credentials.access_token;
    res.status(200).json({ sessionUrl, token });
  } catch (err) {
    console.error("🛑 /api/session error:", err);
    res.status(500).json({ error: err.message });
  }
}
