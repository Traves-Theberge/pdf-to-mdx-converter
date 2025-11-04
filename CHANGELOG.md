# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Contributing guidelines (CONTRIBUTING.md)
- Changelog to track version history
- GitHub Actions CI workflow for automated testing

## [0.2.0] - 2025-11-04

### Added
- **Dark mode support** with theme-aware colors throughout the application
- **File size validation** with 10MB maximum limit
- **Custom dialog components** replacing browser alerts/confirms
- **Toast notification system** for user-friendly error messages
- **PropTypes** on all components for runtime type checking
- **Comprehensive testing infrastructure** with Jest and React Testing Library
  - 16 unit tests across 4 test suites
  - ProgressBar, MdxPreview, ConfirmDialog component tests
  - PDF converter utility tests
- **Security documentation** (SECURITY.md) detailing known vulnerabilities
- **Dynamic PDF worker URL** handling for version management
- **Configuration constants** for PDF parsing parameters
- Test scripts: `npm test`, `npm test:watch`, `npm test:coverage`

### Changed
- **README.md** completely overhauled with:
  - Comprehensive feature documentation
  - Project structure details
  - Full tech stack listing
  - Usage instructions
  - Configuration examples
  - Known limitations
  - Contributing guidelines
- **MdxPreview component** now uses theme-aware CSS variables
- **FileUploader component** with improved error handling
- **PDF worker URLs** now use dynamic versioning instead of hardcoded versions
- Extracted magic numbers to `CONFIG` object in pdfToMdxConverter.js

### Fixed
- Dark mode color inconsistencies in MDX preview
- Missing validation for oversized PDF files
- Poor UX with browser alert/confirm dialogs
- Hardcoded PDF.js version causing maintenance issues

### Security
- Documented pdfjs-dist vulnerability (GHSA-wgrm-67xf-hhpq)
- Added mitigation strategies and user recommendations
- Implemented file size limits to prevent memory issues
- Added file type validation

## [0.1.0] - 2024-01-XX

### Added
- Initial release
- PDF file upload functionality
- PDF viewer with zoom, thumbnails, and navigation
- PDF to MDX conversion with intelligent text extraction
- MDX editor with syntax highlighting
- MDX preview with live rendering
- Progress indicator during conversion
- Save MDX to file functionality
- Clear and reset operations
- Theme toggle (light/dark mode)
- Responsive design
- Animations with GSAP and Framer Motion

### Features
- Heading detection based on font size and bold text
- List item detection (bullet, numbered, alphabetical)
- Code block detection for monospace fonts
- Multi-page PDF support with page breaks
- Configurable parsing parameters

### Technical
- Built with Next.js 14 and React 18
- Styled with Tailwind CSS
- Uses Radix UI components
- PDF.js for PDF rendering and parsing
- CodeMirror for MDX editing
- react-markdown for MDX preview

## Release Notes

### Version 0.2.0 Highlights

This major update focuses on **code quality**, **testing**, and **user experience**:

1. **Testing Infrastructure**: Added comprehensive unit tests ensuring reliability
2. **Type Safety**: PropTypes provide runtime validation and better DX
3. **UX Improvements**: Custom dialogs and toast notifications enhance usability
4. **Theme Support**: Full dark mode integration with proper color handling
5. **Security**: Documented vulnerabilities and implemented mitigation strategies
6. **Documentation**: Professional-grade README, SECURITY, and CONTRIBUTING docs
7. **Configuration**: Centralized constants for easier maintenance
8. **Validation**: File size and type validation prevent common errors

### Breaking Changes

None. Version 0.2.0 is fully backward compatible with 0.1.0.

### Migration Guide

If upgrading from 0.1.0:
1. Run `npm install` to install new dependencies (prop-types, testing libraries)
2. No code changes required in your usage
3. Tests are now available via `npm test`

### Known Issues

- PDF parsing accuracy depends on PDF structure (see README Known Limitations)
- pdfjs-dist has a known vulnerability (see SECURITY.md)
- Images are not extracted from PDFs (text only)
- Complex layouts (tables, multi-column) may not convert perfectly

### Upcoming Features

Planned for future releases:
- [ ] Image extraction from PDFs
- [ ] Improved table detection and conversion
- [ ] Multi-column layout support
- [ ] Server-side processing option
- [ ] Batch PDF conversion
- [ ] Export to other formats (Markdown, HTML)
- [ ] PDF metadata preservation
- [ ] Custom styling templates
- [ ] API endpoint for programmatic access

---

## How to Read This Changelog

- **Added** - New features
- **Changed** - Changes to existing functionality
- **Deprecated** - Soon-to-be removed features
- **Removed** - Removed features
- **Fixed** - Bug fixes
- **Security** - Security-related changes

[Unreleased]: https://github.com/Traves-Theberge/pdf-to-mdx-converter/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/Traves-Theberge/pdf-to-mdx-converter/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/Traves-Theberge/pdf-to-mdx-converter/releases/tag/v0.1.0
