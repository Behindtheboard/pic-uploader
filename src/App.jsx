import Gallery from "./components/Gallery";
import FileUploader from "./components/FileUploader";

export default function App() {
  return (
    <>
    <h1>Hailey + Jason</h1>
      <div className="section" style={{ maxWidth: 400, margin: "2rem auto", textAlign: "center" }}>
        <h2>📷 Upload to our drive!</h2>
        <FileUploader />
      </div>

      <div className="section" style={{ padding: "2rem" }}>
        <h1>💌 Guest Gallery</h1>
        <Gallery />
      </div>
    </>
  );
}
