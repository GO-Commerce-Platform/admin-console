# GO Commerce Administration Console

Modern Vue.js administration console for GO Commerce multi-tenant e-commerce platform.

## 🚀 Overview

The GO Commerce Administration Console is a comprehensive, role-based administration interface that serves both platform administrators managing multiple stores and store administrators managing their individual stores. Built with modern web technologies, it provides intuitive navigation, real-time insights, and secure multi-tenant access control.

## ✨ Features

- **🏗️ Modern Architecture**: Vue 3 with Composition API and TypeScript strict mode
- **🎨 Professional UI**: Chakra UI Vue with customizable themes
- **🔐 Secure Authentication**: Keycloak integration with OIDC and RBAC
- **🏪 Multi-Tenant**: Platform and store-level administration
- **📊 Real-time Analytics**: Dashboard widgets and reporting
- **🧪 Comprehensive Testing**: Vitest with Testing Library
- **📱 Responsive Design**: Mobile and tablet optimized

## 🛠️ Technology Stack

- **Framework**: Vue 3.5+ with Composition API
- **Language**: TypeScript 5.x (strict mode)
- **Build Tool**: Vite 5.x
- **UI Framework**: Chakra UI Vue
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **HTTP Client**: Axios
- **Authentication**: Keycloak JS
- **Testing**: Vitest + Testing Library
- **Code Quality**: ESLint + Prettier

## 📋 Prerequisites

Before starting, ensure you have:

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **GO Commerce Server**: Running on localhost:8080
- **Keycloak**: Running on localhost:9000

## 🚀 Quick Start

1. **Clone and setup**:
   ```bash
   cd frontend/admin-console
   npm install
   ```

2. **Environment configuration**:
   ```bash
   cp .env.example .env.development
   # Edit .env.development with your configuration
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**: Navigate to http://localhost:5173

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run type-check` - Run TypeScript compiler
- `npm run lint` - Run ESLint with auto-fix
- `npm run format` - Format code with Prettier
- `npm run test` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

### Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── atoms/          # Basic UI elements
│   ├── molecules/      # Composed components
│   └── organisms/      # Complex components
├── composables/        # Vue composition functions
├── layouts/            # Page layout components
├── pages/              # Route-based page components
├── router/             # Vue Router configuration
├── stores/             # Pinia store modules
├── services/           # API service layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── assets/             # Static assets
```

### Environment Variables

Create `.env.development` from `.env.example`:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8080/api/v1

# Keycloak Authentication
VITE_KEYCLOAK_URL=http://localhost:9000
VITE_KEYCLOAK_REALM=gocommerce
VITE_KEYCLOAK_CLIENT_ID=gocommerce-admin-console

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_MODE=true
```

## 🔐 Authentication & Authorization

The application integrates with Keycloak for authentication and implements role-based access control:

### Roles

- **platform-admin**: Full access to all stores and platform features
- **store-admin**: Full access to assigned store(s)
- **product-manager**: Product catalog management
- **order-manager**: Order processing and fulfillment
- **customer-service**: Customer support and basic order access

### Route Protection

Routes are protected based on:
- Authentication status
- User roles
- Store access permissions

## 🧪 Testing

### Running Tests

```bash
# Run tests in watch mode
npm run test

# Run tests once with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### Testing Strategy

- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API service integration
- **E2E Tests**: Critical user workflows (planned)

## 🏗️ Architecture

### State Management

- **Pinia stores** organized by feature domain
- **Persistent state** for user preferences
- **Reactive updates** across components

### API Layer

- **Axios-based HTTP client** with interceptors
- **Automatic token refresh** for seamless UX
- **Error handling** and transformation
- **Type-safe API calls** with TypeScript

### Component Architecture

Following **Atomic Design** principles:
- **Atoms**: Button, Input, Badge
- **Molecules**: SearchBox, FormField
- **Organisms**: DataTable, Header, Sidebar

## 📝 Code Standards

### TypeScript

- Strict mode enabled
- No `any` types allowed
- Comprehensive type definitions
- Path aliases for imports

### Vue

- Composition API with `<script setup>`
- TypeScript integration
- Consistent component structure
- Props validation

### Styling

- Chakra UI components
- Professional blue/gray theme
- 8px grid system
- Responsive breakpoints

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

### Docker Support

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Follow the established code style (ESLint + Prettier)
2. Write tests for new features
3. Update documentation as needed
4. Use conventional commit messages
5. Create pull requests for all changes

### Development Workflow

1. Create feature branch: `git checkout -b feature/admin-123-new-feature`
2. Make changes and test
3. Commit: `git commit -m "feat: add new feature"`
4. Push and create PR
5. Link to GitHub issues in PR description

## 📚 Additional Resources

- [Vue 3 Documentation](https://vuejs.org/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Chakra UI Vue](https://vue.chakra-ui.com/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vitest Guide](https://vitest.dev/)
- [Keycloak Documentation](https://www.keycloak.org/documentation)

## 📄 License

This project is proprietary software. All rights reserved.

---

**GO Commerce Team** - Building the future of e-commerce administration.

<!-- Copilot: This file may have been generated or refactored by GitHub Copilot. -->
