// src/utils/__tests__/pdfToMdxConverter.test.js
// src/utils/__tests__/pdfToMdxConverter.test.js
import { convertPdfToMdx } from '../pdfToMdxConverter';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Mock pdfjsLib according to the subtask's example structure
jest.mock('pdfjs-dist/build/pdf', () => ({
  getDocument: jest.fn(), // This will be the main mock function we configure per test suite or test
  // GlobalWorkerOptions might be needed if your code uses it, but for basic unit tests, often not.
  // GlobalWorkerOptions: { workerSrc: 'test-pdf-worker.js' } 
}));

describe('convertPdfToMdx', () => {
  let mockSetProgress;
  let mockGetPage;
  let mockGetTextContent;
  let mockGetViewport;

  beforeEach(() => {
    mockSetProgress = jest.fn();

    // Create fresh mocks for each test to avoid interference
    mockGetTextContent = jest.fn();
    mockGetViewport = jest.fn().mockReturnValue({ width: 600, height: 800, scale: 1 });
    mockGetPage = jest.fn().mockResolvedValue({
      getTextContent: mockGetTextContent,
      getViewport: mockGetViewport,
    });

    // Configure the top-level getDocument mock
    pdfjsLib.getDocument.mockReset(); // Reset any previous configurations
    // getDocument returns a "loading task" object, which has a .promise property
    pdfjsLib.getDocument.mockReturnValue({ 
      promise: Promise.resolve({
        numPages: 1,
        getPage: mockGetPage,
        destroy: jest.fn().mockResolvedValue(undefined), // Common method to mock
      }),
    });

    // Default to an empty page
    mockGetTextContent.mockResolvedValue({ items: [] });
  });

  test('should convert basic paragraph', async () => {
    mockGetTextContent.mockResolvedValueOnce({
      items: [
        { str: 'Hello world', transform: [12, 0, 0, 12, 50, 700], width: 100, height: 12, fontName: 'Times', fontSize: 12 },
      ],
    });

    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    expect(mdx.trim()).toBe('Hello world'); // The function adds \n\n, trim helps for simple cases
    expect(mockSetProgress).toHaveBeenCalledWith(100);
  });

  test('should correctly identify and format H1 headers', async () => {
    mockGetTextContent.mockResolvedValueOnce({
      items: [
        { str: 'Main Title', transform: [24, 0, 0, 24, 50, 750], width: 200, height: 24, fontName: 'Helvetica', fontSize: 24 },
      ],
    });
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    expect(mdx.trim()).toBe('# Main Title');
  });

  test('should correctly identify and format H2 headers', async () => {
    mockGetTextContent.mockResolvedValueOnce({
      items: [
        { str: 'Subtitle', transform: [20, 0, 0, 20, 50, 700], width: 150, height: 20, fontName: 'Helvetica', fontSize: 20 },
      ],
    });
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    expect(mdx.trim()).toBe('## Subtitle');
  });

  test('should correctly identify and format H3 headers', async () => {
    mockGetTextContent.mockResolvedValueOnce({
      items: [
        { str: 'Minor Section', transform: [16, 0, 0, 16, 50, 650], width: 120, height: 16, fontName: 'Helvetica', fontSize: 16 },
      ],
    });
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    expect(mdx.trim()).toBe('### Minor Section');
  });

  test('should handle text that is not a header as a paragraph', async () => {
    mockGetTextContent.mockResolvedValueOnce({
      items: [
        { str: 'Regular text.', transform: [12, 0, 0, 12, 50, 600], width: 100, height: 12, fontName: 'Times', fontSize: 12 },
      ],
    });
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    expect(mdx.trim()).toBe('Regular text.');
  });
  
  test('should correctly format unordered list items (bullet points)', async () => {
    mockGetTextContent.mockResolvedValueOnce({
      items: [
        // Ensure y values are distinct to be treated as separate lines by default logic before paragraph grouping
        { str: '• Item 1', transform: [12, 0, 0, 12, 50, 700], width: 100, height: 12, fontName: 'Times', fontSize: 12, y: 100 },
        { str: '* Item 2', transform: [12, 0, 0, 12, 50, 680], width: 100, height: 12, fontName: 'Times', fontSize: 12, y: 120 },
        { str: '- Item 3', transform: [12, 0, 0, 12, 50, 660], width: 100, height: 12, fontName: 'Times', fontSize: 12, y: 140 },
      ],
    });
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    const expectedMdx = [
      '* Item 1',
      '* Item 2',
      '* Item 3',
    ].join('\n');
    expect(mdx.trim()).toBe(expectedMdx);
  });

  test('should correctly format ordered list items (numbered and lettered)', async () => {
    mockGetTextContent.mockResolvedValueOnce({
      items: [
        { str: '1. First item', transform: [12, 0, 0, 12, 50, 700], width: 100, height: 12, fontName: 'Times', fontSize: 12, y:100 },
        { str: 'a. Sub item A', transform: [12, 0, 0, 12, 60, 680], width: 100, height: 12, fontName: 'Times', fontSize: 12, y:120 },
        { str: '2. Second item', transform: [12, 0, 0, 12, 50, 660], width: 100, height: 12, fontName: 'Times', fontSize: 12, y:140 },
      ],
    });
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    const expectedMdx = [
      '1. First item',
      'a. Sub item A',
      '2. Second item',
    ].join('\n');
    expect(mdx.trim()).toBe(expectedMdx);
  });

  test('should create paragraph breaks based on vertical spacing', async () => {
    // y values are calculated by extractLayoutInfo: viewport.height - item.transform[5]
    // For this test, we directly provide the `items` array as if it came from extractLayoutInfo
    // So the `y` values in the items should reflect the desired spacing.
    const items = [
        // Item 1: y = 100, height = 12. Bottom "edge" for spacing calc is roughly y + height = 112
        { str: 'Paragraph 1, Line 1.', transform: [12,0,0,12,50,700], width: 100, height: 12, fontName: 'Times', fontSize: 12, y: 100 },
        // Item 2: y = 150. Vertical space from prev = 150 - (100 + 12) = 38. Threshold = 12 * 0.5 = 6. This IS a break.
        { str: 'Paragraph 2, Line 1.', transform: [12,0,0,12,50,650], width: 100, height: 12, fontName: 'Times', fontSize: 12, y: 150 },
        // Item 3: y = 160. Vertical space from prev = 160 - (150 + 12) = -2 (overlap). This is NOT a break.
        // Let's adjust Item 3's y to ensure a small gap that is NOT a break
        // Item 3: y = 165. Vertical space from prev = 165 - (150 + 12) = 3. Threshold = 12 * 0.5 = 6. This is NOT a break.
        { str: 'Paragraph 2, Line 2.', transform: [12,0,0,12,50,635], width: 100, height: 12, fontName: 'Times', fontSize: 12, y: 165 },
        // Item 4: y = 200. Vertical space from prev = 200 - (165 + 12) = 23. Threshold = 12 * 0.5 = 6. This IS a break.
        { str: 'Paragraph 3, Line 1.', transform: [12,0,0,12,50,600], width: 100, height: 12, fontName: 'Times', fontSize: 12, y: 200 },
    ];
    mockGetTextContent.mockResolvedValueOnce({ items });

    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    const expectedMdx = [
      'Paragraph 1, Line 1.',
      '', 
      'Paragraph 2, Line 1. Paragraph 2, Line 2.',
      '',
      'Paragraph 3, Line 1.',
    ].join('\n').trim();
    expect(mdx.trim()).toBe(expectedMdx);
  });
  
  test('should handle multi-page documents', async () => {
    // Configure getDocument for 2 pages
    pdfjsLib.getDocument.mockReturnValueOnce({ // mockReturnValueOnce for the loading task
      promise: Promise.resolve({
        numPages: 2,
        getPage: mockGetPage, // Use the mockGetPage defined in beforeEach
        destroy: jest.fn().mockResolvedValue(undefined),
      }),
    });

    // Page 1 content
    mockGetPage.mockResolvedValueOnce({ // First call to getPage
      getTextContent: jest.fn().mockResolvedValue({
        items: [{ str: 'Page 1 content.', transform: [12,0,0,12,50,700], width: 100, height: 12, fontName: 'Times', fontSize: 12, y:100 }],
      }),
      getViewport: mockGetViewport, // Use the mockGetViewport
    });

    // Page 2 content
    mockGetPage.mockResolvedValueOnce({ // Second call to getPage
      getTextContent: jest.fn().mockResolvedValue({
        items: [{ str: 'Page 2 content.', transform: [12,0,0,12,50,700], width: 100, height: 12, fontName: 'Times', fontSize: 12, y:100 }],
      }),
      getViewport: mockGetViewport,
    });

    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    const expectedMdx = [
      'Page 1 content.',
      '',
      'Page 2 content.',
    ].join('\n').trim();
    expect(mdx.trim()).toBe(expectedMdx);
    expect(mockSetProgress).toHaveBeenCalledWith(50);
    expect(mockSetProgress).toHaveBeenCalledWith(100);
    expect(mockGetPage).toHaveBeenCalledTimes(2);
  });

  test('should handle empty page or no text items', async () => {
    // Default setup in beforeEach already mocks an empty page
    // mockGetTextContent.mockResolvedValueOnce({ items: [] }); // This is the default
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    expect(mdx.trim()).toBe('');
    expect(mockSetProgress).toHaveBeenCalledWith(100);
  });

  test('should call setProgress correctly for a single page document', async () => {
    mockGetTextContent.mockResolvedValueOnce({
      items: [{ str: 'Some text', transform: [12,0,0,12,50,700], width: 50, height: 12, fontName: 'Times', fontSize: 12, y:100 }],
    });
    await convertPdfToMdx('dummy.pdf', mockSetProgress);
    expect(mockSetProgress).toHaveBeenCalledTimes(1);
    expect(mockSetProgress).toHaveBeenCalledWith(100);
  });

  test('should call setProgress correctly for a multi-page document', async () => {
    pdfjsLib.getDocument.mockReturnValueOnce({ // mockReturnValueOnce for the loading task
      promise: Promise.resolve({
        numPages: 3,
        getPage: mockGetPage,
        destroy: jest.fn().mockResolvedValue(undefined),
      }),
    });
    
    // Mock getPage to be called 3 times, each resolving to a page with some text content
    // Each call to mockGetPage needs to return a new page object structure
    mockGetPage
      .mockResolvedValueOnce({ 
        getTextContent: jest.fn().mockResolvedValue({ items: [{ str: 'Text P1', transform: [12,0,0,12,0,0], width: 10, height: 12, fontName: 'Times', fontSize: 12, y:100 }] }),
        getViewport: mockGetViewport 
      })
      .mockResolvedValueOnce({ 
        getTextContent: jest.fn().mockResolvedValue({ items: [{ str: 'Text P2', transform: [12,0,0,12,0,0], width: 10, height: 12, fontName: 'Times', fontSize: 12, y:100 }] }),
        getViewport: mockGetViewport
      })
      .mockResolvedValueOnce({ 
        getTextContent: jest.fn().mockResolvedValue({ items: [{ str: 'Text P3', transform: [12,0,0,12,0,0], width: 10, height: 12, fontName: 'Times', fontSize: 12, y:100 }] }),
        getViewport: mockGetViewport
      });

    await convertPdfToMdx('dummy.pdf', mockSetProgress);
    
    expect(mockSetProgress).toHaveBeenCalledTimes(3);
    expect(mockSetProgress).toHaveBeenNthCalledWith(1, (1/3) * 100);
    expect(mockSetProgress).toHaveBeenNthCalledWith(2, (2/3) * 100);
    expect(mockSetProgress).toHaveBeenNthCalledWith(3, (3/3) * 100);
    expect(mockGetPage).toHaveBeenCalledTimes(3);
  });

});
