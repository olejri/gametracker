# AI Coding Agent Guidelines for GameTracker

This document provides guidelines for AI coding agents working on the GameTracker project.

## Project Overview

GameTracker is a Next.js web application for tracking board game collections and game sessions. It uses:

- **Framework**: Next.js 13 with TypeScript
- **Styling**: Tailwind CSS with dark mode support
- **UI Components**: Custom reusable components + HeadlessUI + HeroIcons
- **State Management**: React Context (ThemeContext, GameGroupContext)
- **Backend**: tRPC with Prisma ORM
- **Authentication**: Clerk

## Tailwind Color Palette

The project uses a consistent color palette defined in `src/lib/constants.ts`. **Always use these predefined color constants** instead of hardcoding Tailwind classes.

### Icon Colors (ICON_COLORS)

Used for icon wrappers with foreground/background combinations:

| Color   | Foreground        | Background       |
|---------|-------------------|------------------|
| sky     | `text-sky-700`    | `bg-sky-50`      |
| purple  | `text-purple-700` | `bg-purple-50`   |
| teal    | `text-teal-700`   | `bg-teal-50`     |
| red     | `text-red-700`    | `bg-red-50`      |
| yellow  | `text-yellow-700` | `bg-yellow-50`   |
| indigo  | `text-indigo-700` | `bg-indigo-50`   |
| blue    | `text-blue-700`   | `bg-blue-50`     |

**Usage:**
```tsx
import { ICON_COLORS } from "npm/lib/constants";

<IconWrapper
  icon={PlayIcon}
  foreground={ICON_COLORS.sky.foreground}
  background={ICON_COLORS.sky.background}
/>
```

### Badge Colors (BADGE_COLORS)

Used for status badges and labels:

| Color  | Classes                          |
|--------|----------------------------------|
| green  | `bg-green-100 text-green-800`    |
| blue   | `bg-blue-100 text-blue-800`      |
| red    | `bg-red-100 text-red-800`        |
| yellow | `bg-yellow-100 text-yellow-800`  |
| gray   | `bg-gray-100 text-gray-800`      |

**Usage:**
```tsx
import { StatusBadge } from "npm/components/ui";

<StatusBadge color="green">Active</StatusBadge>
```

### Button Variants (BUTTON_VARIANTS)

Used for consistent button styling:

| Variant   | Classes                                       |
|-----------|-----------------------------------------------|
| primary   | `bg-indigo-600 hover:bg-indigo-700 text-white`|
| secondary | `bg-gray-600 hover:bg-gray-700 text-white`   |
| danger    | `bg-red-800 hover:bg-red-700 text-white`     |
| success   | `bg-green-600 hover:bg-green-700 text-white` |

**Usage:**
```tsx
import { Button } from "npm/components/ui";

<Button variant="primary">Submit</Button>
<Button variant="danger">Delete</Button>
```

### Base Theme Colors

The application uses these core colors throughout:

- **Primary Action**: `indigo-500`, `indigo-600`, `indigo-700` (focus rings, active states, buttons)
- **Success/CTA**: `green-500`, `green-600` (call-to-action buttons, positive indicators)
- **Background (Light)**: `white`, `gray-50`, `gray-100`, `gray-200`
- **Background (Dark)**: `gray-700`, `gray-800`, `gray-900`
- **Text (Light)**: `gray-900`, `gray-700`, `gray-500`, `gray-400`
- **Text (Dark)**: `white`, `gray-100`, `gray-300`, `gray-400`
- **Borders (Light)**: `gray-200`, `gray-300`
- **Borders (Dark)**: `gray-600`, `gray-700`

## Reusable Components

**Always check existing components before creating new ones.** The project has a dedicated UI component library in `src/components/ui/`.

### Available UI Components

Import from `npm/components/ui`:

| Component     | Purpose                                          |
|---------------|--------------------------------------------------|
| `Button`      | Standard button with variant support             |
| `Card`        | Container with shadow and rounded corners        |
| `CardContent` | Padded content area for Card                     |
| `Input`       | Form input with label and error support          |
| `TextArea`    | Multi-line text input with label and error       |
| `StatusBadge` | Colored badge for status indicators              |
| `IconWrapper` | Styled wrapper for HeroIcons                     |

