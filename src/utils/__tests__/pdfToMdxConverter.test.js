// src/utils/__tests__/pdfToMdxConverter.test.js
import { convertPdfToMdx } from '../pdfToMdxConverter';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

// Mock pdfjsLib
jest.mock('pdfjs-dist/build/pdf', () => ({
  getDocument: jest.fn(),
  // GlobalWorkerOptions: { workerSrc: 'test-pdf-worker.js' } 
}));

describe('convertPdfToMdx', () => {
  let mockSetProgress;
  let mockGetPage;
  let mockGetTextContent;
  let mockGetViewport;

  beforeEach(() => {
    mockSetProgress = jest.fn();
    mockGetTextContent = jest.fn();
    mockGetViewport = jest.fn().mockReturnValue({ width: 600, height: 800, scale: 1 });
    mockGetPage = jest.fn().mockResolvedValue({
      getTextContent: mockGetTextContent,
      getViewport: mockGetViewport,
    });

    pdfjsLib.getDocument.mockReset();
    pdfjsLib.getDocument.mockReturnValue({ 
      promise: Promise.resolve({
        numPages: 1,
        getPage: mockGetPage,
        destroy: jest.fn().mockResolvedValue(undefined),
      }),
    });
    mockGetTextContent.mockResolvedValue({ items: [] });
  });

  test('should convert basic paragraph', async () => {
    mockGetTextContent.mockResolvedValueOnce({
      items: [
        { str: 'Hello world', transform: [12, 0, 0, 12, 50, 700], width: 100, height: 12, fontName: 'Times', fontSize: 12 },
      ],
    });
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    expect(mdx.trim()).toBe('Hello world');
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
        { str: '• Item 1', transform: [12, 0, 0, 12, 50, 700], width: 100, height: 12, fontName: 'Times', fontSize: 12, y: 100 },
        { str: '* Item 2', transform: [12, 0, 0, 12, 50, 680], width: 100, height: 12, fontName: 'Times', fontSize: 12, y: 120 },
        { str: '- Item 3', transform: [12, 0, 0, 12, 50, 660], width: 100, height: 12, fontName: 'Times', fontSize: 12, y: 140 },
      ],
    });
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    const expectedMdx = [ // Expect original markers
      '• Item 1',
      '* Item 2',
      '- Item 3',
    ].join('\n');
    expect(mdx.trim()).toBe(expectedMdx);
  });

  test('should correctly format ordered list items (numbered and lettered)', async () => {
    mockGetTextContent.mockResolvedValueOnce({
      items: [
        { str: '1. First item', transform: [12, 0, 0, 12, 50, 700], fontSize: 12, fontName: 'Times', width:100, height:12, y:100 }, // x=50
        { str: 'a. Sub item A', transform: [12, 0, 0, 12, 70, 680], fontSize: 12, fontName: 'Times', width:100, height:12, y:120 }, // x=70 (INDENTATION_THRESHOLD is 10)
        { str: '2. Second item', transform: [12, 0, 0, 12, 50, 660], fontSize: 12, fontName: 'Times', width:100, height:12, y:140 }, // x=50
      ],
    });
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    const expectedMdx = [ 
      '1. First item',
      '  a. Sub item A', // Preserved marker, index 0 for this sub-list
      '2. Second item',  // Sibling to '1. First item', so its index is 1 -> '2.'
    ].join('\n');
    expect(mdx.trim()).toBe(expectedMdx);
  });

  test('should create paragraph breaks based on vertical spacing', async () => {
    const items = [
        { str: 'Paragraph 1, Line 1.', transform: [12,0,0,12,50,700], width: 100, height: 12, fontName: 'Times', fontSize: 12, y: 100 },
        { str: 'Paragraph 2, Line 1.', transform: [12,0,0,12,50,650], width: 100, height: 12, fontName: 'Times', fontSize: 12, y: 150 },
        { str: 'Paragraph 2, Line 2.', transform: [12,0,0,12,50,635], width: 100, height: 12, fontName: 'Times', fontSize: 12, y: 165 },
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
    pdfjsLib.getDocument.mockReturnValueOnce({ 
      promise: Promise.resolve({
        numPages: 2, getPage: mockGetPage, destroy: jest.fn().mockResolvedValue(undefined),
      }),
    });
    mockGetPage.mockResolvedValueOnce({
      getTextContent: jest.fn().mockResolvedValue({ items: [{ str: 'Page 1 content.', transform: [12,0,0,12,50,700], width: 100, height: 12, fontName: 'Times', fontSize: 12, y:100 }] }),
      getViewport: mockGetViewport,
    }).mockResolvedValueOnce({
      getTextContent: jest.fn().mockResolvedValue({ items: [{ str: 'Page 2 content.', transform: [12,0,0,12,50,700], width: 100, height: 12, fontName: 'Times', fontSize: 12, y:100 }] }),
      getViewport: mockGetViewport,
    });
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    const expectedMdx = [ 'Page 1 content.', '', 'Page 2 content.'].join('\n').trim();
    expect(mdx.trim()).toBe(expectedMdx);
    expect(mockSetProgress).toHaveBeenCalledWith(50);
    expect(mockSetProgress).toHaveBeenCalledWith(100);
    expect(mockGetPage).toHaveBeenCalledTimes(2);
  });

  test('should handle empty page or no text items', async () => {
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
    pdfjsLib.getDocument.mockReturnValueOnce({
      promise: Promise.resolve({ numPages: 3, getPage: mockGetPage, destroy: jest.fn().mockResolvedValue(undefined) }),
    });
    mockGetPage
      .mockResolvedValue({ getTextContent: jest.fn().mockResolvedValue({ items: [{ str: 'Text', transform: [12,0,0,12,0,0], width:10,height:12,fontName:'Times',fontSize:12,y:100}]}), getViewport: mockGetViewport });
    await convertPdfToMdx('dummy.pdf', mockSetProgress);
    expect(mockSetProgress).toHaveBeenCalledTimes(3);
    expect(mockSetProgress).toHaveBeenNthCalledWith(1, (1/3) * 100);
    expect(mockSetProgress).toHaveBeenNthCalledWith(2, (2/3) * 100);
    expect(mockSetProgress).toHaveBeenNthCalledWith(3, (3/3) * 100);
    expect(mockGetPage).toHaveBeenCalledTimes(3);
  });

  // --- Tests for Nested Lists ---

  test('should handle a simple two-level nested unordered list', async () => {
    mockGetTextContent.mockResolvedValueOnce({
      items: [
        { str: '* Level 1 Item 1', transform: [12,0,0,12, 50, 700], fontSize: 12, fontName: 'Times', width:100, height:12, y:100 }, 
        { str: '* Level 2 Item 1', transform: [12,0,0,12, 70, 680], fontSize: 12, fontName: 'Times', width:100, height:12, y:120 }, 
        { str: '* Level 2 Item 2', transform: [12,0,0,12, 70, 660], fontSize: 12, fontName: 'Times', width:100, height:12, y:140 }, 
        { str: '* Level 1 Item 2', transform: [12,0,0,12, 50, 640], fontSize: 12, fontName: 'Times', width:100, height:12, y:160 }, 
      ],
    });
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    const expectedMdx = [
      '* Level 1 Item 1',
      '  * Level 2 Item 1',
      '  * Level 2 Item 2',
      '* Level 1 Item 2',
    ].join('\n');
    expect(mdx.trim()).toBe(expectedMdx.trim());
  });

  test('should handle a three-level nested ordered list', async () => {
    mockGetTextContent.mockResolvedValueOnce({
      items: [
        { str: '1. L1-A', transform: [12,0,0,12, 50, 700], fontSize: 12, fontName: 'Times', width:100, height:12, y:100 }, 
        { str: 'a. L2-A', transform: [12,0,0,12, 70, 680], fontSize: 12, fontName: 'Times', width:100, height:12, y:120 }, 
        { str: 'i. L3-A', transform: [12,0,0,12, 90, 660], fontSize: 12, fontName: 'Times', width:100, height:12, y:140 }, 
        { str: 'b. L2-B', transform: [12,0,0,12, 70, 640], fontSize: 12, fontName: 'Times', width:100, height:12, y:160 }, 
        { str: '2. L1-B', transform: [12,0,0,12, 50, 620], fontSize: 12, fontName: 'Times', width:100, height:12, y:180 }, 
      ],
    });
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    const expectedMdx = [ // Markers 'a.' and 'i.' should be preserved. Numeric markers are re-numbered per list.
      '1. L1-A',
      '  a. L2-A', 
      '    i. L3-A', 
      '  b. L2-B', 
      '2. L1-B',
    ].join('\n');
    expect(mdx.trim()).toBe(expectedMdx.trim());
  });

  test('should handle list de-indentation correctly', async () => {
    mockGetTextContent.mockResolvedValueOnce({
      items: [
        { str: '1. Item One',   transform: [12,0,0,12, 50, 700], fontSize: 12, fontName: 'Times', width:100, height:12, y:100 }, 
        { str: 'a. Sub One',  transform: [12,0,0,12, 70, 680], fontSize: 12, fontName: 'Times', width:100, height:12, y:120 }, 
        { str: 'b. Sub Two',  transform: [12,0,0,12, 70, 660], fontSize: 12, fontName: 'Times', width:100, height:12, y:140 }, 
        { str: '2. Item Two',   transform: [12,0,0,12, 50, 640], fontSize: 12, fontName: 'Times', width:100, height:12, y:160 }, 
        { str: '3. Item Three', transform: [12,0,0,12, 50, 620], fontSize: 12, fontName: 'Times', width:100, height:12, y:180 }, 
      ],
    });
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    const expectedMdx = [ // Markers 'a.' and 'b.' should be preserved. '1.', '2.', '3.' re-numbered.
      '1. Item One',
      '  a. Sub One',
      '  b. Sub Two',
      '2. Item Two',
      '3. Item Three',
    ].join('\n');
    expect(mdx.trim()).toBe(expectedMdx.trim());
  });
  
  test('should handle mixed indentation levels and markers', async () => {
    mockGetTextContent.mockResolvedValueOnce({
      items: [
        { str: '* Alpha',     transform: [12,0,0,12, 50, 760], fontSize: 12, fontName: 'Times', width:100, height:12, y:40 },  
        { str: '  1. Beta',   transform: [12,0,0,12, 70, 740], fontSize: 12, fontName: 'Times', width:100, height:12, y:60 },  
        { str: '    - Gamma', transform: [12,0,0,12, 90, 720], fontSize: 12, fontName: 'Times', width:100, height:12, y:80 },  
        { str: '  2. Delta',  transform: [12,0,0,12, 70, 700], fontSize: 12, fontName: 'Times', width:100, height:12, y:100 }, 
        { str: '* Epsilon',   transform: [12,0,0,12, 50, 680], fontSize: 12, fontName: 'Times', width:100, height:12, y:120 }, 
        { str: '  * Zeta',    transform: [12,0,0,12, 70, 660], fontSize: 12, fontName: 'Times', width:100, height:12, y:140 }, 
      ],
    });
    const mdx = await convertPdfToMdx('dummy.pdf', mockSetProgress);
    const expectedMdx = [ // Original markers for unordered, renumber for ordered numeric
      '* Alpha',
      '  1. Beta',   
      '    - Gamma', 
      '  2. Delta',  
      '* Epsilon',
      '  * Zeta'     
    ].join('\n');
    expect(mdx.trim()).toBe(expectedMdx.trim());
  });
});
