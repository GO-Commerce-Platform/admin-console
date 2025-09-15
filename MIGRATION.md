# UI Framework Migration Guide

## 🚨 CRITICAL PRIORITY TASK

**Current Status**: PAUSED - Store Management page development blocked by Chakra UI Vue Next issues

**Root Cause**: Using alpha version `@chakra-ui/vue-next@1.0.0-alpha.16` with missing critical components

## 📊 Stack Analysis Results

### ✅ Excellent Stack Components (Keep)
- **Vue 3.5.21** - Perfect, latest stable
- **Vite 7.1.5** - Excellent build tool
- **Pinia 3.0.3** - Perfect state management
- **Vitest 3.2.4** - Excellent testing framework
- **TypeScript 5.8.3** - Solid, stable version

### ❌ Problematic Components (Replace)
- **@chakra-ui/vue-next@1.0.0-alpha.16** - Alpha, missing Menu, Table, Select
- **@chakra-ui/vue-system@1.0.0-alpha.13** - Alpha, incomplete

## 🎯 Migration Plan: Chakra UI → Naive UI

### Why Naive UI?
- **Trust Score**: 7.2 (vs Chakra UI's alpha status)
- **Code Examples**: 3,045 (vs Chakra UI's limited examples)
- **Components**: 90+ complete components
- **Vue 3 Native**: Built specifically for Vue 3
- **Dark Theme**: Excellent support for glassmorphism design

### Current Issues Being Fixed
1. `SyntaxError: The requested module does not provide an export named 'CMenu'`
2. `Failed to resolve component: CButton, CTable, CSelect` etc.
3. Store destructuring undefined errors in Stores.vue
4. Missing UI components preventing proper rendering

## 🔄 Current State Snapshot

### Affected Files Identified
- `/src/main.ts` - Chakra UI plugin setup
- `/src/pages/platform/Stores.vue` - Heavy Chakra UI usage
- `/src/components/molecules/MetricCard.vue` - Some Chakra UI components
- `/src/theme/` - Complete theme configuration

### Component Usage Audit (Stores.vue)
Current Chakra UI components used:
- CButton, CBox, CStack, CText, CIcon
- CSimpleGrid, CInputGroup, CInputLeftElement, CInput
- CCheckbox, CBadge, CLink, CIconButton
- CAlertDialog components
- **MISSING**: CMenu, CTable, CSelect (causing failures)

## 📋 Migration Steps

### Phase 1: Remove Chakra UI
```bash
npm uninstall @chakra-ui/vue-next @chakra-ui/vue-system @emotion/css
```

### Phase 2: Install Naive UI
```bash
npm install -D naive-ui
```

### Phase 3: Update Configuration
1. Update `main.ts` plugin setup
2. Migrate theme configuration
3. Update component imports

### Phase 4: Component Migration
1. Map Chakra UI → Naive UI component equivalents
2. Update Stores.vue component usage
3. Update any other affected components

### Phase 5: Testing & Validation
1. Verify Store Management page renders
2. Test all CRUD operations
3. Validate theme and styling
4. Ensure authentication flow works

## 🎨 Component Mapping Reference

| Chakra UI | Naive UI | Notes |
|-----------|----------|-------|
| CButton | NButton | Direct replacement |
| CBox | NDiv/NCard | Context dependent |
| CTable | NDataTable | More powerful component |
| CMenu | NDropdown | Different API structure |
| CSelect | NSelect | Direct replacement |
| CInput | NInput | Direct replacement |

## 🔗 Resume Point

**After migration completion, resume at**: Store Management page implementation with all Naive UI components properly configured and functional.

**Expected Resolution**: All current component resolution errors will be eliminated, and development can continue with a stable, mature UI framework.

---

*Created: 2025-01-15 01:16 UTC*
*Priority: CRITICAL - Block all other development until completed*