# Development Documentation

## Linting

2026 update: The project is now using ESLint 9 and the flat config format. As we
update things from the old config we will update this document to reflect the
changes. Once the code base is stable and things work, we can delete some of the
historical documentation. But for now this document can help us track design
decisions and changes made.

### Overview

The project uses a native ESLint configuration that was migrated from
kcd-scripts. The setup supports both CommonJS source files and ES module test
files, using ESLint 9's flat config format.

### What changed

Previously, the project used `kcd-scripts` for linting configuration. Because
that project is no longer actively maintained, we migrated to a native ESLint
setup that replicates the same behavior.

**Migration details:**

- Replaced `kcd-scripts lint` with native ESLint
- Created `eslint.config.mjs` using ESLint 9 flat config format
- Extracted rules from `eslint-config-kentcdodds` to create a simplified,
  maintainable config. This included removing a lot of the custom rules and
  leaning more on the recommended rules.
- Preserved some custom rule overrides from the original setup
- Supports both CommonJS (source files) and ES modules (test files)

Note: We should consider refacting the project to use ES modules instead of
CommonJS (if everyone supports that) in the future for consistently.

### How to run the linter

To check for linting errors you can run:

```bash
pnpm lint
```

ESlint can automatically fix some errors. to fix errors automatically run:

```bash
pnpm lint --fix
```

The `--fix` flag will automatically fix many common issues like:

- Jest method aliases (e.g., `toThrowError()` → `toThrow()`)
- Unused eslint-disable directives
- Some formatting issues

**Note:** Some errors require manual fixes (e.g., unused variables, tests
without assertions).

### Dependencies

The following packages are used for linting:

- **eslint** — ESLint core (v9.39.2+)
- **@eslint/js** — ESLint recommended rules configuration
- **eslint-plugin-import** — Import/export rules for module resolution and best
  practices
- **eslint-plugin-jest** — Jest-specific rules for test files
- **eslint-config-prettier** — Disables ESLint rules that conflict with Prettier
  formatting
- **@rushstack/eslint-patch** — Module resolution patch for improved
  import/export handling
- **globals** — Provides properly formatted global variables for Node.js and
  Jest environments

### Why these packages?

The configuration is based on `eslint-config-kentcdodds`, which provides a
comprehensive set of rules. We extracted the essential parts to create a
maintainable native config that:

- Catches common bugs and errors
- Enforces consistent code style
- Works with both CommonJS and ES modules
- Integrates with Prettier for formatting
- Provides Jest-specific linting for test files

### Configuration file

The ESLint configuration is in `eslint.config.mjs` at the project root. It uses
ESLint 9's flat config format and includes:

- Base rules from `eslint:recommended`
- Import plugin rules
- Jest plugin rules (for test files only)
- Custom overrides for project-specific needs
- Support for both CommonJS and ES module syntax
