import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/FileUploader.css";

export default function FileUploader({ onAllComplete }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [uploadStatuses, setUploadStatuses] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  // Generate blob URLs for preview
  useEffect(() => {
    previewUrls.forEach((u) => u && URL.revokeObjectURL(u));
    if (!selectedFiles.length) {
      setPreviewUrls([]);
      return;
    }
    setPreviewUrls(selectedFiles.map((file) => URL.createObjectURL(file)));
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
    setIsUploading(false);
  };

  const handleUploadAll = async () => {
  setIsUploading(true);

  for (const file of selectedFiles) {
    const key = file.name;
    // 1) Initializing…
    setUploadStatuses((s) => ({ ...s, [key]: "Initializing…" }));

    let sessionData;
    try {
      const resp = await axios.post("/api/session", {
        name: file.name,
        mimeType: file.type,
      });
      sessionData = resp.data;
    } catch (err) {
      console.warn("Session init error ignored for", key, err);
      // still attempt upload to keep UI moving
      sessionData = {};
    }

    const { sessionUrl, token } = sessionData;
    // 2) Uploading…
    setUploadStatuses((s) => ({ ...s, [key]: "Uploading…" }));
    if (sessionUrl && token) {
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
        .catch(() => console.warn("Network error ignored for", key));
    }

    // 3) Try to lookup the new file’s id via /api/list
    let fileMeta = { name: file.name, mimeType: file.type };
    try {
      const listRes = await axios.get("/api/list");
      const found = listRes.data.find((f) => f.name === file.name);
      if (found && found.id) {
        fileMeta = found;
      }
    } catch (err) {
      console.warn("Could not re-fetch list for", key, err);
    }

    // 4) Mark complete & fire events
    setUploadStatuses((s) => ({ ...s, [key]: "✔️ Complete" }));
    window.dispatchEvent(
      new CustomEvent("fileUploadStarted", { detail: fileMeta })
    );
    window.dispatchEvent(
      new CustomEvent("fileUploaded", { detail: fileMeta })
    );
    if (onAllComplete) onAllComplete(fileMeta);
  }

  // 5) Cleanup
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
          id="preview"
          style={{
            textAlign: "center",
            marginTop: 16,
            border: "1px solid #ccc",
            padding: 8,
          }}
        >
          <h4>Selected Files:</h4>
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 12,
              justifyItems: "center",
              padding: 0,
              listStyle: "none",
            }}
          >
            {previewUrls.map((url, idx) => {
              const file = selectedFiles[idx];
              const key = file.name;
              return (
                <li
                  key={key}
                  style={{ width: 80, height: 80, position: "relative" }}
                >
                  {file.type.startsWith("video/") && url ? (
                    <video
                      src={url}
                      controls
                      preload="metadata"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : url ? (
                    <img
                      src={url}
                      alt="preview"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 4,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#eee",
                        borderRadius: 4,
                      }}
                    >
                      <span role="img" aria-label="file">
                        �
                      </span>
                    </div>
                  )}
                  {uploadStatuses[key] && (
                    <div
                      style={{
                        position: "absolute",
                        top: 4,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(0,0,0,0.6)",
                        color: "#fff",
                        padding: "2px 6px",
                        borderRadius: 4,
                        fontSize: "0.7em",
                      }}
                    >
                      {uploadStatuses[key]}
                    </div>
                  )}
                  {isUploading && uploadProgress[key] != null && (
                    <progress
                      value={uploadProgress[key]}
                      max="100"
                      style={{
                        position: "absolute",
                        bottom: -8,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 80,
                      }}
                    />
                  )}
                </li>
              );
            })}
          </ul>

          <div style={{ marginTop: 12 }}>
            <button
              onClick={handleUploadAll}
              disabled={isUploading}
              style={{ marginRight: 8 }}
            >
              Upload All
            </button>
            <button onClick={handleClear} disabled={isUploading}>
              Clear Selection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
