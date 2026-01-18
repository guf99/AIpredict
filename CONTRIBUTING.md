# Contributing Guide

Thank you for interest in contributing to Crypto AI Prediction Platform! 

## 📋 Code of Conduct

- Be respectful and inclusive
- No harassment or discrimination
- Constructive feedback only
- Respect intellectual property

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork locally
3. Create a branch: `git checkout -b feature/your-feature`
4. Make your changes
5. Commit: `git commit -am 'Add new feature'`
6. Push: `git push origin feature/your-feature`
7. Submit a Pull Request

## 📝 Commit Messages

```
<type>: <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Example:**
```
feat: Add LSTM model for predictions

Added LSTM neural network model that processes sequential 
price data for improved long-term trend prediction.

Closes #123
```

## 🧪 Testing

Before submitting:
```bash
# Run tests
npm test

# Run linter
npm run lint

# Build frontend
npm run build

# Test API
node backend/test.js
```

## 📚 Documentation

- Update README.md for major changes
- Document new API endpoints in API_DOCS.md
- Update ML_MODEL_DOCS.md for model changes
- Add code comments for complex logic

## ✅ Pull Request Checklist

- [ ] Tests pass locally
- [ ] Code follows style guide
- [ ] Documentation updated
- [ ] No console errors
- [ ] Commits are descriptive
- [ ] Related issues mentioned

## 🐛 Bug Reports

Include:
- OS and browser version
- Steps to reproduce
- Expected vs actual behavior
- Error messages/screenshots
- Environment setup

## 💡 Feature Requests

Include:
- Use case and benefits
- Proposed implementation
- Potential challenges
- Related features

## 👥 Community

- **Discussions**: GitHub Discussions
- **Issues**: Bug reports and feature requests
- **Twitter**: Follow for updates @CryptoAIPred
- **Discord**: [Join our community](#)

## 📖 Style Guide

### JavaScript/React
```javascript
// Use const/let, not var
const variable = value

// Use arrow functions
const func = (param) => { return param }

// Use template literals
const str = `Hello ${name}`

// Use destructuring
const { name, value } = obj
```

### Python
```python
# Follow PEP 8
def function_name(param):
    """Docstring"""
    return result

# Use type hints
def predict(data: pd.DataFrame) -> dict:
    pass
```

## 🔍 Code Review Process

1. Automatic checks (tests, linting)
2. Peer review (at least 1 approval)
3. Maintainer review
4. Merge to main branch

## 🏆 Contributor Recognition

All contributors will be:
- Added to CONTRIBUTORS.md
- Recognized in releases
- Eligible for rewards (TBD)

## 📞 Questions?

- Create a discussion on GitHub
- Email: dev@cryptoai.com
- Open an issue

---

Thank you for contributing! 🎉
