# Quick Setup: Code Review Agent

## 🚀 One-Time Setup (Recommended)

Add this line to your `~/.zshrc` file:

```bash
# GO Commerce Administration Console aliases
source /Users/aquele_dinho/Projects/gocommerce/frontend/admin-console/.warp/aliases.sh
```

Then reload your shell:
```bash
source ~/.zshrc
```

## ✅ Verify Setup

Test that the aliases work:
```bash
review --help  # Should show the review script help
pr-list        # Should list current PRs
```

## 🎯 Quick Usage

```bash
# Review most recent PR
review

# Review specific PR
review 3

# Other useful commands
pr-list        # List all PRs  
pr-status      # Show PR status
dev-test       # Run tests
```

## 📚 Full Documentation

See `.warp/README.md` for complete documentation.

---

**Ready to use!** The Code Review Agent is now set up and ready to provide comprehensive code reviews following the GO Commerce Administration Console standards.