import React, {useState } from 'react';

export default function FileUploader() {
    const [status, setStatus] = useState('');
  
    const uploadFile = async (file) => {
      const accessToken = window.gapi.client.getToken().access_token;
      const metadata = {
        name: file.name,
        mimeType: file.type,
        // optional: parents: ['FOLDER_ID'] to put into a specific folder
      };
  
      // Build multipart request body
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);
  
      setStatus('Uploading…');
      const res = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id',
        {
          method: 'POST',
          headers: { Authorization: 'Bearer ' + accessToken },
          body: form,
        }
      );
      const data = await res.json();
      if (data.id) {
        setStatus(`✔️ Uploaded (file ID: ${data.id})`);
      } else {
        setStatus(`❌ Upload failed: ${JSON.stringify(data)}`);
      }
    };
  
    return (
      <div style={{ marginTop: 20 }}>
        <input
          type="file"
          onChange={(e) => {
            if (e.target.files.length) uploadFile(e.target.files[0]);
          }}
        />
        <p>{status}</p>
      </div>
    );
  }
  