import React, { useState } from "react";
import axios from "axios";
import Gallery from "./components/Gallery";
import FileUploader from "./components/FileUploader";

export default function App() {
  return (
    <>
      <div style={{ maxWidth: 400, margin: "2rem auto", textAlign: "center" }}>
        <h2>📷 Upload to My Drive</h2>
        <FileUploader />
      </div>

      <div style={{ padding: "2rem" }}>
        <h1>💌 Guest Gallery</h1>
        <Gallery />
      </div>
    </>
  );
}
