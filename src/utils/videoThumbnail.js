// src/utils/videoThumbnail.js

export default function generateVideoThumbnail(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");

    video.src = url;
    video.preload = "metadata"; // only fetch headers
    video.muted = true;
    video.playsInline = true;

    // Once we have enough data to render the first frame…
    video.addEventListener("loadeddata", () => {
      // draw it
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url);
          if (!blob) return reject(new Error("Failed to generate thumbnail"));
          const thumbUrl = URL.createObjectURL(blob);
          resolve(thumbUrl);
        },
        "image/jpeg",
        0.75
      );
    });

    video.addEventListener("error", (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    });
  });
}
