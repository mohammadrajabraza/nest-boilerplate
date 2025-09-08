# Linting and Formatting Setup

This document describes the linting and formatting configuration for the NestJS boilerplate project.

## Overview

The project uses a comprehensive setup with:

- **ESLint** for code linting and quality checks
- **Prettier** for code formatting
- **Husky** for Git hooks
- **lint-staged** for running linters on staged files
- **commitlint** for commit message validation

## Configuration Files

### ESLint Configuration (`eslint.config.mjs`)

The ESLint configuration includes:

- TypeScript-specific rules with `@typescript-eslint`
- Prettier integration for consistent formatting
- Comprehensive rule set for code quality
- Practical configuration that uses warnings instead of strict errors for better developer experience

Key features:

- TypeScript type checking rules
- Import/export consistency rules
- Code quality and best practices
- NestJS-specific rules for configuration service usage
- Test file specific configurations

### Prettier Configuration (`.prettierrc`)

Prettier is configured with:

- Single quotes for strings
- Trailing commas for better Git diffs
- 100 character line width
- 2-space indentation
- Consistent bracket spacing and arrow function formatting

### Git Hooks (`.husky/`)

- **pre-commit**: Runs `lint-staged` to check and fix staged files
- **commit-msg**: Validates commit messages using `commitlint`

### lint-staged Configuration (`.lintstagedrc`)

Runs different tools based on file type:

- TypeScript/JavaScript files: ESLint with `--fix` and Prettier
- JSON, Markdown, YAML files: Prettier only
- CSS/SCSS files: Prettier only

## Available Scripts

### Linting Scripts

```bash
# Check for linting issues (warnings only)
npm run lint:check

# Fix auto-fixable linting issues
npm run lint:fix

# Run linting with auto-fix
npm run lint
```

### Formatting Scripts

```bash
# Format all files
npm run format

# Check if files are formatted correctly
npm run format:check
```

### Type Checking

```bash
# Run TypeScript type checking
npm run type-check
```

### Combined Scripts

```bash
# Run all validation checks
npm run validate

# Fix all auto-fixable issues
npm run fix

# Run pre-commit checks manually
npm run pre-commit
```

## Pre-commit Workflow

When you commit changes, the following happens automatically:

1. **Husky** triggers the pre-commit hook
2. **lint-staged** processes only staged files
3. **ESLint** runs with `--fix` to auto-fix issues
4. **Prettier** formats the files
5. If any issues remain, the commit is blocked
6. **commitlint** validates the commit message format

## IDE Integration

### VS Code

Recommended VS Code extensions:

- ESLint
- Prettier - Code formatter
- TypeScript Importer

The project includes a `.vscode/settings.json` for consistent formatting on save.

### Other IDEs

Make sure to:

1. Enable ESLint integration
2. Enable Prettier integration
3. Configure format on save
4. Use the project's configuration files

## Configuration Details

### ESLint Rules

The configuration includes several rule categories:

#### TypeScript Rules

- `@typescript-eslint/no-unused-vars`: Prevents unused variables
- `@typescript-eslint/require-await`: Ensures async functions use await
- `@typescript-eslint/no-floating-promises`: Prevents unhandled promises
- `@typescript-eslint/consistent-type-imports`: Enforces type-only imports

#### Code Quality Rules

- `prefer-const`: Use const for variables that don't change
- `no-var`: Prefer let/const over var
- `object-shorthand`: Use object property shorthand
- `prefer-template`: Use template literals over string concatenation

#### NestJS Specific Rules

- Custom rules for `configService.get()` usage
- Test naming conventions

### Prettier Rules

- **Single Quotes**: Use single quotes for strings
- **Trailing Commas**: Add trailing commas for better Git diffs
- **Line Width**: 100 characters maximum
- **Indentation**: 2 spaces
- **Semicolons**: Always add semicolons
- **Bracket Spacing**: Add spaces inside object brackets
- **Arrow Functions**: Avoid parentheses when possible

## Ignoring Files

### ESLint Ignores

- `node_modules/`
- `dist/` and `build/` directories
- Generated files (`.d.ts`, `.js.map`)
- Database migration files
- Log files and temporary files

### Prettier Ignores

- Similar to ESLint ignores
- Additional files like `package-lock.json`
- Documentation files that should maintain their formatting

## Troubleshooting

### Common Issues

1. **Pre-commit hook fails**: Check if all staged files pass linting and formatting
2. **ESLint errors**: Run `npm run lint:fix` to auto-fix issues
3. **Prettier conflicts**: Run `npm run format` to format all files
4. **Type errors**: Run `npm run type-check` to see TypeScript errors

### Disabling Rules

To disable specific rules, you can:

1. Add comments in the code: `// eslint-disable-next-line rule-name`
2. Modify the ESLint configuration
3. Use `.eslintrc.js` for file-specific overrides

### Performance

- ESLint uses TypeScript project references for better performance
- Only staged files are processed during commits
- Type checking is separate from linting for faster feedback

## Best Practices

1. **Run validation before committing**: Use `npm run validate` to check everything
2. **Fix issues incrementally**: Don't try to fix all warnings at once
3. **Use meaningful commit messages**: Follow conventional commit format
4. **Keep configuration consistent**: Don't override project settings locally
5. **Regular updates**: Keep dependencies updated for latest rules and features

## Migration Notes

This setup replaces the previous basic ESLint configuration with:

- More comprehensive rule set
- Better TypeScript integration
- Automated formatting
- Pre-commit validation
- Improved developer experience

The configuration is designed to be practical and not overly strict, allowing the existing codebase to work while encouraging better practices going forward.
