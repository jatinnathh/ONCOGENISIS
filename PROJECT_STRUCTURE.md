# React + Firebase Project Structure

This project has been organized with a professional folder structure for scalability and maintainability.

## 📁 Folder Structure

```
src/
├── assets/           # Static assets (images, icons, etc.)
├── components/       # Reusable React components
├── pages/           # Page-level components (routes)
├── hooks/           # Custom React hooks
├── contexts/        # React Context providers
├── services/        # External service integrations (Firebase, APIs)
│   └── firebase.ts  # Firebase configuration & exports
├── utils/           # Utility functions and helpers
├── types/           # TypeScript type definitions
│   └── index.ts     # Central type exports
├── App.tsx          # Main App component
├── App.css          # App styles
├── main.tsx         # Application entry point
└── index.css        # Global styles
```

## 🎯 Guidelines

### Components (`src/components/`)
- Reusable UI components
- Each complex component can have its own folder
- Keep components focused and composable

### Pages (`src/pages/`)
- Route-level components
- Compose multiple components together
- Handle page-specific logic

### Hooks (`src/hooks/`)
- Custom React hooks
- Names must start with 'use'
- Keep focused on single responsibility

### Contexts (`src/contexts/`)
- Global state management
- Include provider and custom hook
- Use for shared state across components

### Services (`src/services/`)
- Firebase integration
- API clients
- Third-party service wrappers

### Utils (`src/utils/`)
- Pure utility functions
- Helper functions
- No React-specific code

### Types (`src/types/`)
- TypeScript interfaces and types
- Shared across multiple files
- Export from index.ts

## 🚀 Firebase Setup

Firebase is already configured in `src/services/firebase.ts` with:
- ✅ Authentication
- ✅ Firestore Database
- ✅ Storage
- ✅ Analytics

Import Firebase services like:
```typescript
import { auth, db, storage } from './services/firebase';
```

## 📝 Next Steps

1. Create your components in `src/components/`
2. Create your pages in `src/pages/`
3. Set up routing (install react-router-dom if needed)
4. Create custom hooks in `src/hooks/`
5. Add TypeScript types in `src/types/`

Happy coding! 🎉


