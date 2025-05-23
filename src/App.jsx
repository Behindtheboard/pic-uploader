import Gallery from "./components/Gallery";
import FileUploader from "./components/FileUploader";
import { useState } from "react";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);
  const handleUploadsComplete = () => {
    setRefreshKey((k) => k + 1);
  };
  return (
    <>
      <h1>Hailey + Jason</h1>
      <div
        className="section"
        style={{ maxWidth: 400, margin: "2rem auto", textAlign: "center" }}
      >
        <h2>📷 Upload to our drive!</h2>
        <p>Please be careful to make sure you upload the correct photos or videos!</p>
        <p>For video upload, wait a couple of seconds once you tap add. The videos are being copied onto the preview for you to upload.</p>
        <FileUploader onAllComplete={handleUploadsComplete} />
      </div>

      <div className="section" style={{ padding: "2rem" }}>
        <h1>💌 Guest Gallery</h1>
        <Gallery refreshKey={refreshKey} />
      </div>
    </>
  );
}
