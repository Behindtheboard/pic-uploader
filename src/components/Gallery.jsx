import React, { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import InfiniteScroll from "react-infinite-scroll-component";

export default function Gallery({ refreshKey }) {
  const [allFiles, setAllFiles] = useState([]);
  const [displayFiles, setDisplayFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const BATCH_SIZE = 8;

  // 1) Initial fetch – only images
  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_BASE_URL}/api/list`)
      .then((r) => r.json())
      .then((data) => {
        const images = data.filter((f) => !f.mimeType.startsWith("video/"));
        setAllFiles(images);
        setDisplayFiles(images.slice(0, BATCH_SIZE));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [refreshKey]);

  // 2) Listen for image uploads only
  useEffect(() => {
    const onFileUploaded = (e) => {
      const newFile = e.detail;
      if (newFile.mimeType.startsWith("video/")) return;
      setAllFiles((prev) => [newFile, ...prev]);
      setDisplayFiles((prev) => [newFile, ...prev]);
    };
    window.addEventListener("fileUploaded", onFileUploaded);
    return () => window.removeEventListener("fileUploaded", onFileUploaded);
  }, []);

  // 3) Infinite scroll loader
  const loadMore = () => {
    const next = allFiles.slice(
      displayFiles.length,
      displayFiles.length + BATCH_SIZE
    );
    setDisplayFiles((prev) => [...prev, ...next]);
  };

  if (loading) return <p>Loading gallery…</p>;
  if (!allFiles.length) return <p>No images yet.</p>;

  const cols = { default: 4, 1200: 3, 800: 2, 500: 1 };

  return (
    <InfiniteScroll
      dataLength={displayFiles.length}
      next={loadMore}
      hasMore={displayFiles.length < allFiles.length}
      loader={<p>Loading more…</p>}
    >
      <Masonry
        breakpointCols={cols}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {displayFiles.map((file) => (
          <img
            key={file.id}
            src={`/api/image?id=${file.id}`}
            alt={file.name}
            style={{ width: "100%", display: "block", borderRadius: 4 }}
          />
        ))}
      </Masonry>
    </InfiniteScroll>
  );
}
