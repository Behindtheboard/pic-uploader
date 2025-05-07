// src/components/Gallery.jsx
import { useEffect, useState } from 'react';
import Masonry from 'react-masonry-css';
import './Gallery.css'; // see CSS below

export default function Gallery() {
  const [files, setFiles] = useState([]);
  useEffect(() => {
    fetch('/api/list')
      .then((r) => r.json())
      .then(setFiles)
      .catch(console.error);
  }, []);

  const cols = { default: 4, 1200: 3, 800: 2, 500: 1 };
  if (!files.length) return <p>No uploads yet.</p>;

  return (
    <Masonry
      breakpointCols={cols}
      className="my-masonry-grid"
      columnClassName="my-masonry-grid_column"
    >
      {files.map((f) => {
        const url = `https://drive.google.com/uc?export=view&id=${f.id}`;
        return f.mimeType.startsWith('video/') ? (
          <video key={f.id} src={url} controls style={{ width:'100%' }}/>
        ) : (
          <img key={f.id} src={url} alt={f.name} style={{ width:'100%' }}/>
        );
      })}
    </Masonry>
  );
}
