// __mocks__/pdfjs-dist.js

// This is a simplified mock for pdfjs-dist
// It needs to be more sophisticated for the actual tests,
// allowing tests to specify the content of items.

const mockGetTextContent = jest.fn().mockResolvedValue({ items: [] });
const mockGetViewport = jest.fn().mockReturnValue({ width: 600, height: 800, scale: 1 });

const mockGetPage = jest.fn().mockResolvedValue({
  getTextContent: mockGetTextContent,
  getViewport: mockGetViewport,
  // Add other methods/properties if your code uses them
});

const mockGetDocument = jest.fn().mockResolvedValue({
  numPages: 1,
  getPage: mockGetPage,
  // Add other methods/properties if your code uses them
  destroy: jest.fn().mockResolvedValue(undefined), // common method to be safe
});

module.exports = {
  getDocument: mockGetDocument,
  // Export other things if needed, like GlobalWorkerOptions if you use them
  // For example:
  // GlobalWorkerOptions: {
  //   workerSrc: 'pdf.worker.js', // This will be mocked by pdfjs.worker.entry.js
  // },

  // Re-export the mock functions if tests need to manipulate them directly
  // (though it's often better to configure them via getDocument)
  __mockGetTextContent: mockGetTextContent,
  __mockGetPage: mockGetPage,
  __mockGetDocument: mockGetDocument,
  __mockGetViewport: mockGetViewport,
};
