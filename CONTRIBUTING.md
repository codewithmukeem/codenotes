# Contributing to CodeNotes

Thank you for your interest in contributing to **CodeNotes**! This document outlines how to get involved.

---

## Code of Conduct

Be respectful, inclusive, and professional. All contributions are welcome regardless of experience level.

---

## How to Contribute

### Reporting Bugs

1. Search [existing issues](https://github.com/codewithmukeem/codenotes/issues) to avoid duplicates.
2. Open a new issue with:
   - A clear, descriptive title
   - Steps to reproduce
   - Expected vs. actual behavior
   - Device/platform info (iOS version, Android version, Expo SDK version)

### Suggesting Features

Open an issue with the `enhancement` label. Describe:
- The problem you're solving
- Your proposed solution
- Any alternatives you considered

### Submitting Pull Requests

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Make your changes** following the code style guidelines below.

4. **Type-check** before committing:
   ```bash
   pnpm --filter @workspace/mobile run typecheck
   ```

5. **Commit** with a meaningful message (see commit conventions below).

6. **Push** and open a pull request against `main`.

---

## Code Style

- **TypeScript strict mode** — all new code must be fully typed; avoid `any`.
- **Functional components** — use React function components and hooks only.
- **No external styling libraries** — use `StyleSheet.create` from React Native.
- **No backend dependencies** — CodeNotes is intentionally offline-first. All persistence must go through AsyncStorage via the `storage/` layer.
- **Zero new heavy dependencies** — prefer lightweight solutions or write utilities in-house (see `MarkdownRenderer.tsx` and `CodeBlock.tsx` as examples).
- **Consistent naming** — PascalCase for components, camelCase for hooks/utils, kebab-case for file names in `app/`.

---

## Commit Conventions

Use [Conventional Commits](https://www.conventionalcommits.org):

```
feat: add tag filtering on home screen
fix: prevent crash when note id is undefined
refactor: simplify tokenizer loop in CodeBlock
docs: update README installation steps
chore: bump expo to 54.0.27
```

---

## Project Structure

See [README.md](README.md#project-structure) for a full breakdown of the folder structure.

---

## Development Setup

```bash
# Clone
git clone https://github.com/codewithmukeem/codenotes.git
cd codenotes

# Install
pnpm install

# Start Expo dev server
pnpm --filter @workspace/mobile run dev
```

---

## Questions?

Open a [GitHub Discussion](https://github.com/codewithmukeem/codenotes/discussions) or reach out via the issue tracker.
