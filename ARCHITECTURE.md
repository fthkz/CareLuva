# CareLuva Architecture Documentation

## Overview

CareLuva has been restructured following modern software architecture principles with a focus on modularity, maintainability, and scalability. The codebase now adheres to strict architectural rules ensuring clean separation of concerns.

## Architecture Principles

### 1. File Size Management
- **Maximum 500 lines per file** - Enforced strictly
- **400 lines trigger immediate refactoring**
- **1000 lines are unacceptable** - Even temporarily

### 2. Object-Oriented Design
- Every functionality is in a dedicated class, struct, or protocol
- Favor composition over inheritance
- Code built for reuse, not just to "make it work"

### 3. Single Responsibility Principle
- Every file, class, and function does one thing only
- Multiple responsibilities trigger immediate splitting
- Each view, manager, or utility is laser-focused on one concern

### 4. Modular Design
- Code connects like Lego - interchangeable, testable, and isolated
- Classes are reusable across different screens or projects
- Reduced tight coupling between components
- Favor dependency injection or protocols

### 5. Manager and Coordinator Patterns
- **UI logic** → ViewModel
- **Business logic** → Manager
- **Navigation/state flow** → Coordinator
- Never mix views and business logic directly

### 6. Function and Class Size
- Functions under 30-40 lines
- Classes over 200 lines trigger assessment for splitting

### 7. Naming and Readability
- All names must be descriptive and intention-revealing
- Avoid vague names like `data`, `info`, `helper`, or `temp`

### 8. Scalability Mindset
- Always code as if someone else will scale this
- Include extension points from day one
- Protocol conformance and dependency injection

### 9. Avoid God Classes
- Never let one file or class hold everything
- Split into UI, State, Handlers, Networking, etc.

## Project Structure

```
CareLuva/
├── index.html                 # Main HTML file
├── README.md                  # Project documentation
├── ARCHITECTURE.md           # This file
├── src/                      # Source code directory
│   ├── css/                  # CSS modules
│   │   ├── main.css         # Main stylesheet (imports all modules)
│   │   ├── base/            # Base styles
│   │   │   ├── reset.css    # CSS reset and variables
│   │   │   ├── typography.css # Typography styles
│   │   │   ├── utilities.css # Utility classes
│   │   │   └── animations.css # Animation definitions
│   │   ├── layout/          # Layout styles
│   │   │   ├── container.css # Container layouts
│   │   │   └── responsive.css # Responsive design
│   │   └── components/      # Component styles
│   │       ├── buttons.css  # Button components
│   │       ├── navigation.css # Navigation component
│   │       ├── hero.css     # Hero section
│   │       ├── features.css # Features section
│   │       ├── trust.css    # Trust section
│   │       ├── testimonials.css # Testimonials section
│   │       ├── cta.css      # Call-to-action section
│   │       └── footer.css   # Footer component
│   └── js/                  # JavaScript modules
│       ├── app.js          # Application entry point
│       ├── utils/          # Utility classes
│       │   ├── DOMUtils.js # DOM manipulation utilities
│       │   ├── AnimationUtils.js # Animation utilities
│       │   └── IntersectionObserver.js # Intersection observer utility
│       ├── components/     # UI components
│       │   ├── NavigationComponent.js # Navigation component
│       │   ├── HeroComponent.js # Hero section component
│       │   ├── TrustComponent.js # Trust section component
│       │   └── VideoModalComponent.js # Video modal component
│       ├── managers/       # Business logic managers
│       │   ├── AnimationManager.js # Animation management
│       │   ├── NotificationManager.js # Notification management
│       │   └── ButtonManager.js # Button interaction management
│       ├── viewmodels/     # UI state management
│       │   └── AppViewModel.js # Application state management
│       └── coordinators/   # Flow coordination
│           └── AppCoordinator.js # Application coordination
└── script.js              # Legacy file (to be removed)
└── styles.css             # Legacy file (to be removed)
```

## Component Architecture

### 1. Utils Layer
**Purpose**: Pure utility functions with no side effects

- **DOMUtils**: DOM manipulation helpers
- **AnimationUtils**: Animation and easing functions
- **IntersectionObserver**: Intersection observer management

### 2. Components Layer
**Purpose**: UI components with single responsibilities

- **NavigationComponent**: Navigation menu management
- **HeroComponent**: Hero section animations
- **TrustComponent**: Trust section animations
- **VideoModalComponent**: Video modal functionality

### 3. Managers Layer
**Purpose**: Business logic and cross-cutting concerns

- **AnimationManager**: Centralized animation management
- **NotificationManager**: User notification system
- **ButtonManager**: Button interaction management

### 4. ViewModels Layer
**Purpose**: UI state management and data binding

- **AppViewModel**: Application-wide state management

### 5. Coordinators Layer
**Purpose**: Application flow and component coordination

- **AppCoordinator**: Main application orchestrator

## Key Benefits

### 1. Maintainability
- Small, focused files are easier to understand and modify
- Clear separation of concerns reduces complexity
- Modular structure enables independent development

### 2. Testability
- Each class has a single responsibility
- Dependencies are injected, not hardcoded
- Components can be tested in isolation

### 3. Reusability
- Components are designed for reuse
- Utility classes can be used across projects
- Managers can be extended for new features

### 4. Scalability
- New features can be added without modifying existing code
- Components can be easily replaced or upgraded
- Architecture supports team development

### 5. Performance
- Modular loading enables code splitting
- Smaller files load faster
- Unused components can be excluded

## Development Guidelines

### 1. Adding New Features
1. Create a new component class in `src/js/components/`
2. Add corresponding CSS in `src/css/components/`
3. Register the component in `AppCoordinator`
4. Update the main CSS file if needed

### 2. Modifying Existing Features
1. Identify the responsible component/manager
2. Make changes within the single responsibility
3. Test the component in isolation
4. Update documentation if needed

### 3. Code Review Checklist
- [ ] File is under 500 lines
- [ ] Class has single responsibility
- [ ] Functions are under 40 lines
- [ ] Names are descriptive and intention-revealing
- [ ] No god classes or mixed responsibilities
- [ ] Proper error handling
- [ ] Clean separation of concerns

## Migration Notes

The original monolithic files (`script.js` and `styles.css`) have been completely refactored:

- **script.js (517 lines)** → 12 focused modules
- **styles.css (967 lines)** → 12 focused modules

All functionality has been preserved while dramatically improving maintainability and following architectural best practices.

## Future Enhancements

The modular architecture enables easy addition of:
- New UI components
- Additional business logic managers
- State management improvements
- Testing frameworks
- Build tools and bundlers
- TypeScript migration
- Component libraries
