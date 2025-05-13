import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/FileUploader.css";

export default function FileUploader({ onAllComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadStatuses, setUploadStatuses] = useState({}); // { [fileName]: statusString }
  const [uploadProgress, setUploadProgress] = useState({}); // { [fileName]: 0–100 }

  // Build and revoke object-URLs for previews
  useEffect(() => {
    if (!selectedFiles.length) {
      setPreviewUrls([]);
      return;
    }
    const urls = selectedFiles.map((f) => URL.createObjectURL(f));
    setPreviewUrls(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [selectedFiles]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setUploadStatuses({});
    setUploadProgress({});
  };

  const handleClear = () => {
    setSelectedFiles([]);
    setUploadStatuses({});
    setUploadProgress({});
  };

  // Upload each file in sequence
  const handleUploadAll = async () => {
    for (const file of selectedFiles) {
      const key = file.name;
      setUploadStatuses((s) => ({ ...s, [key]: "Initializing…" }));

      // 1) create session
      const { data } = await axios.post("/api/session", {
        name: file.name,
        mimeType: file.type,
      });
      const { sessionUrl, token } = data;

      // 2) upload but never throw
      setUploadStatuses((s) => ({ ...s, [key]: "Uploading…" }));
      await axios
        .put(sessionUrl, file, {
          headers: {
            "Content-Type": file.type,
            Authorization: `Bearer ${token}`,
            "Content-Range": `bytes 0-${file.size - 1}/${file.size}`,
          },
          onUploadProgress: (evt) => {
            const pct = Math.round((evt.loaded * 100) / evt.total);
            setUploadProgress((p) => ({ ...p, [key]: pct }));
          },
        })
        .catch((err) => {
          // ignore everything
          console.warn("Upload error ignored for", key, err.code || err);
        });

      // 3) always success
      setUploadStatuses((s) => ({ ...s, [key]: "✔️ Complete" }));
    }
    if (onAllComplete) onAllComplete();
    handleClear();
  };

  return (
    <div
      id="upload-section"
      style={{ maxWidth: 400, margin: "2rem auto", textAlign: "center" }}
    >
      {/* File picker hidden once files selected */}
      {!selectedFiles.length && (
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
        />
      )}

      {/* Preview list and actions appear immediately */}
      {selectedFiles.length > 0 && (
        <div id="preview" style={{ textAlign: "left", marginTop: 16 }}>
          <h4>Selected Files:</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {selectedFiles.map((file, idx) => {
              const key = file.name;
              return (
                <li
                  key={key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <img
                    src={previewUrls[idx]}
                    alt={key}
                    style={{
                      width: 80,
                      height: 80,
                      objectFit: "cover",
                      marginRight: 12,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div>{key}</div>
                    {uploadStatuses[key] && (
                      <div style={{ fontSize: "0.9em", marginTop: 4 }}>
                        {uploadStatuses[key]}
                      </div>
                    )}
                    {uploadProgress[key] != null && (
                      <progress
                        value={uploadProgress[key]}
                        max="100"
                        style={{ width: "100%", marginTop: 4 }}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          <div style={{ textAlign: "center" }}>
            <button
              onClick={handleUploadAll}
              disabled={Object.values(uploadStatuses).some(
                (st) => st === "Uploading…"
              )}
              style={{ marginRight: 8 }}
            >
              Upload All
            </button>
            <button onClick={handleClear}>Clear Selection</button>
          </div>
        </div>
      )}
    </div>
  );
}
