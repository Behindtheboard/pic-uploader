import React, { useEffect, useState } from "react";
import Masonry from "react-masonry-css";

export default function Gallery() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/list")
      .then((r) => r.json())
      .then((data) => {
        setFiles(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const cols = { default: 4, 1200: 3, 800: 2, 500: 1 };

  if (loading) return <p>Loading gallery…</p>;
  if (!files.length) return <p>No uploads yet.</p>;

  return (
    <Masonry
      breakpointCols={cols}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {files.map((file) => {
        const url = `https://drive.google.com/uc?export=media&id=${file.id}`;
        return file.mimeType.startsWith("video/") ? (
          <video
            key={file.id}
            src={url}
            controls
            style={{ width: "100%", borderRadius: 4 }}
          />
        ) : (
          <img
            key={file.id}
            src={url}
            alt={file.name}
            style={{ width: "100%", display: "block", borderRadius: 4 }}
          />
        );
      })}
    </Masonry>
  );
}
