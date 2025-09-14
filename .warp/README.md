# Code Review Agent for GO Commerce Administration Console

This directory contains the Code Review Agent implementation for comprehensive pull request reviews following the SDD (Specs-Driven Development) methodology.

## Overview

The Code Review Agent is a specialized AI assistant that conducts thorough code reviews against established project standards, ensuring code quality, security, accessibility, and architectural compliance before merge approval.

## Files

- `review_prompt.md` - The core prompt defining the Code Review Agent's behavior and criteria
- `review.sh` - Bash script that prepares PR context and launches the review process
- `aliases.sh` - Shell aliases for convenient access to review commands
- `README.md` - This documentation file

## Setup

### 1. Load Shell Aliases (Recommended)

Add to your `~/.zshrc` or `~/.bashrc`:

```bash
# GO Commerce Administration Console aliases
source /Users/aquele_dinho/Projects/gocommerce/frontend/admin-console/.warp/aliases.sh
```

Then reload your shell or run:
```bash
source ~/.zshrc
```

### 2. Direct Script Usage

You can also run the review script directly:
```bash
./Users/aquele_dinho/Projects/gocommerce/frontend/admin-console/.warp/review.sh [PR_NUMBER]
```

## Usage

### Quick Review (With Aliases Loaded)

```bash
# Review the most recent PR
review

# Review a specific PR by number
review 3

# Review a PR by GitHub URL
review https://github.com/user/repo/pull/3
```

### Available Commands (After Loading Aliases)

```bash
# Code review
review [PR_NUMBER]      # Launch code review agent

# Navigation
admin-console           # Go to project root
goadmin                # Go to project root (short)

# Development
dev-start              # Start dev server
dev-test               # Run tests
dev-lint               # Run linting
dev-build              # Build project

# Git & GitHub
git-status             # Git status
pr-list                # List PRs
pr-view [NUMBER]       # View PR details
pr-create              # Create new PR
```

## How It Works

1. **PR Analysis**: The script fetches PR details, changed files, and diff content using GitHub CLI
2. **Context Preparation**: Creates a comprehensive review context with PR information and code changes
3. **Prompt Generation**: Combines the Code Review Agent prompt with the specific PR context
4. **Review Launch**: Provides formatted input for Warp's AI assistant

## Review Process

The Code Review Agent analyzes PRs across four key areas:

### 🔍 Technical Quality
- TypeScript strict mode compliance (zero `any` types)
- ESLint/Prettier conformance
- Component architecture adherence (atomic design)
- Performance considerations and potential regressions
- Security vulnerabilities (XSS, CSRF, input sanitization)

### 🧪 Testing Quality
- Unit test coverage (target: 80%+ for new code)
- Test scenarios comprehensiveness (edge cases, error states)
- Integration test presence and quality
- Mock strategies appropriateness
- Accessibility testing inclusion

### 📋 SDD Compliance
- Issue properly linked with closing keywords
- Branch naming convention followed
- Commit messages use conventional format
- Documentation updates where required
- Specification alignment verified

### 🎯 Project Standards
- Vue 3 best practices (Composition API, `<script setup>`)
- Atomic design pattern compliance
- WCAG 2.1 AA accessibility standards
- State management patterns (Pinia integration)
- Router integration correctness

## Review Output Format

The agent provides standardized review responses including:

- **Review Summary**: ✅ Approved / 🔄 Request Changes / ⏸️ Manual Review Required
- **Risk Level**: Low/Medium/High complexity assessment
- **Key Findings**: Strengths, issues, and required actions
- **Detailed Checklist**: Results for all quality criteria
- **Specific Recommendations**: Actionable next steps with priority levels

## Example Workflow

```bash
# 1. Create and switch to feature branch
git checkout -b feature/ADMIN-4-user-dashboard

# 2. Make your changes and commit
git add .
git commit -m "feat(dashboard): implement user dashboard component"

# 3. Push and create PR
git push origin feature/ADMIN-4-user-dashboard
pr-create

# 4. Review the PR
review 4

# 5. Copy the generated prompt and context into Warp's AI assistant
# 6. Get comprehensive review feedback
# 7. Address any issues found
# 8. Request final review and merge
```

## Requirements

- **GitHub CLI (`gh`)**: Must be installed and authenticated
- **jq**: For JSON processing (usually pre-installed on macOS)
- **Warp Terminal**: With AI assistant enabled
- **Project Access**: Appropriate GitHub repository permissions

## Troubleshooting

### "Command not found: gh"
Install GitHub CLI:
```bash
brew install gh
gh auth login
```

### "Command not found: jq"
Install jq:
```bash
brew install jq
```

### "Could not find PR"
- Ensure you're in the correct repository
- Check that the PR number exists
- Verify GitHub CLI authentication: `gh auth status`

### "Permission denied"
Make sure the script is executable:
```bash
chmod +x /Users/aquele_dinho/Projects/gocommerce/frontend/admin-console/.warp/review.sh
```

## Integration with SDD Workflow

The Code Review Agent is designed to integrate seamlessly with the Specs-Driven Development process:

1. **WARP Phase**: Requirements documented in WARP.md
2. **PLAN Phase**: Technical design in PLAN.md
3. **TASKS Phase**: Implementation breakdown in TASKS.md
4. **Implementation Phase**: Code development with regular commits
5. **Review Phase**: **← Code Review Agent validates all previous phases**
6. **Merge Phase**: Approved changes integrated into main branch

## Configuration

The agent behavior is configured through the specification in `WARP.md`. Key configuration areas:

- **Review Criteria**: Quality standards and thresholds
- **Escalation Triggers**: When to flag for manual review
- **Output Format**: Response structure and sections
- **Project Standards**: Framework-specific best practices

## Updates and Maintenance

When updating the Code Review Agent:

1. Update the specification in `WARP.md`
2. Modify `review_prompt.md` if needed
3. Test with sample PRs
4. Update this documentation
5. Notify the development team of changes

---

For questions or improvements to the Code Review Agent, please create an issue in the repository with the label `type: tooling`.