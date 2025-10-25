# Test Case Title Editor Components

This directory contains components for editing and managing test case titles in the new project flow.

## Component Overview

### EditTitlesView
The main container component for editing test case titles. Located at `/new/edit-titles`.

**Features:**
- Real-time validation of titles
- Automatic saving of changes
- Limit enforcement (min 1, max 20 titles)
- Error handling and user feedback

**Usage:**
```tsx
// In Astro page
import { EditTitlesView } from '@/components/new-project/EditTitlesView';

<EditTitlesView client:load />
```

### TitlesList
Renders a list of editable test case titles.

**Props:**
```typescript
interface TitlesListProps {
  titles: string[];
  onTitleChange: (index: number, newTitle: string) => void;
  onTitleDelete: (index: number) => void;
}
```

### TitleItem
Individual editable title component with edit and delete functionality.

**Props:**
```typescript
interface TitleItemProps {
  title: string;
  index: number;
  onChange: (newTitle: string) => void;
  onDelete: () => void;
}
```

**Features:**
- Edit mode toggle
- Keyboard support (Enter to save, Escape to cancel)
- Input validation
- Delete confirmation

### AddTitleButton
Button component for adding new test case titles.

**Props:**
```typescript
interface AddTitleButtonProps {
  onAdd: () => void;
  disabled: boolean;
}
```

### TitlesValidator
Displays validation messages and title count information.

**Props:**
```typescript
interface TitlesValidatorProps {
  errorMessage: string | null;
  titlesCount: number;
}
```

## Custom Hooks

### useTitlesValidation
Hook for validating test case titles.

```typescript
const validation = useTitlesValidation(titles, {
  minTitles: 1,
  maxTitles: 20,
  minTitleLength: 3
});
```

**Returns:**
```typescript
interface ValidationState {
  errorMessage: string | null;
  isValid: boolean;
}
```

### useAutosave
Hook for automatically saving data with debouncing.

```typescript
const { isAutosaving, lastSavedAt, error, load } = useAutosave(data, {
  key: 'storage-key',
  debounceMs: 500,
  onError: (error) => console.error(error)
});
```

## Services

### TitlesService
Service for managing test case titles persistence.

```typescript
// Load saved titles
const titles = TitlesService.loadTitles();

// Save titles
await TitlesService.saveTitles(titles, projectId);

// Clear saved titles
TitlesService.clearSavedTitles();
```

## Workflow

1. User arrives at `/new/edit-titles` after generating titles
2. EditTitlesView loads saved titles from localStorage
3. User can:
   - Edit existing titles
   - Add new titles (up to 20)
   - Delete titles (maintaining minimum of 1)
4. Changes are automatically saved to localStorage
5. When connected to a project, changes sync with the backend

## Error Handling

- Invalid or missing titles redirect to `/new`
- Validation errors are displayed in the UI
- Network errors during save are logged and retried
- User is notified of autosave status

## Integration with AI Service

The title editor integrates with the AI service flow:

1. Titles are initially generated via `GenerateTitlesButton`
2. Generated titles are saved using `TitlesService`
3. EditTitlesView loads these titles for editing
4. Modified titles can be used for test case generation

## Styling

Components use Shadcn/ui for consistent styling:
- Card components for title items
- Input components for editing
- Button variants for actions
- Alert components for validation messages

## Best Practices

- Keep titles concise and descriptive
- Avoid duplicate titles
- Maintain a reasonable number of titles (1-20)
- Save changes frequently
- Handle all error cases gracefully
