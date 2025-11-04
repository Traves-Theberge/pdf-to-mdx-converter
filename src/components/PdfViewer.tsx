import React from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/thumbnail/lib/styles/index.css';

interface PdfViewerProps {
  pdfUrl: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ pdfUrl }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const zoomPluginInstance = zoomPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const thumbnailPluginInstance = thumbnailPlugin();

  // Use the installed pdfjs-dist version dynamically for the worker
  const workerUrl = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

  return (
    <div className="pdf-viewer">
      <Worker workerUrl={workerUrl}>
        <div style={{ height: '100%', width: '100%', position: 'absolute' }}>
          <Viewer
            fileUrl={pdfUrl}
            plugins={[
              defaultLayoutPluginInstance,
              zoomPluginInstance,
              pageNavigationPluginInstance,
              thumbnailPluginInstance,
            ]}
          />
        </div>
      </Worker>
    </div>
  );
};

export default PdfViewer;
