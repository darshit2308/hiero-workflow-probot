Hiero Workflow Bot (Probot Service)
A centralized, scalable GitHub App built with Probot to automate repository governance and contributor workflows across the Hiero ecosystem.

🏗 Architectural Vision
Unlike traditional GitHub Actions that require duplicating .yml files across every repository, this bot operates as a centralized service.

Horizontal Scalability: Install once at the Organization level to manage dozens of repositories from a single codebase.

Feature Toggles: Repository-specific behavior is managed via a single .github/hiero.yml file, allowing maintainers to switch features on or off without touching the bot's core logic.

State Consistency: Implements custom verification logic to handle GitHub’s eventual consistency (search indexing delays), ensuring accurate contributor data even during high-velocity merges.

🚀 Core Features
1. Intelligent Repository Governance
PR Title Linter: Enforces Conventional Commits (feat:, fix:, chore:) to ensure clean, automated changelogs.

Large PR Warning: Automatically flags "Monster PRs" (size-configurable) to protect maintainer review bandwidth and encourage smaller, modular contributions.

Auto-Labeling: Detects documentation changes (.md files) and applies relevant tags instantly to streamline the review queue.

2. Contributor Onboarding & Gamification
Dynamic Welcome: Pulls custom onboarding messages from repo-level config files.

Milestone Tracking: Celebrates contributor growth at key intervals:

1st Merge: Ecosystem Welcome.

5th Merge: Core Contributor recognition.

10th Merge: Legendary status.

🛠 Technical Implementation
The "N-1" Indexing Fix
The bot includes a "sage code" implementation to handle the Search Indexing Delay. When a PR is merged, the bot double-checks the GitHub search API against the current webhook payload. If the search results are lagging, the bot manually increments the count to provide real-time, accurate feedback to the user.

Configuration (.github/hiero.yml)
Maintainers control the service per-repo with a simple YAML file:

YAML
# Toggle features as a service
welcome_message: "Welcome to the Hiero ecosystem! 🚀"
enable_linter: true
max_pr_size: 50
💻 Local Development
Installation
Clone & Install:

Bash
git clone https://github.com/darshit2308/hiero-workflow-probot.git
cd hiero-workflow-probot
npm install
Environment Setup: Create a .env file based on the Probot deployment guide.

Run:

Bash
npm start
Docker Support
Bash
docker build -t hiero-workflow-probot .
docker run -e APP_ID=<id> -e PRIVATE_KEY=<key> hiero-workflow-probot
📜 License
ISC © 2026 Darshit Khandelwal
