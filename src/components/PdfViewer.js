import { Worker, Viewer } from '@react-pdf-viewer/core';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { pageNavigationPlugin } from '@react-pdf-viewer/page-navigation';
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';
import '@react-pdf-viewer/thumbnail/lib/styles/index.css';

const PdfViewer = ({ pdfUrl }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const zoomPluginInstance = zoomPlugin();
  const pageNavigationPluginInstance = pageNavigationPlugin();
  const thumbnailPluginInstance = thumbnailPlugin();

  return (
    <div className="pdf-viewer">
      <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
        <div style={{ height: '100%' }}>
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