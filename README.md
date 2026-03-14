# Hiero Workflow Probot

A GitHub App built with **Probot** that automates contributor workflows and improves developer onboarding for the **Hiero ecosystem**.

The bot listens to GitHub events such as issues and pull requests and performs helpful actions like welcoming contributors, labeling documentation PRs, and tracking contributor milestones.

---

# Features

## 1️⃣ Contributor Onboarding

When a user opens a new issue, the bot reads configuration from `.github/hiero.yml`.

If a `welcome_message` is present, the bot automatically posts it as a comment.

Example config:

```
welcome_message: |
  👋 Welcome to Hiero!
  Thank you for opening your first issue.
  A maintainer will review it soon.
```

This allows repositories to customize onboarding messages.

---

## 2️⃣ Automatic Documentation Labeling

When a pull request is opened or reopened:

* The bot checks all changed files
* If any file ends with `.md`
* The PR automatically gets the `documentation` label

This helps maintainers quickly identify documentation contributions.

---

## 3️⃣ Contributor Milestone Tracker

The bot celebrates contributor milestones by tracking merged pull requests.

Milestones:

* 🎉 **1 merged PR** → Welcome message
* 🔥 **5 merged PRs** → Core contributor message
* 🏆 **10 merged PRs** → Legendary contributor recognition

Because GitHub's search index can be delayed, the bot includes a workaround to ensure the most recent merged PR is counted correctly.

---

# Installation

Clone the repository:

```
git clone https://github.com/darshit2308/hiero-workflow-probot.git
cd hiero-workflow-probot
```

Install dependencies:

```
npm install
```

Start the Probot app:

```
npm start
```

---

# Configuration

Add a configuration file in your repository:

```
.github/hiero.yml
```

Example:

```
welcome_message: |
  Welcome to the Hiero ecosystem!
  Thanks for contributing 🚀
```

---

# Docker Setup

Build the container:

```
docker build -t hiero-workflow-probot .
```

Run the container:

```
docker run \
  -e APP_ID=<app-id> \
  -e PRIVATE_KEY=<pem-value> \
  hiero-workflow-probot
```

---

# Contributing

Contributions are welcome!

If you find a bug or want to suggest improvements:

1. Open an issue
2. Submit a pull request

Please read the contributing guide before submitting changes.

---

# License

ISC © 2026 Darshit Khandelwal
