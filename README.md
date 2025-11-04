# PDF to MDX Converter

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/Traves-Theberge/pdf-to-mdx-converter)
[![License](https://img.shields.io/badge/license-MIT-blue)](LICENSE.md)

A modern web application that converts PDF files into MDX (Markdown with JSX) format, featuring an integrated PDF viewer, MDX editor, and live preview. Built with Next.js 14, React 18, and Tailwind CSS.

> **Note**: This project is functional and includes comprehensive testing. The PDF parsing uses intelligent heuristics for text classification. See [Known Limitations](#known-limitations) for details.

![image](https://github.com/user-attachments/assets/22ee8184-d2f7-4878-8879-a785735fbfa6)


## ✨ Features

### Core Functionality
- 📄 **PDF Upload** - Drag-and-drop or click to upload (max 10MB)
- 👁️ **PDF Viewer** - Full-featured viewer with zoom, thumbnails, and navigation
- 🔄 **Smart Conversion** - Intelligent text extraction with heading, list, and code detection
- ✏️ **MDX Editor** - Syntax-highlighted editor with line numbers and auto-completion
- 🎨 **Live Preview** - Real-time MDX rendering with proper formatting
- 📊 **Progress Tracking** - Visual progress bar during conversion
- 💾 **File Operations** - Save, clear, and reset functionality

### Quality & UX
- 🌗 **Dark Mode** - Full theme support (light/dark/system)
- ✅ **File Validation** - File type and size validation with user-friendly errors
- 🎯 **Type Safety** - PropTypes on all components for runtime validation
- ♿ **Accessible** - Custom dialogs and toast notifications
- 🧪 **Tested** - 16 passing unit tests with Jest and React Testing Library
- 📱 **Responsive** - Works on desktop, tablet, and mobile

### Technical Features
- ⚙️ **Configurable** - Centralized configuration for parsing parameters
- 🎨 **Modern UI** - Built with Radix UI and shadcn/ui components
- 🚀 **Optimized** - Next.js 14 with App Router capabilities
- 🔧 **Maintainable** - Clean code structure with proper separation of concerns

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                    # Reusable UI primitives (Radix UI)
│   │   ├── alert-dialog.jsx   # Confirmation dialogs
│   │   ├── toast.jsx          # Toast notifications
│   │   ├── button.jsx         # Button component
│   │   ├── card.jsx           # Card layouts
│   │   └── ...
│   ├── animations/            # Animation components (GSAP, Framer Motion)
│   ├── FileUploader.js        # PDF file upload with validation
│   ├── PdfViewer.js           # PDF display component
│   ├── MdxEditor.js           # CodeMirror-based MDX editor
│   ├── MdxPreview.js          # MDX rendering component
│   ├── ProgressBar.js         # Conversion progress indicator
│   ├── ConfirmDialog.js       # Reusable confirmation dialog
│   ├── ErrorToast.js          # Toast notification wrapper
│   └── __tests__/             # Component tests
├── pages/
│   ├── _app.js                # Next.js app wrapper with theme provider
│   └── index.js               # Main application page
├── utils/
│   ├── pdfToMdxConverter.js   # Core PDF parsing & conversion logic
│   └── __tests__/             # Utility tests
├── hooks/
│   └── use-toast.js           # Toast notification hook
├── lib/
│   └── utils.js               # Helper utilities (cn function)
└── styles/
    └── globals.css            # Global styles & theme variables
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) - React framework with App Router
- **UI Library**: [React 18](https://react.dev/) - Component-based UI
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- **Components**: [Radix UI](https://www.radix-ui.com/) - Accessible component primitives
- **PDF Processing**: [PDF.js](https://mozilla.github.io/pdf.js/) - PDF rendering and parsing
- **PDF Viewer**: [@react-pdf-viewer](https://react-pdf-viewer.dev/) - React PDF viewer
- **MDX Editor**: [CodeMirror](https://codemirror.net/) - Code editor with MDX support
- **MDX Rendering**: [react-markdown](https://github.com/remarkjs/react-markdown) - Markdown to React
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://greensock.com/gsap/)
- **Theme**: [next-themes](https://github.com/pacocoursey/next-themes) - Dark mode support
- **Testing**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/react)
- **Type Checking**: [PropTypes](https://www.npmjs.com/package/prop-types) - Runtime type validation

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Traves-Theberge/pdf-to-mdx-converter.git
   cd pdf-to-mdx-converter
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm test             # Run tests
npm test:watch       # Run tests in watch mode
npm test:coverage    # Generate test coverage report
```

## 🧪 Testing

The project includes comprehensive unit tests:

```bash
npm test
```

**Test Coverage:**
- ✅ 16 tests across 4 test suites
- ✅ Component tests (ProgressBar, MdxPreview, ConfirmDialog)
- ✅ Utility tests (PDF converter configuration)

## 🎯 Usage

1. **Upload a PDF**
   - Click "Choose PDF file" or drag-and-drop a PDF (max 10MB)
   - The PDF will display in the left panel

2. **Convert to MDX**
   - Click "Convert to MDX" button
   - Watch the progress bar as pages are processed
   - Converted MDX appears in the right panel

3. **Edit & Preview**
   - Edit MDX content in the editor
   - Click "Preview" to see rendered output
   - Toggle between Edit and Preview modes

4. **Save Your Work**
   - Click "Save MDX" to download the .mdx file
   - Use "Clear Editor" to reset MDX content
   - Use "Clear All" to reset everything

## ⚙️ Configuration

The PDF parser uses configurable constants in `src/utils/pdfToMdxConverter.js`:

```javascript
const CONFIG = {
  LINE_HEIGHT_THRESHOLD: 5,      // Line grouping threshold
  INDENT_UNIT: 20,                // Indent detection unit
  FONT_SIZE_H1: 24,               // H1 font size threshold
  FONT_SIZE_H2: 20,               // H2 font size threshold
  FONT_SIZE_H3: 16,               // H3 font size threshold
  CODE_FONT_PATTERNS: ['mono', 'courier'],  // Code font detection
  MIN_INDENT_FOR_LIST: 20,        // List indent threshold
  INDENT_SPACES: 2,               // MDX indent spaces
};
```

## 🎨 Customization

### Theme

The app uses CSS variables for theming. Modify `src/styles/globals.css`:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  /* ... */
}
```

### File Size Limit

Change the maximum file size in `src/components/FileUploader.js`:

```javascript
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
```

## ⚠️ Known Limitations

1. **PDF Parsing Accuracy**
   - Text extraction depends on PDF structure
   - Complex layouts may not convert perfectly
   - Tables and multi-column layouts need improvement
   - Mathematical formulas may not preserve formatting

2. **Heading Detection**
   - Uses font size and bold text heuristics
   - May misclassify some headings
   - Can be adjusted via CONFIG constants

3. **Images**
   - Images are not currently extracted from PDFs
   - Only text content is converted

4. **Security**
   - See [SECURITY.md](SECURITY.md) for vulnerability information
   - Only upload trusted PDFs

## 🔒 Security

This project has a known vulnerability in `pdfjs-dist` that cannot be immediately fixed without breaking compatibility. Please read [SECURITY.md](SECURITY.md) for details and mitigation strategies.

**Key Security Measures:**
- 10MB file size limit
- File type validation
- Client-side processing (sandboxed)
- PropTypes runtime validation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 Recent Improvements

- ✅ Added dark mode support with theme-aware colors
- ✅ Extracted magic numbers to configuration constants
- ✅ Implemented file size validation (10MB limit)
- ✅ Replaced browser alerts with custom dialogs
- ✅ Added PropTypes for type safety
- ✅ Set up comprehensive testing with Jest
- ✅ Created 16 unit tests (all passing)
- ✅ Added toast notifications for errors
- ✅ Improved PDF worker URL handling
- ✅ Added security documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) team for the amazing framework
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [shadcn/ui](https://ui.shadcn.com/) for component inspiration
- [Mozilla PDF.js](https://mozilla.github.io/pdf.js/) for PDF parsing
- All open-source contributors

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ using Next.js and React**
