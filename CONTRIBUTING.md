# Contributing to PDF to MDX Converter

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## 🤝 Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other contributors

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A code editor (VS Code recommended)

### Setting Up Development Environment

1. **Fork the repository** on GitHub

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/pdf-to-mdx-converter.git
   cd pdf-to-mdx-converter
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/Traves-Theberge/pdf-to-mdx-converter.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Run tests**
   ```bash
   npm test
   ```

## 📝 How to Contribute

### Reporting Bugs

Before creating a bug report, please check existing issues to avoid duplicates.

**When filing a bug report, include:**
- Clear, descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots (if applicable)
- Environment details (OS, Node version, browser)
- Console errors or logs

**Bug Report Template:**
```markdown
**Description:**
A clear description of the bug.

**Steps to Reproduce:**
1. Go to '...'
2. Click on '...'
3. See error

**Expected Behavior:**
What you expected to happen.

**Actual Behavior:**
What actually happened.

**Environment:**
- OS: [e.g., Windows 10, macOS 13]
- Node: [e.g., 18.17.0]
- Browser: [e.g., Chrome 120]

**Additional Context:**
Any other relevant information.
```

### Suggesting Enhancements

Enhancement suggestions are welcome! Please include:
- Clear, descriptive title
- Detailed explanation of the proposed feature
- Use cases and benefits
- Examples or mockups (if applicable)
- Implementation considerations

### Pull Requests

#### Before Submitting

1. **Check existing PRs** to avoid duplicates
2. **Create an issue first** for major changes
3. **Follow the code style** of the project
4. **Write tests** for new features
5. **Update documentation** as needed

#### PR Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bug-fix
   ```

2. **Make your changes**
   - Write clean, readable code
   - Follow existing patterns
   - Add comments for complex logic
   - Keep commits atomic and focused

3. **Write or update tests**
   ```bash
   npm test
   ```
   Ensure all tests pass and coverage doesn't decrease.

4. **Update documentation**
   - Update README.md if needed
   - Add JSDoc comments to functions
   - Update CHANGELOG.md

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```

   **Commit Message Format:**
   ```
   type(scope): subject

   body (optional)

   footer (optional)
   ```

   **Types:**
   - `feat`: New feature
   - `fix`: Bug fix
   - `docs`: Documentation changes
   - `style`: Code style changes (formatting)
   - `refactor`: Code refactoring
   - `test`: Adding or updating tests
   - `chore`: Maintenance tasks

6. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Use a clear, descriptive title
   - Reference related issues
   - Describe what changed and why
   - Include screenshots for UI changes
   - Check all items in the PR template

#### PR Review Process

- Maintainers will review your PR
- Address any requested changes
- Once approved, your PR will be merged
- Your contribution will be credited

## 💻 Code Style

### General Guidelines

- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Add trailing commas in objects/arrays
- Keep lines under 100 characters (when reasonable)
- Use meaningful variable names
- Write self-documenting code

### React/JavaScript

```javascript
// ✅ Good
const handleClick = (event) => {
  event.preventDefault();
  // Clear logic with good naming
};

// ❌ Bad
const h = (e) => {
  e.preventDefault();
  // Unclear what 'h' does
};
```

### Components

- Use functional components with hooks
- Add PropTypes to all components
- Keep components focused (single responsibility)
- Extract reusable logic into custom hooks
- Use meaningful component names

```javascript
import PropTypes from 'prop-types';

const MyComponent = ({ title, onAction }) => {
  // Component logic
  return <div>{title}</div>;
};

MyComponent.propTypes = {
  title: PropTypes.string.isRequired,
  onAction: PropTypes.func,
};

export default MyComponent;
```

### File Organization

- One component per file
- Co-locate tests with components (`__tests__` folder)
- Group related utilities
- Use index files for cleaner imports

## 🧪 Testing

### Writing Tests

- Write tests for new features
- Update tests when modifying features
- Aim for meaningful test coverage
- Test edge cases and error conditions

### Test Structure

```javascript
describe('ComponentName', () => {
  it('should render correctly', () => {
    // Arrange
    const props = { title: 'Test' };

    // Act
    render(<ComponentName {...props} />);

    // Assert
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const user = userEvent.setup();
    const mockHandler = jest.fn();

    render(<ComponentName onAction={mockHandler} />);

    await user.click(screen.getByRole('button'));

    expect(mockHandler).toHaveBeenCalledTimes(1);
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## 📚 Documentation

### Code Comments

- Use JSDoc for functions and complex logic
- Explain "why", not "what"
- Keep comments up-to-date

```javascript
/**
 * Converts PDF text elements to MDX format
 *
 * @param {Array} elements - Classified text elements from PDF
 * @returns {string} Formatted MDX content
 */
const formatContent = (elements) => {
  // Implementation
};
```

### README Updates

Update README.md when:
- Adding new features
- Changing installation steps
- Modifying configuration options
- Adding dependencies

## 🔍 Code Review Checklist

Before requesting review, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] New tests added for new features
- [ ] PropTypes added to new components
- [ ] Documentation updated
- [ ] No console errors or warnings
- [ ] No commented-out code
- [ ] Commits are well-formed
- [ ] PR description is clear

## 🐛 Debugging Tips

### Common Issues

1. **Tests failing**
   - Clear node_modules and reinstall
   - Check for async issues
   - Ensure mocks are properly set up

2. **PDF not rendering**
   - Check worker URL is correct
   - Verify PDF file is valid
   - Check browser console for errors

3. **Styling issues**
   - Ensure Tailwind classes are correct
   - Check theme variables
   - Verify dark mode is working

### Development Tools

- Use React DevTools for component debugging
- Use browser DevTools for DOM inspection
- Check console for warnings/errors
- Use `npm run lint` to catch issues

## 📦 Release Process

(For maintainers)

1. Update version in package.json
2. Update CHANGELOG.md
3. Create git tag
4. Push to GitHub
5. Create GitHub release

## 🙏 Recognition

All contributors will be recognized in:
- GitHub contributors page
- CHANGELOG.md for significant contributions
- README.md acknowledgments (for major features)

## 📧 Questions?

- Open an issue for questions
- Check existing issues and PRs
- Read the documentation thoroughly

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing! 🎉
