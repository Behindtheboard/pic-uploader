import React, { useState } from "react";
import axios from "axios";
import Gallery from "./components/Gallery";

export default function App() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  const upload = async (file) => {
    const form = new FormData();
    form.append("file", file);

    setStatus("Uploading...");
    try {
      const resp = await axios.post("/api/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          setProgress(Math.round((e.loaded * 100) / e.total));
        },
      });
      setStatus(`✔️ Uploaded! ID: ${resp.data.fileId}`);
    } catch (e) {
      console.error(e);
      setStatus("❌ Upload failed");
    }
  };

  return (
    <>
      <div style={{ maxWidth: 400, margin: "2rem auto", textAlign: "center" }}>
        <h2>📷 Upload to My Drive</h2>
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => e.target.files[0] && upload(e.target.files[0])}
        />

        {status && <p>{status}</p>}
        {status === "Uploading..." && (
          <progress value={progress} max="100" style={{ width: "100%" }} />
        )}
      </div>
      <div style={{ padding: "2rem" }}>
        <h1>💌 Guest Gallery</h1>
        <Gallery />
      </div>
    </>
  );
}
