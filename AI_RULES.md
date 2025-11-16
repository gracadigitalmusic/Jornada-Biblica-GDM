# AI Development Rules for Jornada Bíblica

This document outlines the rules and conventions for the AI editor (Dyad) working on this project. Following these guidelines ensures code consistency, maintainability, and adherence to the established architecture.

## Tech Stack Overview

The application is built with a modern, component-based architecture. Key technologies include:

-   **Framework**: React (using TypeScript)
-   **Build Tool**: Vite for fast development and optimized builds.
-   **UI Components**: **shadcn/ui** is the primary component library. It is built on top of Radix UI and styled with Tailwind CSS.
-   **Styling**: **Tailwind CSS** is used exclusively for all styling.
-   **Routing**: **React Router** (`react-router-dom`) for all client-side navigation.
-   **Animations**: **Framer Motion** for complex animations and page transitions.
-   **Icons**: **Lucide React** for a consistent and lightweight icon set.
-   **Data Fetching/Server State**: **TanStack Query** (`@tanstack/react-query`) for managing asynchronous operations, caching, and server state.
-   **Forms**: **React Hook Form** for form logic and **Zod** for schema validation.
-   **Notifications**: **Sonner** and the built-in **shadcn/ui Toaster** for user feedback.

## Library Usage Rules

To maintain a clean and simple codebase, please adhere to the following rules when choosing libraries for specific tasks.

### 1. UI and Components

-   **ALWAYS** use components from the existing `shadcn/ui` library (`@/components/ui`). These are pre-installed and should be the first choice for any UI element (Buttons, Cards, Dialogs, etc.).
-   If a required component does not exist in `shadcn/ui`, create a new, reusable component in `src/components/` following the project's existing style (using Tailwind CSS and Radix UI primitives if necessary).
-   **DO NOT** install new third-party component libraries (e.g., Material UI, Ant Design).

### 2. Styling

-   **ONLY** use **Tailwind CSS** utility classes for styling. All colors, fonts, and spacing are defined in `tailwind.config.ts` and `src/index.css`.
-   Avoid writing custom CSS files. If a complex style is needed that cannot be achieved with Tailwind, use arbitrary values or a `@layer` directive in `src/index.css` as a last resort.
-   Do not use inline `style` attributes unless it's for dynamic values that cannot be handled by Tailwind classes (e.g., animation delays, transform properties calculated in JavaScript).

### 3. Icons

-   **ALWAYS** use icons from the `lucide-react` package. This ensures visual consistency and good performance.
-   **DO NOT** install other icon libraries or use SVG files directly unless absolutely necessary.

### 4. State Management

-   For **client-side state** (e.g., modal visibility, form inputs), use React's built-in hooks: `useState`, `useReducer`, and `useContext`.
-   For **server state** (e.g., fetching data from an API, caching results), **ALWAYS** use **TanStack Query** (`@tanstack/react-query`).
-   **DO NOT** introduce complex global state management libraries like Redux, Zustand, or MobX.

### 5. Routing

-   All application routes must be defined in `src/App.tsx` using the components from `react-router-dom`.
-   Use the custom `NavLink` component in `src/components/NavLink.tsx` for navigation links that require active styling.

### 6. Animations

-   For simple transitions (hover effects, fades), use Tailwind CSS's built-in transition and animation utilities.
-   For more complex, state-driven animations or page transitions, use the `framer-motion` library.

### 7. Forms

-   For all forms, use **React Hook Form** for logic and state management.
-   Use **Zod** to define validation schemas.
-   Integrate these with the `shadcn/ui` `Form` components for a consistent look and feel.

### 8. Notifications

-   Use the `useToast` hook (from `shadcn/ui`) for standard toast notifications that require user interaction or are more prominent.
-   Use `sonner` for simpler, less intrusive notifications (e.g., "Copied to clipboard").