// components/Gallery.js
import React, { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';

export default function Gallery() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/list')
      .then((r) => r.json())
      .then((data) => {
        setFiles(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // breakpoints for responsive columns
  const breakpointCols = {
    default: 4,
    1200: 3,
    800: 2,
    500: 1,
  };

  if (loading) return <p>Loading gallery…</p>;
  if (!files.length) return <p>No uploads yet.</p>;

  return (
    <Masonry
      breakpointCols={breakpointCols}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {files.map((file) => {
        const url = `https://drive.google.com/uc?export=view&id=${file.id}`;

        // render video vs image
        if (file.mimeType.startsWith('video/')) {
          return (
            <div key={file.id} className="masonry-item">
              <video
                src={url}
                controls
                style={{ width: '100%', borderRadius: 4 }}
              />
            </div>
          );
        } else {
          return (
            <div key={file.id} className="masonry-item">
              <img
                src={url}
                alt={file.name}
                style={{ width: '100%', display: 'block', borderRadius: 4 }}
              />
            </div>
          );
        }
      })}
    </Masonry>
  );
}
