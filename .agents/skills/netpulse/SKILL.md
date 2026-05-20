```markdown
# netpulse Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches you the core development patterns and conventions used in the `netpulse` TypeScript backend, which is built on the Express framework. You'll learn how to structure files, write and organize code, follow commit message conventions, and implement and test new features in alignment with the project's standards.

## Coding Conventions

### File Naming
- Use **camelCase** for all file names.
  - Example: `userController.ts`, `authService.ts`

### Import Style
- Use **relative imports** for internal modules.
  - Example:
    ```typescript
    import { getUser } from './userService';
    ```

### Export Style
- Both named and default exports are used.
  - Named export example:
    ```typescript
    export function authenticateUser() { ... }
    ```
  - Default export example:
    ```typescript
    export default router;
    ```

### Commit Messages
- Use the `feat` prefix for new features.
- Commit messages are concise (average ~46 characters).
  - Example: `feat: add user authentication middleware`

## Workflows

### Adding a New Feature
**Trigger:** When implementing a new endpoint, service, or functionality  
**Command:** `/add-feature`

1. Create a new file using camelCase naming (e.g., `newFeature.ts`).
2. Use relative imports to include dependencies.
3. Export your functions or classes using named or default exports as appropriate.
4. Write a Jest test file named `newFeature.test.ts` in the same or a `__tests__` directory.
5. Commit your changes with a message like:  
   `feat: add [brief description of feature]`

### Writing and Running Tests
**Trigger:** When adding or updating code that requires validation  
**Command:** `/run-tests`

1. Create a test file with the `.test.ts` suffix (e.g., `userService.test.ts`).
2. Use Jest's testing syntax to write your tests.
   ```typescript
   import { getUser } from './userService';

   describe('getUser', () => {
     it('should return user data', () => {
       expect(getUser(1)).toEqual({ id: 1, name: 'Alice' });
     });
   });
   ```
3. Run tests using the Jest CLI:
   ```
   npx jest
   ```

## Testing Patterns

- **Framework:** Jest
- **File naming:** Test files use the `*.test.ts` pattern.
- **Example:**
  ```typescript
  import { add } from './mathService';

  describe('add', () => {
    it('adds two numbers', () => {
      expect(add(2, 3)).toBe(5);
    });
  });
  ```

## Commands
| Command        | Purpose                                 |
|----------------|-----------------------------------------|
| /add-feature   | Scaffold and commit a new feature       |
| /run-tests     | Run all Jest tests in the codebase      |
```
