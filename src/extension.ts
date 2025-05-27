// src/extension.ts
import * as vscode from 'vscode';
import { execSync } from 'child_process';
import fetch from 'node-fetch';

export function activate(context: vscode.ExtensionContext) {
  	const disposable = vscode.commands.registerCommand('aicommits.generate', async () => {
    try {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders || workspaceFolders.length === 0) {
			vscode.window.showErrorMessage('No workspace folder found.');
			return;
		}

		const cwd = workspaceFolders[0].uri.fsPath;
		const diff = execSync('git diff --staged', { cwd, encoding: 'utf-8' });

		if (!diff.trim()) {
			vscode.window.showWarningMessage('No staged changes found. Stage your changes first.');
			return;
		}


		const config = vscode.workspace.getConfiguration('aiCommitGenerator');
		const format = config.get<string>('commitFormat') || 'CEP-XXX: {message}';
		const type = config.get<string>('commitType') || 'feat';
		const maxLen = config.get<number>('maxMessageLength') || 150;

		vscode.window.showInformationMessage('Generating commit message...');

		const aiMessage = await fetchCommitMessageFromAPI(diff, { format, type, maxLen });

		const input = await vscode.window.showInputBox({
			prompt: 'Review and edit your commit message:',
			value: aiMessage,
		});

		if (input) {
			execSync(`git commit -m "${input.replace(/"/g, '\\"')}"`);
			vscode.window.showInformationMessage('✅ Commit created!');
		}
    } catch (err: any) {
      vscode.window.showErrorMessage('Error: ' + err.message);
    }
  });

  context.subscriptions.push(disposable);
}

async function fetchCommitMessageFromAPI(
  diff: string,
  options: { format: string; type: string; maxLen: number }
): Promise<string> {
  const response = await fetch('http://localhost:3001/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      diff,
      format: options.format,
      commitType: options.type,
      maxLength: options.maxLen,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch from AI backend');
  }

  const data = await response.json();
  return data.message || 'No message generated.';
}

export function deactivate() {}