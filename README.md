# PDF to MDX Converter

This project is a web application designed to convert PDF files into MDX (Markdown with JSX) format. Users can upload a PDF, view its content, convert it to MDX, edit the MDX content, and preview the result.

While the project is functional, there are areas that need improvement, and the conversion process isn't perfect yet.

![image](https://github.com/user-attachments/assets/22ee8184-d2f7-4878-8879-a785735fbfa6)


## Features

- **PDF Upload**: Upload a PDF file for conversion.
- **PDF Viewer**: View the uploaded PDF file.
- **Conversion to MDX**: Convert the PDF content into MDX format.
- **MDX Editor**: Edit the converted MDX content using a rich text editor.
- **MDX Preview**: Preview the MDX content as rendered HTML.
- **Progress Indicator**: Track the conversion progress.
- **File Operations**: Save the MDX content to a file, clear the editor, and reset the application.

## Components

### `FileUploader.js`
Handles the file input for PDF upload and reads the file content.

### `PdfViewer.js`
Displays the uploaded PDF using `@react-pdf-viewer/core`.

### `MdxEditor.js`
A rich text editor for MDX content, using `@uiw/react-codemirror`.

### `MdxPreview.js`
Renders the MDX content to HTML using `react-markdown` and `remark-gfm`.

### `ProgressBar.js`
Displays the progress of the PDF to MDX conversion process.

### `pdfToMdxConverter.js`
Contains utility functions for extracting text from PDF, classifying elements, and generating MDX content.

### `_app.js`
Main entry point for the Next.js application.

### `index.js`
Main page of the application, integrates all components and handles the application logic.

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/pdf-to-mdx-converter.git
   ```


2. Ensure Dependencies are Installed
Make sure you have installed all the necessary dependencies. If not, run the following command:

```
npm install
```

3. Start the Development Server
Once the dependencies are installed, you can start the development server using the following command:

```
npm run dev
```

4. Open Your Browser
After running the above command, open your browser and navigate to:

```
http://localhost:3000
```

## License
This project is licensed under the MIT License - see the LICENSE file for details.
