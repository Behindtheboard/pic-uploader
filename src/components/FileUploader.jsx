import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/FileUploader.css";

export default function FileUploader({ onAllComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadStatuses, setUploadStatuses] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});

  // Generate blob URLs for preview
  useEffect(() => {
    // revoke old URLs
    previewUrls.forEach((u) => u && URL.revokeObjectURL(u));

    if (selectedFiles.length === 0) {
      setPreviewUrls([]);
      return;
    }

    // create new blob URLs
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviewUrls(urls);
  }, [selectedFiles]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setSelectedFiles(files);
    setUploadStatuses({});
    setUploadProgress({});
  };

  const handleClear = () => {
    previewUrls.forEach((u) => u && URL.revokeObjectURL(u));
    setSelectedFiles([]);
    setPreviewUrls([]);
    setUploadStatuses({});
    setUploadProgress({});
  };

  const handleUploadAll = async () => {
    for (const file of selectedFiles) {
      const key = file.name;
      setUploadStatuses((s) => ({ ...s, [key]: "Initializing…" }));

      const { data } = await axios.post("/api/session", {
        name: file.name,
        mimeType: file.type,
      });
      const { sessionUrl, token } = data;

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
        .catch((err) => console.warn("Upload error ignored for", key, err));

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
      {!selectedFiles.length && (
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
        />
      )}

      {selectedFiles.length > 0 && (
        <div
          style={{
            textAlign: "left",
            marginTop: 16,
            border: "1px solid #ccc",
            padding: 8,
          }}
        >
          <h4>Selected Files:</h4>
          <ul id="preview" style={{ listStyle: "none", padding: 0 }}>
            {selectedFiles.map((file, idx) => {
              const url = previewUrls[idx];
              const isImage = file.type.startsWith("image/");
              const isVideo = file.type.startsWith("video/");
              return (
                <li
                  key={file.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  {isImage && url && (
                    <img
                      src={url}
                      alt={file.name}
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        marginRight: 12,
                      }}
                    />
                  )}
                  {isVideo && url && (
                    <video
                      src={url}
                      controls
                      preload="metadata"
                      style={{
                        width: 80,
                        height: 80,
                        objectFit: "cover",
                        marginRight: 12,
                      }}
                    />
                  )}
                  {!url && (
                    <div
                      style={{
                        width: 80,
                        height: 80,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#eee",
                        color: "#666",
                        marginRight: 12,
                        fontSize: "0.8em",
                        textAlign: "center",
                        padding: 4,
                      }}
                    >
                      {/* �<br />
                      {file.name} */}
                    </div>
                  )}

                  <div style={{ flex: 1 }}>
                    {/* <div>{file.name}</div> */}
                    {uploadStatuses[file.name] && (
                      <div style={{ fontSize: "0.9em", marginTop: 4 }}>
                        {uploadStatuses[file.name]}
                      </div>
                    )}
                    {uploadProgress[file.name] != null && (
                      <progress
                        value={uploadProgress[file.name]}
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
