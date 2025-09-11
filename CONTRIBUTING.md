# Contributing to GO Commerce Administration Console

Thank you for your interest in contributing to the GO Commerce Administration Console! This guide will help you understand our development process and coding standards.

## 📋 Prerequisites

Before contributing, ensure you have:

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Git**: Latest version
- **VS Code**: Recommended with suggested extensions

## 🚀 Getting Started

1. **Fork and clone the repository**:
   ```bash
   git clone https://github.com/your-username/gocommerce-admin-console.git
   cd gocommerce-admin-console/frontend/admin-console
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Copy environment configuration**:
   ```bash
   cp .env.example .env.development
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

## 🔧 Development Workflow

### Branch Naming Convention

Use descriptive branch names that follow this pattern:

- `feature/ADMIN-123-add-user-management` - New features
- `fix/ADMIN-456-fix-login-bug` - Bug fixes  
- `docs/update-readme` - Documentation updates
- `refactor/improve-api-client` - Code refactoring
- `test/add-auth-tests` - Test additions

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(auth): add Keycloak integration
fix(ui): resolve button hover state issue
docs: update API documentation
test(store): add Pinia store unit tests
```

### Pull Request Process

1. **Create feature branch** from `main`
2. **Make your changes** following our coding standards
3. **Write/update tests** for your changes
4. **Run the test suite**: `npm run test`
5. **Check code quality**: `npm run lint && npm run format`
6. **Update documentation** if needed
7. **Create pull request** with clear description

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] New tests added for features
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors/warnings

## Related Issues
Closes #123
```

## 📝 Coding Standards

### TypeScript Guidelines

- **Strict mode**: Always enabled, no `any` types
- **Type definitions**: Comprehensive interfaces for all data
- **Null safety**: Use optional chaining and nullish coalescing
- **Naming**: PascalCase for types/interfaces, camelCase for variables

```typescript
// ✅ Good
interface UserProfile {
  id: string
  name: string
  email?: string
}

const getUserName = (user: UserProfile): string => {
  return user.name ?? 'Unknown'
}

// ❌ Bad  
const getUserName = (user: any) => {
  return user.name || 'Unknown'
}
```

### Vue 3 Guidelines

- **Composition API**: Use `<script setup>` syntax
- **TypeScript**: All props and emits must be typed
- **Single File Components**: Keep components focused and small
- **Reactivity**: Use `ref()` and `reactive()` appropriately

```vue
<!-- ✅ Good -->
<script setup lang="ts">
interface Props {
  title: string
  count?: number
}

interface Emits {
  (e: 'update', value: string): void
}

const props = withDefaults(defineProps<Props>(), {
  count: 0
})

const emit = defineEmits<Emits>()
</script>
```

### Component Architecture

Follow **Atomic Design** principles:

- **Atoms**: Basic UI elements (Button, Input, Badge)
- **Molecules**: Simple component groups (SearchBox, FormField)
- **Organisms**: Complex component sections (Header, DataTable)
- **Templates**: Page layouts
- **Pages**: Route-specific components

### File Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.vue`)
- **Composables**: camelCase starting with 'use' (e.g., `useAuth.ts`)
- **Stores**: camelCase (e.g., `authStore.ts`)
- **Types**: camelCase (e.g., `userTypes.ts`)
- **Utilities**: camelCase (e.g., `dateUtils.ts`)

### Import/Export Standards

```typescript
// ✅ Preferred: Named exports
export const useAuth = () => { }
export type UserProfile = { }

// ✅ Path aliases
import { useAuth } from '@/composables/useAuth'
import type { UserProfile } from '@/types/auth'

// ❌ Avoid: Default exports for utilities
export default function useAuth() { }
```

## 🧪 Testing Standards

### Test Organization

- **Unit tests**: `*.test.ts` alongside source files
- **Integration tests**: `tests/integration/`
- **E2E tests**: `tests/e2e/` (planned)

### Testing Guidelines

- **Test behavior, not implementation**
- **Use descriptive test names**
- **Follow AAA pattern**: Arrange, Act, Assert
- **Mock external dependencies**

```typescript
// ✅ Good test example
describe('useAuth', () => {
  it('should return user profile when authenticated', async () => {
    // Arrange
    const mockUser = { id: '1', name: 'Test User' }
    vi.mocked(keycloakService.getUser).mockResolvedValue(mockUser)
    
    // Act
    const { user, isAuthenticated } = useAuth()
    await nextTick()
    
    // Assert
    expect(isAuthenticated.value).toBe(true)
    expect(user.value).toEqual(mockUser)
  })
})
```

### Test Coverage

- **Minimum**: 80% code coverage
- **Focus areas**: Business logic, API interactions, user workflows
- **Tools**: Vitest with coverage reporting

## 🎨 UI/UX Guidelines

### Chakra UI Usage

- **Use system components** first before custom implementations
- **Follow design tokens** for consistency
- **Responsive design** using Chakra's responsive props
- **Accessibility** compliance with ARIA standards

```vue
<!-- ✅ Good Chakra usage -->
<template>
  <CBox 
    :padding="{ base: 4, md: 8 }"
    :bg="{ light: 'white', dark: 'gray.800' }"
  >
    <CHeading size="lg">{{ title }}</CHeading>
  </CBox>
</template>
```

### Design System

- **Colors**: Professional blue/gray palette
- **Spacing**: 8px grid system
- **Typography**: System font stack with clear hierarchy
- **Breakpoints**: Mobile-first responsive design

## 🔍 Code Review Guidelines

### For Authors

- **Self-review** your code before submitting
- **Keep changes focused** and atomic
- **Write clear commit messages** and PR descriptions
- **Respond to feedback** promptly and professionally

### For Reviewers

- **Be constructive** and specific in feedback
- **Focus on**: Logic, performance, security, maintainability
- **Consider**: Architecture impact, user experience, accessibility
- **Approve only** when confident in the changes

### Review Checklist

- [ ] Code follows established patterns
- [ ] Tests are comprehensive and passing  
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met

## 🚨 Security Guidelines

- **Environment variables**: Never commit secrets
- **Authentication**: Always validate tokens
- **Input validation**: Sanitize all user inputs
- **HTTPS only**: All external requests
- **Dependencies**: Regular security audits

## 📊 Performance Standards

- **Bundle size**: Monitor and optimize chunk sizes
- **Loading states**: Implement for all async operations
- **Lazy loading**: Use for routes and heavy components
- **Caching**: Implement appropriate API caching strategies

## 🔗 Useful Resources

- [Vue 3 Style Guide](https://vuejs.org/style-guide/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Chakra UI Documentation](https://vue.chakra-ui.com/)
- [Testing Library Best Practices](https://testing-library.com/docs/guiding-principles)
- [Conventional Commits](https://www.conventionalcommits.org/)

## 🤝 Community Guidelines

- **Be respectful** and inclusive
- **Help others learn** and grow
- **Share knowledge** through documentation and examples
- **Report issues** clearly and constructively
- **Celebrate successes** and learn from failures

## 📞 Getting Help

- **Technical questions**: Create a discussion in GitHub
- **Bug reports**: Use the issue template
- **Feature requests**: Use the feature request template
- **Security issues**: Email security@gocommerce.com

---

Thank you for contributing to the GO Commerce Administration Console! Together, we're building the future of e-commerce administration. 🚀

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
