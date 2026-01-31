# Package Patch for @opencode-ai/plugin

## Issue

Custom analysis tools in `.opencode/tool/` directory could not be executed due to package configuration errors in `@opencode-ai/plugin@1.1.15`.

### Error

```bash
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: No "exports" main defined in
.opencode/node_modules/@opencode-ai/plugin/package.json
```

### Root Cause

The `@opencode-ai/plugin@1.1.15` package.json had incomplete exports configuration:

1. **Missing `main` field** - Some tools require this for compatibility
2. **Incomplete exports** - Missing default exports for fallback resolution
3. **Missing conditional exports** - Node.js module resolution needed additional paths
4. **Missing .js extension** - dist/index.js imported `./tool` without extension (ESM requirement)

## Fix

The `patch-package.js` script automatically applies the following patches:

### 1. Package.json Exports Fix

Adds comprehensive exports to package.json:

```json
{
  "main": "./dist/index.js",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "./tool": {
      "import": "./dist/tool.js",
      "types": "./dist/tool.d.ts",
      "default": "./dist/tool.js"
    },
    "./dist/*": "./dist/*",
    "./package.json": "./package.json"
  }
}
```

### 2. Import Extension Fix

Updates `dist/index.js` to include `.js` extension:

```javascript
// Before
export * from "./tool";

// After
export * from "./tool.js";
```

### Affected Tools

All custom tools in `.opencode/tool/` now work correctly:

- `check-console-logs.ts` - Find console.log usage
- `check-missing-error-handling.ts` - Find async functions without try-catch
- `find-untyped.ts` - Find 'any' type usage
- `check-storage-keys.ts` - Find hardcoded localStorage keys
- `find-hardcoded-urls.ts` - Find hardcoded URLs
- `check-missing-tests.ts` - Find missing test files
- `generate-deployment-checklist.ts` - Generate deployment checklist
- `generate-types.ts` - Generate TypeScript types

## Installation

The patch is applied automatically via the `postinstall` script in `.opencode/package.json`:

```bash
npm install  # Automatically runs patch-package.js
```

### Manual Execution

To apply the patch manually:

```bash
cd .opencode
node patch-package.js
```

## Verification

Test that tools can be executed:

```bash
npx tsx .opencode/tool/check-console-logs.ts
npx tsx .opencode/tool/find-hardcoded-urls.ts
```

All tools should execute without ERR_PACKAGE_PATH_NOT_EXPORTED errors.

## Long-term Solution

Report this issue to `@opencode-ai/plugin` maintainers to include these fixes in future versions:

- Add comprehensive exports configuration
- Include .js extensions in ES module imports
- Add `main` field for compatibility

## References

- Issue: #1274 - Custom Analysis Tools Package Configuration Error
- Node.js ESM documentation: https://nodejs.org/api/esm.html
- Package exports docs: https://nodejs.org/api/packages.html#exports
