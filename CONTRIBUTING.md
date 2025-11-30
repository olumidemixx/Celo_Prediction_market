# Contributing to Celo Prediction Markets

First off, thank you for considering contributing to Celo Prediction Markets! It's people like you that make this such a great project.

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report, please check the [issue list](https://github.com/olumidemixx/celo_prediction_market/issues) to avoid duplicates.

When you are creating a bug report, please include as many details as possible:

* **Use a clear and descriptive title**
* **Describe the exact steps which reproduce the problem**
* **Provide specific examples to demonstrate the steps**
* **Describe the behavior you observed after following the steps**
* **Explain which behavior you expected to see instead and why**
* **Include screenshots and animated GIFs if possible**
* **Include your environment details** (OS, Node version, browser, etc.)

### Suggesting Enhancements

Enhancement suggestions are tracked as [GitHub issues](https://github.com/olumidemixx/celo_prediction_market/issues).

When creating an enhancement suggestion, please include:

* **Use a clear and descriptive title**
* **Provide a step-by-step description of the suggested enhancement**
* **Provide specific examples to demonstrate the steps**
* **Describe the current behavior and why it needs improvement**
* **Include screenshots and animated GIFs if applicable**
* **Explain why this enhancement would be useful**

### Pull Requests

* Follow the JavaScript/TypeScript styleguides
* Include appropriate test cases
* End all files with a newline
* Include clear commit messages
* Update documentation as needed
* Reference related issues when applicable

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Git
- A code editor (VS Code recommended)

### Getting Started

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/celo_prediction_market.git
   cd celo_prediction_market
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd frontend && npm install && cd ..
   ```

3. **Create a branch for your changes**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Set up environment variables**
   ```bash
   # Create .env in root
   cp .env.example .env
   
   # Create .env.local in frontend
   cd frontend
   cp .env.example .env.local
   cd ..
   ```

5. **Make your changes and test**
   ```bash
   npm test
   npx hardhat compile
   ```

6. **Commit and push**
   ```bash
   git add .
   git commit -m 'Add your commit message'
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Fill in the PR description with:
     - What changes you made
     - Why you made them
     - How to test the changes
     - Any related issues (use `Closes #123`)

## Styleguides

### JavaScript/TypeScript

* Use 2 spaces for indentation
* Use camelCase for variable and function names
* Use UPPER_CASE for constants
* Use JSDoc comments for functions
* Use meaningful variable names

### Solidity

* Follow the official [Solidity Style Guide](https://docs.soliditylang.org/en/latest/style-guide.html)
* Use meaningful variable and function names
* Add NatSpec documentation for public functions

### Commit Messages

* Use the present tense ("Add feature" not "Added feature")
* Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
* Limit the first line to 72 characters or less
* Reference issues and pull requests liberally after the first line
* Example: `Add oracle price validation\n\nCloses #123`

## Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npx hardhat coverage

# Run specific test file
npx hardhat test test/PredictionMarkets.test.js
```

## Building and Deployment

```bash
# Compile contracts
npx hardhat compile

# Deploy to Celo Sepolia
npm run deploy

# Export ABIs
npm run generate-abi

# Build frontend
cd frontend && npm run build && cd ..
```

## Additional Notes

### Issue and Pull Request Labels

* `bug` - Something isn't working
* `enhancement` - New feature or request
* `documentation` - Improvements or additions to documentation
* `good first issue` - Good for newcomers
* `help wanted` - Extra attention is needed
* `question` - Further information is requested

## Recognition

Contributors will be recognized in:
- The main README.md Acknowledgments section
- GitHub Contributors page
- Release notes for significant contributions

## Questions?

Feel free to:
- Open an issue with your question
- Check existing documentation in README.md
- Review test files for examples
- Look at previous pull requests for reference

Thank you for contributing! 🎉
