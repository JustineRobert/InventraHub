import { useEffect, useRef, useState } from 'react';
import jsQR from 'jsqr';

type BarcodeScannerProps = {
  onDetected: (code: string) => void;
};

export default function BarcodeScanner({ onDetected }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [supported, setSupported] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let stream: MediaStream | null = null;
    let animationFrame: number;

    const scanFrame = async () => {
      if (!videoRef.current || !canvasRef.current) {
        animationFrame = requestAnimationFrame(scanFrame);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (!context) {
        animationFrame = requestAnimationFrame(scanFrame);
        return;
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      const frame = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(frame.data, frame.width, frame.height);

      if (code?.data) {
        onDetected(code.data);
      }

      animationFrame = requestAnimationFrame(scanFrame);
    };

    const startScanner = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setSupported(true);
        scanFrame();
      } catch (err) {
        setError('Unable to access camera for barcode scanning.');
      }
    };

    startScanner();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      cancelAnimationFrame(animationFrame);
    };
  }, [onDetected]);

  if (error) return <div className="alert">{error}</div>;
  if (!supported) return <div className="alert">Barcode scanning is not supported by your browser. Please use a modern mobile browser.</div>;

  return (
    <>
      <video ref={videoRef} className="scanner-video" playsInline muted />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </>
  );
}
