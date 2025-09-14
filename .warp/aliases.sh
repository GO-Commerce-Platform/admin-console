#!/bin/bash

# GO Commerce Administration Console - Shell Aliases
# Source this file in your shell to enable review commands:
# source /Users/aquele_dinho/Projects/gocommerce/frontend/admin-console/.warp/aliases.sh

# Define project root
export GOCOMMERCE_ADMIN_ROOT="/Users/aquele_dinho/Projects/gocommerce/frontend/admin-console"

# Code Review Agent alias
alias review='$GOCOMMERCE_ADMIN_ROOT/.warp/review.sh'

# Quick navigation aliases
alias admin-console='cd $GOCOMMERCE_ADMIN_ROOT'
alias goadmin='cd $GOCOMMERCE_ADMIN_ROOT'

# Development server aliases
alias dev-start='cd $GOCOMMERCE_ADMIN_ROOT && npm run dev'
alias dev-test='cd $GOCOMMERCE_ADMIN_ROOT && npm run test'
alias dev-lint='cd $GOCOMMERCE_ADMIN_ROOT && npm run lint'
alias dev-build='cd $GOCOMMERCE_ADMIN_ROOT && npm run build'

# Git workflow aliases for this project
alias git-status='cd $GOCOMMERCE_ADMIN_ROOT && git status'
alias git-branch='cd $GOCOMMERCE_ADMIN_ROOT && git branch'
alias git-log='cd $GOCOMMERCE_ADMIN_ROOT && git log --oneline --graph -10'

# GitHub CLI aliases for this project
alias pr-list='cd $GOCOMMERCE_ADMIN_ROOT && gh pr list'
alias pr-view='cd $GOCOMMERCE_ADMIN_ROOT && gh pr view'
alias pr-create='cd $GOCOMMERCE_ADMIN_ROOT && gh pr create'
alias pr-status='cd $GOCOMMERCE_ADMIN_ROOT && gh pr status'

# Project-specific testing aliases
alias test-unit='cd $GOCOMMERCE_ADMIN_ROOT && npm run test:unit'
alias test-coverage='cd $GOCOMMERCE_ADMIN_ROOT && npm run test -- --coverage'
alias test-watch='cd $GOCOMMERCE_ADMIN_ROOT && npm run test -- --watch'

echo "GO Commerce Administration Console aliases loaded ✓"
echo "Available commands:"
echo "  review [PR_NUMBER]  - Launch code review agent"
echo "  admin-console       - Navigate to project root"
echo "  dev-start          - Start development server"
echo "  dev-test           - Run tests"
echo "  pr-list            - List PRs"
echo "  pr-view [NUMBER]   - View PR details"