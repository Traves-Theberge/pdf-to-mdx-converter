# Security Policy

## Current Security Status

This project uses `pdfjs-dist@3.11.174` which has a known vulnerability:

### Known Vulnerabilities

#### PDF.js Arbitrary JavaScript Execution (High Severity)
- **Package**: `pdfjs-dist <=4.1.392`
- **CVE**: GHSA-wgrm-67xf-hhpq
- **Severity**: High
- **Issue**: PDF.js is vulnerable to arbitrary JavaScript execution upon opening a malicious PDF
- **Status**: ⚠️ **No fix currently available** without upgrading to pdfjs-dist 4.2+

### Why We Haven't Upgraded

The current version of `@react-pdf-viewer` (3.12.0) is designed to work with pdfjs-dist 3.x. Upgrading to pdfjs-dist 4.x or 5.x would require:
1. Verifying compatibility with @react-pdf-viewer
2. Extensive testing of PDF viewing and conversion functionality
3. Potential refactoring of PDF processing code

### Mitigation Strategies

Until an upgrade is feasible, we've implemented these security measures:

1. **File Size Limits**: Maximum 10MB file size to prevent large malicious PDFs
2. **File Type Validation**: Strict validation that only PDF files are accepted
3. **User Warnings**: Users should only upload PDFs from trusted sources
4. **Sandboxed Processing**: PDF processing happens in the browser, isolated from the server

### Recommendations for Users

- **Only upload PDFs from trusted sources**
- **Do not upload PDFs from unknown or untrusted origins**
- **Scan PDFs with antivirus software before uploading**
- **Be cautious with PDFs received via email or downloaded from the internet**

### Planned Security Improvements

- [ ] Monitor @react-pdf-viewer releases for pdfjs-dist 4.x+ compatibility
- [ ] Implement Content Security Policy (CSP) headers
- [ ] Add server-side PDF validation (if backend is added)
- [ ] Consider alternative PDF parsing libraries

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please:

1. **Do NOT** open a public GitHub issue
2. Email the maintainer directly with details
3. Include steps to reproduce the vulnerability
4. Allow reasonable time for a fix before public disclosure

## Security Best Practices

When deploying this application:

- Use HTTPS in production
- Implement proper CORS policies
- Set up Content Security Policy (CSP) headers
- Keep all dependencies updated regularly
- Monitor security advisories for dependencies

## Dependency Security

Run regular security audits:

```bash
npm audit
npm audit fix  # For fixable vulnerabilities
```

## Last Updated

November 4, 2025
