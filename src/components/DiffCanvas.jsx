import { useEffect, useRef } from 'react';

export default function DiffCanvas({ beforeImg, afterImg, threshold, onDiffReady }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!beforeImg || !afterImg) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = Math.max(beforeImg.naturalWidth, afterImg.naturalWidth);
    const height = Math.max(beforeImg.naturalHeight, afterImg.naturalHeight);

    canvas.width = width;
    canvas.height = height;

    const offA = document.createElement('canvas');
    offA.width = width;
    offA.height = height;
    const ctxA = offA.getContext('2d');
    ctxA.drawImage(beforeImg, 0, 0, width, height);
    const dataA = ctxA.getImageData(0, 0, width, height);

    const offB = document.createElement('canvas');
    offB.width = width;
    offB.height = height;
    const ctxB = offB.getContext('2d');
    ctxB.drawImage(afterImg, 0, 0, width, height);
    const dataB = ctxB.getImageData(0, 0, width, height);

    const diffData = ctx.createImageData(width, height);
    const pixelsA = dataA.data;
    const pixelsB = dataB.data;
    const diff = diffData.data;
    let diffCount = 0;
    const totalPixels = width * height;

    for (let i = 0; i < pixelsA.length; i += 4) {
      const dr = Math.abs(pixelsA[i] - pixelsB[i]);
      const dg = Math.abs(pixelsA[i + 1] - pixelsB[i + 1]);
      const db = Math.abs(pixelsA[i + 2] - pixelsB[i + 2]);
      const distance = Math.sqrt(dr * dr + dg * dg + db * db);

      if (distance > threshold) {
        diff[i] = 255;
        diff[i + 1] = 50;
        diff[i + 2] = 50;
        diff[i + 3] = 200;
        diffCount++;
      } else {
        const gray = Math.round(
          pixelsA[i] * 0.3 + pixelsA[i + 1] * 0.59 + pixelsA[i + 2] * 0.11
        );
        diff[i] = gray;
        diff[i + 1] = gray;
        diff[i + 2] = gray;
        diff[i + 3] = 128;
      }
    }

    ctx.putImageData(diffData, 0, 0);

    const percentage = ((diffCount / totalPixels) * 100).toFixed(2);
    onDiffReady({ percentage, dataUrl: canvas.toDataURL('image/png') });
  }, [beforeImg, afterImg, threshold, onDiffReady]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', borderRadius: '12px', display: 'block' }}
    />
  );
}
