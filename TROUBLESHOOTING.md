# Troubleshooting Guide

This document contains solutions for common issues encountered during development of the GO Commerce Admin Console.

## Import Errors from Dependencies

### Problem
When running `npm run dev`, you may encounter import errors like:

```
✘ [ERROR] No matching export in "node_modules/@chakra-ui/styled-system/dist/esm/index.mjs" for import "isStyleProp"
✘ [ERROR] No matching export in "node_modules/@vueuse/shared/index.mjs" for import "isFunction"
```

### Root Cause
Version incompatibilities between Chakra UI Vue ecosystem packages:

1. **@chakra-ui/styled-system@2.12.0** exports `isStylePropFn` but not `isStyleProp`
2. **@chakra-ui/vue-utils@1.0.0-alpha.14** and **@chakra-ui/vue-system@1.0.0-alpha.13** expect `isStyleProp`
3. **@vueuse/shared@13.9.0** no longer exports `isFunction` (removed in newer versions)
4. **@vueuse/motion@1.6.0** still expects `isFunction` from @vueuse/shared

### Solution Applied
Used `patch-package` to create runtime patches for the problematic packages:

#### 1. Installed patch-package
```bash
npm install patch-package --save-dev
```

#### 2. Created Patches
- **@chakra-ui/vue-utils**: Changed import from `isStyleProp` to `isStylePropFn as isStyleProp`
- **@chakra-ui/vue-system**: Changed import from `isStyleProp` to `isStylePropFn as isStyleProp` 
- **@vueuse/motion**: Removed `isFunction` import and added local implementation

#### 3. Added Postinstall Script
Added to `package.json`:
```json
{
  "scripts": {
    "postinstall": "patch-package"
  }
}
```

### Patch Files Created
The following patch files are automatically applied after `npm install`:

- `patches/@chakra-ui+vue-utils+1.0.0-alpha.14.patch`
- `patches/@chakra-ui+vue-system+1.0.0-alpha.13.patch`
- `patches/@vueuse+motion+1.6.0.patch`

### Alternative Solution
If patches become problematic, there's a compatibility utility available at `src/utils/compatibility.ts` that provides:

- `isStyleProp` (wrapper around `isStylePropFn`)
- `isFunction` (polyfill implementation)
- Additional type guards and utility functions

### Vite Configuration
Added dependency optimization configuration in `vite.config.ts`:

```typescript
optimizeDeps: {
  exclude: [
    '@chakra-ui/vue-utils',
    '@chakra-ui/vue-system',
    '@vueuse/motion'
  ],
  include: [
    '@chakra-ui/vue-next',
    '@chakra-ui/styled-system',
    '@vueuse/core',
    '@vueuse/shared'
  ],
  force: true
}
```

### Verification
After applying fixes, the development server should start without errors:

```bash
npm run dev
# Should show: "VITE v7.1.5 ready in XXXms"
# No import errors should appear
```

### Future Considerations
This is a temporary workaround. Consider:

1. **Monitoring upstream packages** for compatibility fixes
2. **Version updates** when compatible versions are released
3. **Alternative UI libraries** if issues persist
4. **Filing issues** with affected packages

### Related Issues
Track these upstream repositories for fixes:
- [@chakra-ui/vue](https://github.com/chakra-ui/chakra-ui-vue)
- [@vueuse/motion](https://github.com/vueuse/motion)

---

## Port Already in Use Error

### Problem
```
Error: Port 5173 is already in use
```

### Solution
```bash
# Kill any processes using port 5173
lsof -ti:5173 | xargs kill -9

# Or kill all vite processes
pkill -f vite

# Then restart
npm run dev
```

---

## Node.js Version Issues

### Problem
Various build or runtime errors related to Node.js compatibility.

### Solution
Ensure you're using the correct Node.js version:

```bash
node --version  # Should be >= 18.0.0
npm --version   # Should be >= 9.0.0
```

Use nvm to switch versions if needed:
```bash
nvm use 18
# or
nvm use node
```

---

## Cache Issues

### Problem
Stale cache causing unexpected build errors or old code being served.

### Solution
Clear various caches:

```bash
# Clear npm cache
npm run clean

# Clear all caches and reinstall
npm run clean:all
npm install

# Clear Vite cache specifically
rm -rf node_modules/.vite

# Clear browser cache and hard reload in development
```

---

*Last Updated: $(date)*
*Solution Version: 1.0*
