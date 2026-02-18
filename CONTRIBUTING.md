# Contributing to Intent-Code Traceability System

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## 🎯 Project Vision

We're building an AI-Native IDE that solves the Context Paradox and prevents "Vibe Coding" through:

- Intent-driven development
- Cryptographic verification
- Deterministic governance
- Spatial independence

## 🚀 Getting Started

### Prerequisites

- Node.js 20.19.2+ (or 22.x)
- pnpm 10.8.1+
- VS Code 1.80+
- Git

### Development Setup

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/Roo-Code.git
cd Roo-Code

# Add upstream
git remote add upstream https://github.com/IbnuEyni/Roo-Code.git

# Checkout feature branch
git checkout feature/intent-traceability-system

# Install dependencies
pnpm install

# Build
cd src && pnpm bundle
```

## 📝 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
feat(hooks): add optimistic locking to PreToolHook
fix(trace): correct content hash calculation
docs(readme): update installation instructions
```

## 🏗️ Architecture Principles

### 1. Fail-Safe Design

All hooks must be wrapped in try-catch and never throw errors:

```typescript
async execute(context: PreHookContext): Promise<PreHookResult> {
  try {
    // Hook logic
  } catch (error) {
    console.error("[PreToolHook] Error:", error)
    return { blocked: false } // Fail open
  }
}
```

### 2. Single Responsibility

Each hook has one clear purpose:

- **PreToolHook**: Validation and gatekeeper
- **PostToolHook**: Logging and traceability
- **HookEngine**: Orchestration only

### 3. Type Safety

All code must be fully typed with TypeScript:

```typescript
// ✅ Good
interface TraceEntry {
  timestamp: string
  toolName: string
  contentHash?: string
}

// ❌ Bad
const entry: any = { ... }
```

### 4. Minimal Intervention

Hooks should not modify tool behavior, only observe and validate.

## 🧪 Testing

### Before Submitting

```bash
# Type checking
pnpm run check-types

# Linting
pnpm run lint

# Build
cd src && pnpm bundle

# Manual testing
# Follow QUICK_TEST_CARD.md
```

### Test Requirements

- All TypeScript errors must be resolved
- ESLint warnings must be 0
- Manual integration tests must pass

## 📁 File Organization

```
src/hooks/
├── types.ts              # Interfaces only
├── HookEngine.ts         # Orchestrator
├── PreToolHook.ts        # Validation logic
├── PostToolHook.ts       # Logging logic
├── IntentManager.ts      # YAML operations
├── TraceLogger.ts        # File I/O
├── ContentHasher.ts      # Utilities
└── index.ts              # Exports
```

## 🔄 Pull Request Process

1. **Create a feature branch**

    ```bash
    git checkout -b feature/your-feature-name
    ```

2. **Make your changes**

    - Follow architecture principles
    - Add tests if applicable
    - Update documentation

3. **Commit with conventional format**

    ```bash
    git commit -m "feat(hooks): add new feature"
    ```

4. **Push to your fork**

    ```bash
    git push origin feature/your-feature-name
    ```

5. **Open a Pull Request**
    - Use the PR template
    - Link related issues
    - Describe changes clearly

### PR Checklist

- [ ] Code follows architecture principles
- [ ] TypeScript: 0 errors
- [ ] ESLint: 0 warnings
- [ ] Conventional commit messages
- [ ] Documentation updated
- [ ] Manual tests pass

## 🐛 Bug Reports

Use GitHub Issues with the bug template:

**Title**: `[BUG] Short description`

**Description**:

- What happened?
- What did you expect?
- Steps to reproduce
- Environment (OS, Node version, etc.)

## 💡 Feature Requests

Use GitHub Issues with the feature template:

**Title**: `[FEATURE] Short description`

**Description**:

- What problem does this solve?
- Proposed solution
- Alternatives considered
- Additional context

## 📚 Documentation

### Code Comments

```typescript
// ✅ Good: Explain WHY, not WHAT
// Calculate pre-write hash for optimistic locking
const preHash = ContentHasher.hash(content)

// ❌ Bad: Obvious comment
// Hash the content
const hash = ContentHasher.hash(content)
```

### README Updates

- Keep examples up-to-date
- Add new features to feature list
- Update architecture diagrams if needed

## 🎓 Learning Resources

- [Intent Formalization](https://arxiv.org/abs/2406.09757)
- [AI-Native Git](https://github.com/git-ai/git-ai)
- [Context Engineering](https://www.anthropic.com/research)
- [Cognitive Debt](http://sunnyday.mit.edu/papers/intent-tse.pdf)

## 🤝 Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Celebrate contributions

## 📞 Questions?

- Open a GitHub Discussion
- Check existing issues
- Review documentation

---

**Thank you for contributing to AI-Native Development!** 🚀
