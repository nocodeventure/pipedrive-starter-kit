# Contributing to Pipedrive Todo Example App

Thank you for your interest in contributing to this project! We welcome contributions from the community and appreciate your effort to make this example app better.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Message Guidelines](#commit-message-guidelines)
- [Testing](#testing)
- [Need Help?](#need-help)

## Code of Conduct

This project and everyone participating in it is expected to:

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/example-apps.git
   cd example-apps
   ```
3. **Add the upstream repository**:
   ```bash
   git remote add upstream https://github.com/pipedrive/example-apps.git
   ```
4. **Create a new branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## How Can I Contribute?

### Reporting Bugs

Before creating a bug report:
- Check if the bug has already been reported in the [Issues](https://github.com/pipedrive/example-apps/issues)
- Make sure you're using the latest version of the app

When creating a bug report, include:
- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Environment details** (Node.js version, OS, database provider)
- **Error messages and logs** (remove any sensitive information)
- **Screenshots** if applicable

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub Issues. When creating an enhancement suggestion:
- Use a clear and descriptive title
- Provide a detailed description of the proposed functionality
- Explain why this enhancement would be useful
- Include code examples if applicable

### Code Contributions

We welcome code contributions! Here are some areas where you can help:
- Bug fixes
- Feature implementations
- Documentation improvements
- Code refactoring and optimization
- Adding tests
- Improving error handling

## Development Setup

### Prerequisites

- Node.js 16 or higher
- PostgreSQL database (Neon, Supabase, AWS RDS, Railway, or local)
- ngrok or similar tunneling service
- Pipedrive Developer Hub account

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables by creating a `.env` file:
   ```
   DATABASE_URL=postgresql://user:password@host/database?sslmode=require
   ```

3. Push database schema:
   ```bash
   npm run db:push
   ```

4. Apply Row-Level Security policies:
   ```bash
   npm run db:apply-rls
   ```

5. Start ngrok:
   ```bash
   ngrok http 3000 --host-header=localhost
   ```

6. Configure your Pipedrive app in Developer Hub (see [README.md](README.md) for details)

7. Update `config.js` with your app credentials

8. Start the development server:
   ```bash
   npm run dev
   ```

### Database Management

- `npm run db:push` - Push schema changes to database
- `npm run db:apply-rls` - Apply Row-Level Security policies
- `npm run db:studio` - Open Drizzle Studio (visual database browser)
- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Apply migration files

## Pull Request Process

1. **Keep your fork in sync** with the upstream repository:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes** following our [Coding Standards](#coding-standards)

4. **Test your changes** thoroughly

5. **Commit your changes** with clear commit messages (see [Commit Message Guidelines](#commit-message-guidelines))

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub with:
   - Clear title describing the change
   - Detailed description of what was changed and why
   - Reference to any related issues (e.g., "Fixes #123")
   - Screenshots or GIFs for UI changes
   - Any breaking changes clearly documented

8. **Respond to feedback** - Maintainers may request changes before merging

### Pull Request Checklist

- [ ] Code follows the project's coding standards
- [ ] Changes have been tested locally
- [ ] No linter errors introduced
- [ ] Database migrations tested (if applicable)
- [ ] Documentation updated (if needed)
- [ ] Commit messages are clear and descriptive
- [ ] PR description clearly explains the changes

## Coding Standards

### JavaScript/React

- Follow existing code style and patterns in the project
- Use ES6+ syntax where appropriate
- Prefer `const` over `let`, avoid `var`
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused (single responsibility)

### Components

- Create reusable components rather than inline implementations
- Keep components in their own directories with associated styles
- Use functional components with hooks
- Follow the existing component structure pattern

### Database

- Use Drizzle ORM for all database operations
- Never bypass Row-Level Security (RLS) unless absolutely necessary (document why)
- Use transactions for multi-step operations
- Always use parameterized queries (Drizzle handles this)
- Include proper error handling

### API Endpoints

- Follow RESTful conventions
- Use async/await for asynchronous operations
- Include proper error handling
- Validate input data
- Return appropriate HTTP status codes
- Use the existing middleware pattern

### Security

- Never commit sensitive data (tokens, credentials, API keys)
- Always use environment variables for configuration
- Respect RLS policies
- Validate and sanitize user input
- Use JWT for authentication where appropriate

## Commit Message Guidelines

Use clear and descriptive commit messages:

### Format
```
<type>: <subject>

<body (optional)>

<footer (optional)>
```

### Types
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, semicolons, etc.)
- `refactor:` Code refactoring without changing functionality
- `perf:` Performance improvements
- `test:` Adding or updating tests
- `chore:` Maintenance tasks (dependencies, build config)

### Examples
```
feat: add ability to filter todos by status

fix: resolve RLS policy error on first installation

docs: update README with database setup instructions

refactor: extract user context logic into reusable function
```

## Testing

Before submitting a PR, test the following:

### Functional Testing
- [ ] OAuth flow works correctly
- [ ] Custom UI panel loads and displays correctly
- [ ] Embedded actions work as expected
- [ ] Todo CRUD operations function properly
- [ ] Database operations complete successfully

### Database Testing
- [ ] Test with a fresh database installation
- [ ] Verify RLS policies are working correctly
- [ ] Check multi-user scenarios (if applicable)
- [ ] Test database migrations (if you added any)

### Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari (if possible)
- [ ] Check responsive design (if UI changes)

## Need Help?

- **Questions?** Open a [GitHub Discussion](https://github.com/pipedrive/example-apps/discussions) or create an issue
- **Found a bug?** Create an [issue](https://github.com/pipedrive/example-apps/issues)
- **Want to chat?** Check the project's communication channels

---

Thank you for contributing! Your efforts help make this example app better for everyone learning to build Pipedrive integrations. 🚀

