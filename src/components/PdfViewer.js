"use client";

import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';

const PdfViewer = ({ pdfUrl }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const pdfJsVersion = '3.11.174'; // Use the installed version of pdfjs-dist

  return (
    <Worker workerUrl={`https://unpkg.com/pdfjs-dist@${pdfJsVersion}/build/pdf.worker.min.js`}>
      <div className="pdf-viewer">
        <Viewer fileUrl={pdfUrl} plugins={[defaultLayoutPluginInstance]} />
      </div>
    </Worker>
  );
};

export default PdfViewer;
