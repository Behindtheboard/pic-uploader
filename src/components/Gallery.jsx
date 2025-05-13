import React, { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import InfiniteScroll from "react-infinite-scroll-component";

export default function Gallery({ refreshKey }) {
  const [allFiles, setAllFiles] = useState([]);
  const [displayFiles, setDisplayFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const BATCH_SIZE = 8;

  // 1) Fetch once (or you could fetch page-by-page from your API)
  useEffect(() => {
    setLoading(true);
    fetch("/api/list")
      .then((r) => r.json())
      .then((data) => {
        setAllFiles(data);
        setDisplayFiles(data.slice(0, BATCH_SIZE));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [refreshKey]);

  // 2) Handler to load the next batch
  const loadMore = () => {
    const nextSlice = allFiles.slice(
      displayFiles.length,
      displayFiles.length + BATCH_SIZE
    );
    setDisplayFiles((prev) => [...prev, ...nextSlice]);
  };

  if (loading) return <p>Loading gallery…</p>;
  if (!allFiles.length) return <p>No uploads yet.</p>;

  const cols = { default: 4, 1200: 3, 800: 2, 500: 1 };

  return (
    <InfiniteScroll
      dataLength={displayFiles.length}
      next={loadMore}
      hasMore={displayFiles.length < allFiles.length}
      loader={<p>Loading more…</p>}
      // You can also set `scrollThreshold="200px"` to trigger before the bottom
    >
      <Masonry
        breakpointCols={cols}
        className="my-masonry-grid"
        columnClassName="my-masonry-grid_column"
      >
        {displayFiles.map((file) => {
          const url = `/api/image?id=${file.id}`;
          if (file.mimeType.startsWith("video/")) {
            // assume your list API also returns a thumbnailLink, or you have one generated server-side
            const poster = file.thumbnailLink || "/placeholder-thumb.png";

            return (
              <video
                key={file.id}
                style={{ width: "100%", borderRadius: 4, cursor: "pointer" }}
                controls
                preload="none"
                poster={poster}
                // optional: start playing on click
                onClick={(e) => e.currentTarget.play()}
              >
                <source src={`/api/video?id=${file.id}`} type={file.mimeType} />
                Your browser does not support HTML5 video.
              </video>
            );
          }

          // images as before…
          return (
            <img
              key={file.id}
              src={url}
              alt={file.name}
              style={{ width: "100%", display: "block", borderRadius: 4 }}
            />
          );
        })}
      </Masonry>
    </InfiniteScroll>
  );
}
