# AI Commit Generator

Generate AI-powered Git commit messages directly from Visual Studio Code using OpenAI GPT-4o.

## 🚀 Features

- Automatically generate commit messages from staged changes
- Supports custom commit message format
- Enforces max message length
- Select commit types (e.g., feat, fix, chore, etc.)
- Configurable via extension settings
- Backend powered by your own OpenAI API key

## ⚙️ Extension Settings
- `aiCommitGenerator.backendUrl`: URL of your backend API that generates commit messages
- `aiCommitGenerator.authToken`: **Authorization token** (AUTH_SECRET) for security
- `aiCommitGenerator.commitFormat`: Format of the commit message (e.g., `{type}: {message}`)
- `aiCommitGenerator.commitTypes`: Allowed commit types
- `aiCommitGenerator.maxLength`: Max length of commit message

## 🧪 How to Use

1. Stage your Git changes
2. Open the Command Palette (`Ctrl+Shift+P`)
3. Run `AI Commit: Generate Commit Message`
4. Review and Edit the message
5. Press `Enter` to commit your changes
