import React, { useEffect, useState } from "react";
import { loadGapiInsideDOM } from "gapi-script";
import FileUploader from "./components/FileUploader";

const CLIENT_ID = "YOUR_CLIENT_ID.apps.googleusercontent.com";
const API_KEY = "YOUR_API_KEY";
const SCOPES = "https://www.googleapis.com/auth/drive.file";
const DISCOVERY_DOCS = [
  "https://www.googleapis.com/discovery/v1/apis/drive/v3/rest",
];

function App() {
  const [gapiReady, setGapiReady] = useState(false);
  const [isSignedIn, setSignedIn] = useState(false);

  useEffect(() => {
    async function initClient() {
      await loadGapiInsideDOM();
      window.gapi.load("client:auth2", async () => {
        await window.gapi.client.init({
          apiKey: API_KEY,
          clientId: CLIENT_ID,
          discoveryDocs: DISCOVERY_DOCS,
          scope: SCOPES,
        });
        const auth = window.gapi.auth2.getAuthInstance();
        auth.isSignedIn.listen(setSignedIn);
        setSignedIn(auth.isSignedIn.get());
        setGapiReady(true);
      });
    }
    initClient();
  }, []);

  const handleAuthClick = () => window.gapi.auth2.getAuthInstance().signIn();
  const handleSignout = () => window.gapi.auth2.getAuthInstance().signOut();

  // … upload logic below …

  return (
    <div style={{ padding: 20 }}>
      {!gapiReady && <p>Loading…</p>}
      {gapiReady && !isSignedIn && (
        <button onClick={handleAuthClick}>Sign in to Google Drive</button>
      )}
      {isSignedIn && (
        <>
          <button onClick={handleSignout}>Sign Out</button>
          <FileUploader />
        </>
      )}
    </div>
  );
}

export default App;
