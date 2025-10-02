
# Contributing to CPAnalyzer

Thank you for your interest in contributing to CPAnalyzer! To ensure a smooth and collaborative development process, please follow these guidelines.

## 1. Setting Up the Development Environment

To get started with development, you need to have Node.js and npm installed. Follow these steps to set up your local environment:

1.  **Clone the repository**:
    `git clone https://github.com/danleads/cpanalyzer-demo.git`

2.  **Navigate to the project directory**:
    `cd cpanalyzer-demo`

3.  **Install the dependencies**:
    `npm install`

4.  **Run the development server**:
    `npm run dev`

The application will be available at `http://localhost:3000`.

## 2. Daily Collaboration Workflow

When working with other developers, **ALWAYS** follow this workflow to avoid conflicts:

### Essential Daily Workflow

```bash
# 1. ALWAYS start by pulling latest changes
git pull origin main

# 2. Make your changes
# ... edit files, add features, fix bugs ...

# 3. Commit your work
git add .
git commit -m "feat: description of changes"

# 4. Pull again (in case others pushed while you were working)
git pull origin main

# 5. Push your changes
git push origin main
```

### ⚠️ Important: Always Pull Before Starting Work!

This is the #1 rule for avoiding conflicts. Make it a habit:
- Pull when you start your day
- Pull before making changes
- Pull before pushing your commits

### Handling Merge Conflicts

If you encounter conflicts when pulling:

1. **Don't panic** - conflicts are normal in collaboration
2. **Check conflicted files**: `git status`
3. **Open the files** and look for conflict markers:
   ```
   <<<<<<< HEAD
   Your changes
   =======
   Their changes
   >>>>>>> origin/main
   ```
4. **Resolve conflicts** by choosing which changes to keep
5. **Remove the conflict markers**
6. **Complete the merge**:
   ```bash
   git add .
   git commit -m "resolve: merge conflicts"
   git push origin main
   ```

### Quick Command Reference

| Command | Purpose | When to Use |
|---------|---------|------------|
| `git pull origin main` | Get latest changes | **ALWAYS** before starting work |
| `git status` | See what's changed | Before committing |
| `git add .` | Stage all changes | Before committing |
| `git commit -m "message"` | Save changes locally | After making changes |
| `git push origin main` | Share changes | After committing |
| `git log --oneline -5` | See recent commits | To understand recent changes |

### Commit Message Convention

Use conventional commit format for clear history:
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

Examples:
```bash
git commit -m "feat: add multitenancy support"
git commit -m "fix: resolve login validation issue"
git commit -m "docs: update collaboration workflow"
```

## 3. Coding Standards

To maintain code quality and consistency, we adhere to the following standards:

-   **Code Style**: We use Prettier for automatic code formatting. Please ensure that your code is formatted before committing.
-   **Naming Conventions**:
    -   Components should be named in `PascalCase` (e.g., `AnalysisCard`).
    -   Files should be named in `kebab-case` (e.g., `analysis-card.tsx`).
    -   Variables and functions should be named in `camelCase` (e.g., `fetchAnalysisData`).
-   **TypeScript**: Use TypeScript for all new code. Provide types for all props, state, and function arguments.
-   **Component Structure**: Keep components small and focused on a single responsibility.

## 4. Submitting Pull Requests

When you are ready to submit your contribution, please follow these steps:

1.  **Create a new branch** for your feature or bug fix:
    `git checkout -b feature/your-feature-name`

2.  **Make your changes** and commit them with a descriptive message.

3.  **Push your branch** to the repository:
    `git push origin feature/your-feature-name`

4.  **Open a pull request** on GitHub. In the description, please include:
    -   A clear and concise summary of the changes.
    -   Any relevant context or motivation for the changes.
    -   Screenshots or recordings if the changes affect the UI.

5.  **Request a review** from one of the project maintainers.

Your pull request will be reviewed, and any necessary feedback will be provided. Once approved, it will be merged into the main branch.

Thank you for your contribution!