### Other Reusable Components

Located in `src/components/`:

| Component          | File                    | Purpose                                |
|--------------------|-------------------------|----------------------------------------|
| `LoadingSpinner`   | `loading.tsx`           | Animated loading indicator             |
| `LoadingPage`      | `loading.tsx`           | Full-page loading state                |
| `Badge`            | `Badge.tsx`             | Generic badge with ring styling        |
| `SelectWithSearch` | `SelectWithSearch.tsx`  | Searchable dropdown (HeadlessUI)       |
| `MainLayout`       | `MainLayout.tsx`        | Main application layout with nav       |

### Component Usage Examples

**Always prefer the reusable components:**

```tsx
// ✅ GOOD - Using reusable components
import { Button, Card, CardContent, Input, StatusBadge } from "npm/components/ui";
import { LoadingSpinner } from "npm/components/loading";

function MyComponent() {
  return (
    <Card>
      <CardContent>
        <Input label="Player Name" placeholder="Enter name" />
        <Button variant="primary">Submit</Button>
        <StatusBadge color="green">Active</StatusBadge>
      </CardContent>
    </Card>
  );
}

// ❌ BAD - Recreating existing functionality
function MyComponent() {
  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <input className="block w-full p-2.5..." />
        <button className="bg-indigo-600...">Submit</button>
        <span className="bg-green-100 text-green-800...">Active</span>
      </div>
    </div>
  );
}
```

## Dark Mode Support

The application supports dark mode using Tailwind's `dark:` prefix. The theme is managed via `ThemeContext`.

### Dark Mode Guidelines

1. **Always include dark mode variants** for:
   - Background colors: `bg-white dark:bg-gray-800`
   - Text colors: `text-gray-900 dark:text-white`
   - Border colors: `border-gray-300 dark:border-gray-600`
   - Placeholder text: `placeholder:text-gray-400 dark:placeholder:text-gray-500`

2. **Common dark mode patterns:**
   ```tsx
   // Backgrounds
   className="bg-white dark:bg-gray-800"
   className="bg-gray-50 dark:bg-gray-700"
   className="bg-gray-100 dark:bg-gray-900"

   // Text
   className="text-gray-900 dark:text-white"
   className="text-gray-500 dark:text-gray-400"
   className="text-gray-700 dark:text-gray-300"

   // Borders
   className="border-gray-300 dark:border-gray-600"
   className="border-gray-200 dark:border-gray-700"

   // Ring/Focus states
   className="ring-white dark:ring-gray-900"
   className="focus:ring-indigo-500"
   ```

3. **Using the theme context:**
   ```tsx
   import { useTheme } from "npm/context/ThemeContext";

   function MyComponent() {
     const { isDarkMode, toggleDarkMode } = useTheme();
     // ...
   }
   ```

## Utility Functions

Use the utility functions from `src/lib/utils.ts`:

### classNames

Merge conditional class names:

```tsx
import { classNames } from "npm/lib/utils";

<div className={classNames(
  "base-classes",
  isActive && "active-classes",
  isDisabled ? "disabled-classes" : "enabled-classes"
)} />
```

### formatDate

Format dates consistently:

```tsx
import { formatDate } from "npm/lib/utils";

formatDate(new Date()); // Returns "DD.MM.YYYY"
```

## Best Practices Summary

1. **Always reuse existing components** from `src/components/ui/` before creating new ones
2. **Use color constants** from `src/lib/constants.ts` instead of hardcoding colors
3. **Include dark mode variants** for all styling
4. **Use the `classNames` utility** for conditional class names
5. **Follow existing patterns** when adding new functionality
6. **Check existing components** that might be extended rather than duplicated
7. **Import icons** from `@heroicons/react/24/outline` or `@heroicons/react/20/solid`
8. **Use HeadlessUI** components for complex interactive elements (modals, dropdowns, etc.)
