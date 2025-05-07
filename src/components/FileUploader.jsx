import React, { useState } from 'react';
import axios from 'axios';

export default function FileUploader() {
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);

  const upload = async (file) => {
    const form = new FormData();
    form.append('file', file);
    setStatus('Uploading…');
    try {
      const resp = await axios.post('/api/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total))
      });
      setStatus(`✔️ Uploaded! ID: ${resp.data.fileId}`);
    } catch (e) {
      setStatus(`❌ Upload failed: ${e.response?.data?.error || e.message}`);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', textAlign: 'center' }}>
      <input
        type="file"
        accept="image/*,video/*"
        onChange={(e) => e.target.files[0] && upload(e.target.files[0])}
      />
      {status && <p>{status}</p>}
      {status === 'Uploading…' && (
        <progress value={progress} max="100" style={{ width: '100%' }} />
      )}
    </div>
  );
}
