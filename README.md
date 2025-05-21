# PDF to MDX Converter

This project is a web application designed to convert PDF files into MDX (Markdown with JSX) format. Users can upload a PDF, view its content, convert it to MDX, edit the MDX content, and preview the result.

The application leverages `pdfjs-dist` to parse PDF files and applies a set of heuristics to transform the extracted layout information into structured MDX content.

![image](https://github.com/user-attachments/assets/22ee8184-d2f7-4878-8879-a785735fbfa6)

## Functionality Overview

The core functionality is to provide a user-friendly interface for converting PDF documents into editable MDX. This is useful for content creators, developers, and anyone looking to repurpose PDF content for web-based platforms that support MDX.

The conversion process attempts to identify structural elements like headers, paragraphs, and lists from the PDF's layout and text properties.

## Key Features

- **PDF Upload**: Upload a PDF file from your local machine.
- **PDF Viewer**: View the uploaded PDF file directly in the browser.
- **MDX Conversion**:
    - **Improved Header Detection**: Identifies H1, H2, and H3 headers based on font size variations.
    - **Expanded List Item Support**: Recognizes various bullet point styles (•, *, -) and numbered/lettered lists (e.g., 1., a.).
    - **Smarter Paragraph Handling**: Uses vertical spacing between text blocks to better identify and separate paragraphs.
    - **Nested List Support**: Handles hierarchically indented lists based on x-coordinates of list items.
- **MDX Editor**: Edit the converted MDX content with a live code editor.
- **MDX Preview**: Preview the rendered HTML output of the MDX content.
- **Progress Indicator**: Visual feedback for the PDF processing and conversion steps.
- **File Operations**:
    - Save the generated MDX content to a `.mdx` file.
    - Clear the uploaded PDF and its related state.
    - Clear the MDX editor content.
- **Error Messaging**: Displays informative error messages if the PDF conversion fails.

## Components

The application is built with Next.js and comprises several key React components:

-   **`FileUploader.js`**: Handles PDF file input.
-   **`PdfViewer.js`**: Displays the uploaded PDF using `@react-pdf-viewer/core`.
-   **`MdxEditor.js`**: Provides a code editor for MDX content using `@uiw/react-codemirror`.
-   **`MdxPreview.js`**: Renders MDX to HTML using `react-markdown` and `remark-gfm`.
-   **`ProgressBar.js`**: Shows the conversion progress.
-   **`pdfToMdxConverter.js` (in `src/utils`)**: The core logic for PDF parsing, element classification (headers, lists, paragraphs), and MDX generation.
-   **`pages/index.js`**: The main page of the application, integrating all components and managing the application state and logic.

## How to Use

1.  **Upload PDF**: Click the "Upload PDF" button and select a PDF file.
2.  **View PDF**: The selected PDF will be displayed on the left panel.
3.  **Convert**: Click the "Convert to MDX" button. The progress will be shown, and upon completion, the generated MDX will appear in the editor on the right.
4.  **Edit MDX (Optional)**: Modify the MDX content in the editor.
5.  **Preview MDX (Optional)**: Click "Preview MDX" to see the rendered HTML. Click "Hide Preview" to return to the editor.
6.  **Save MDX**: Click "Save MDX" to download the content as a `.mdx` file.
7.  **Clear**:
    *   "Clear PDF": Removes the uploaded PDF and resets the PDF viewer and progress. MDX content remains.
    *   "Clear Editor": Clears the content in the MDX editor and preview.

## Known Limitations

While the converter aims to provide a good starting point, PDF conversion is inherently complex. Here are some known limitations:

-   **No Table Conversion**: Tables in PDFs are not currently converted into Markdown tables or any structured format. They will likely be output as plain text.
-   **No Image Extraction**: Images and other graphical elements from the PDF are not extracted or included in the MDX output.
-   **Complex Layouts**: PDFs with multi-column layouts, intricate designs, or non-standard text flow may not be converted perfectly. The output might require significant manual cleanup.
-   **Rich Text Formatting**: Preservation of inline rich text formatting (like bold, italics, underline, specific colors, or font styles within a single text block) is generally not supported. The conversion focuses on structural elements.
-   **Font-Based Styling**: The converter relies heavily on font sizes for header detection. PDFs that use unconventional font styling for headers might lead to incorrect classification.
-   **Character Encoding**: While generally robust, some PDFs with unusual character encodings might produce garbled text.
-   **No Links**: Hyperlinks within the PDF are not preserved in the MDX output.

## Development Notes

During recent development iterations, attempts were made to implement the following features:

-   **Hyperlink Preservation**: Extracting hyperlink information from PDF annotations and embedding them in the MDX.
-   **Basic Image Extraction**: Extracting images from PDFs, converting them to base64, and embedding them as data URLs in the MDX.

Unfortunately, due to persistent technical difficulties and tooling issues within the development environment that prevented the successful application and testing of the implemented code, these features are **not currently functional** in this version of the application. Further work is required to integrate them.

## Development

### Prerequisites
- Node.js (v18.x or later recommended)
- npm or yarn

### Installation & Setup

1.  Clone the repository:
    ```bash
    git clone https://github.com/yourusername/pdf-to-mdx-converter.git 
    cd pdf-to-mdx-converter
    ```
    *(Replace `yourusername` with the actual repository path if forked/different)*

2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    # or
    yarn dev
    ```
    The application will typically be available at `http://localhost:3000`.

### Testing

The project includes unit tests for the core conversion logic. To run the tests:

```bash
npm test
# or
yarn test
```
This will execute Jest tests located in the `src/utils/__tests__` directory.

## License

This project is licensed under the MIT License - see the `LICENSE` file for details.
