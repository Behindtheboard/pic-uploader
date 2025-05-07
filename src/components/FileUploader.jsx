import React, { useState } from 'react';
import axios from 'axios';

export default function FileUploader() {
  const [status, setStatus] = useState('');
  const [progress, setProgress] = useState(0);

  const upload = async (file) => {
    try {
      setStatus('Initializing upload session…');
      const sessionRes = await axios.post('/api/session', {
        name: file.name,
        mimeType: file.type,
      });
      const { sessionUrl, token } = sessionRes.data;

      setStatus('Uploading…');
      const res = await fetch(sessionUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type,
          'Authorization': `Bearer ${token}`,
          'Content-Range': `bytes 0-${file.size - 1}/${file.size}`,
        },
        body: file,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${res.status} ${text}`);
      }
      setStatus('✔️ Upload complete!');
    } catch (e) {
      setStatus(`❌ ${e.message}`);
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
      {status.startsWith('Uploading') && (
        <progress value={progress} max="100" style={{ width: '100%' }} />
      )}
    </div>
  );
}