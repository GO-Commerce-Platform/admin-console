#!/bin/bash

# GO Commerce Administration Console - Code Review Agent
# Usage: ./review.sh [PR_NUMBER|PR_URL]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Project root directory
PROJECT_ROOT="/Users/aquele_dinho/Projects/gocommerce/frontend/admin-console"
WARP_FILE="$PROJECT_ROOT/WARP.md"
PROMPT_FILE="$PROJECT_ROOT/.warp/review_prompt.md"

# Check if we're in the right directory
if [[ ! -f "$WARP_FILE" ]]; then
    echo -e "${RED}Error: Could not find WARP.md. Please run this script from the project root.${NC}"
    exit 1
fi

# Check for help flag
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo -e "${GREEN}GO Commerce Administration Console - Code Review Agent${NC}"
    echo ""
    echo -e "${BLUE}Usage:${NC}"
    echo "  $0 [PR_NUMBER|PR_URL]  Review specific PR"
    echo "  $0                     Review most recent PR"
    echo "  $0 --help             Show this help message"
    echo ""
    echo -e "${BLUE}Examples:${NC}"
    echo "  $0 3                              # Review PR #3"
    echo "  $0 https://github.com/user/repo/pull/3  # Review PR by URL"
    echo "  $0                                # Review most recent PR"
    echo ""
    echo -e "${BLUE}Requirements:${NC}"
    echo "  - GitHub CLI (gh) must be installed and authenticated"
    echo "  - jq must be installed for JSON processing"
    echo "  - Must run from GO Commerce admin console project directory"
    echo ""
    echo -e "${BLUE}For complete documentation, see:${NC}"
    echo "  $PROJECT_ROOT/.warp/README.md"
    exit 0
fi

# Get PR information
PR_INPUT="$1"
if [[ -z "$PR_INPUT" ]]; then
    echo -e "${BLUE}ℹ️  No PR specified. Looking for the most recent PR...${NC}"
    # Try to get the most recent PR for this repository
    PR_INPUT=$(gh pr list --limit 1 --json number --jq '.[0].number' 2>/dev/null || echo "")
    if [[ -z "$PR_INPUT" ]]; then
        echo -e "${YELLOW}⚠️  Could not find any PRs. Please specify a PR number or URL.${NC}"
        echo "Usage: $0 [PR_NUMBER|PR_URL]"
        exit 1
    fi
    echo -e "${GREEN}✓ Found PR #$PR_INPUT${NC}"
fi

# Extract PR number from URL if needed
if [[ "$PR_INPUT" == *"github.com"* ]]; then
    PR_NUMBER=$(echo "$PR_INPUT" | grep -oE '[0-9]+$')
else
    PR_NUMBER="$PR_INPUT"
fi

echo -e "${BLUE}🔍 Starting comprehensive code review for PR #$PR_NUMBER...${NC}"
echo ""

# Get PR details
echo -e "${BLUE}📋 Fetching PR details...${NC}"
PR_DETAILS=$(gh pr view "$PR_NUMBER" --json title,body,additions,deletions,files,commits,author 2>/dev/null || echo "")

if [[ -z "$PR_DETAILS" ]]; then
    echo -e "${RED}❌ Error: Could not fetch PR #$PR_NUMBER details.${NC}"
    echo "Please check that the PR exists and you have access to it."
    exit 1
fi

# Get file changes
echo -e "${BLUE}📂 Analyzing changed files...${NC}"
CHANGED_FILES=$(gh pr diff "$PR_NUMBER" --name-only 2>/dev/null || echo "")
FILE_COUNT=$(echo "$CHANGED_FILES" | wc -l | tr -d ' ')

# Get diff content
echo -e "${BLUE}🔄 Getting diff content...${NC}"
DIFF_CONTENT=$(gh pr diff "$PR_NUMBER" 2>/dev/null || echo "")

echo -e "${GREEN}✓ Analysis complete${NC}"
echo ""
echo -e "${BLUE}📊 PR Overview:${NC}"
echo "$PR_DETAILS" | jq -r '"  Title: " + .title'
echo "$PR_DETAILS" | jq -r '"  Author: " + .author.login'
echo "$PR_DETAILS" | jq -r '"  Files changed: " + (.files | length | tostring)'
echo "$PR_DETAILS" | jq -r '"  Additions: +" + (.additions | tostring) + " lines"'
echo "$PR_DETAILS" | jq -r '"  Deletions: -" + (.deletions | tostring) + " lines"'
echo ""

# Create review context
REVIEW_CONTEXT="
# Code Review Context

## PR Information
$(echo "$PR_DETAILS" | jq -r '. | "**Title:** " + .title + "\n**Author:** " + .author.login + "\n**Files Changed:** " + (.files | length | tostring) + "\n**Lines Added:** " + (.additions | tostring) + "\n**Lines Deleted:** " + (.deletions | tostring)')

## PR Description
$(echo "$PR_DETAILS" | jq -r '.body // "No description provided"')

## Changed Files
$CHANGED_FILES

## Diff Content (First 100 lines)
\`\`\`diff
$(echo "$DIFF_CONTENT" | head -100)
\`\`\`

---

**Instructions:** Please conduct a comprehensive code review of this PR following the Code Review Agent specification in WARP.md. Focus on:

1. **Technical Quality**: TypeScript compliance, architecture adherence, security
2. **Testing Quality**: Coverage, scenarios, accessibility testing  
3. **SDD Compliance**: Issue linking, branch naming, commit format
4. **Project Standards**: Vue 3 best practices, atomic design, WCAG compliance

Provide your review in the standardized format with clear status, findings, and recommendations.
"

# Create temporary file with review context
TEMP_FILE=$(mktemp)
echo "$REVIEW_CONTEXT" > "$TEMP_FILE"

echo -e "${BLUE}🚀 Launching code review analysis...${NC}"
echo "Review context saved to: $TEMP_FILE"
echo ""
echo -e "${YELLOW}💡 Pro tip: Copy the content above and paste it into Warp's AI assistant with the following prompt:${NC}"
echo ""
echo -e "${GREEN}---START PROMPT---${NC}"
cat "$PROMPT_FILE"
echo ""
echo -e "${BLUE}---REVIEW CONTEXT---${NC}"
cat "$TEMP_FILE"
echo -e "${GREEN}---END PROMPT---${NC}"
echo ""

# Cleanup
rm "$TEMP_FILE"

echo -e "${GREEN}✅ Code review preparation complete!${NC}"
echo -e "${BLUE}ℹ️  Use the above prompt and context with Warp's AI assistant to get your comprehensive code review.${NC}"