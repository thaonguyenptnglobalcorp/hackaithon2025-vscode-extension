import * as vscode from 'vscode';
import { execSync } from 'child_process';
import { fetchCommitMessageFromAPI, fetchReviewCommitMessageFromAPI } from './apis';

export function activate(context: vscode.ExtensionContext) {
	const generateCommitMessagesDisposable = initGenerateCommitMessagesDisposable();
	const generateReviewCommitDisposable = initGenerateReviewCommentsDisposable();
	context.subscriptions.push(generateCommitMessagesDisposable);
	context.subscriptions.push(generateReviewCommitDisposable);
}

function initGenerateCommitMessagesDisposable() {
	const disposable = vscode.commands.registerCommand('aicommits.generate.commit.messages', async () => {
    try {
		const result = getStagedDiffOrShowError();
		if (!result) {
			return; // If there's an error, exit the command
		}
		const { cwd, diff } = result;

		const config = vscode.workspace.getConfiguration('aiCommitGenerator');
		const format = config.get<string>('commitFormat') || 'CEP-XXX: {message}';
		const apiKey = config.get<string>('openAIKey') || '';
		const authToken = config.get<string>('authToken') || '';

		vscode.window.showInformationMessage('Generating commit message. Please wait...');

		const aiMessage = await fetchCommitMessageFromAPI(
			diff, 
			format, 
			apiKey, 
			authToken
		);

		const input = await vscode.window.showInputBox({
			prompt: 'Review and edit your commit message:',
			value: aiMessage,
		});

		if (input) {
			execSync(`git commit -m "${input.replace(/"/g, '\\"')}"`, { cwd, encoding: 'utf-8' });
			vscode.window.showInformationMessage('✅ Commit created!');
		}
    } catch (err: any) {
      vscode.window.showErrorMessage('Error: ' + err.message);
    }
  });

  return disposable;
}

function initGenerateReviewCommentsDisposable() {
	  const disposable = vscode.commands.registerCommand('aicommits.generate.review.comments', async () => {
	try {
	  	const result = getStagedDiffOrShowError();
		if (!result) {
			return; // If there's an error, exit the command
		}
		const { diff } = result;


	  const config = vscode.workspace.getConfiguration('aiCommitGenerator');
	  const apiKey = config.get<string>('openAIKey') || '';
	  const authToken = config.get<string>('authToken') || '';

	  vscode.window.showInformationMessage('Generating review comments. Please wait...');

	  const response = await fetchReviewCommitMessageFromAPI(diff, apiKey, authToken);
	  if (!response) {
	    vscode.window.showErrorMessage('No message generated.');
	    return;
	  }
	  vscode.window.showInformationMessage('AI Review Comments Generated: ' + response);
	} catch (err: any) {
	  vscode.window.showErrorMessage('Error: ' + err.message);
	}
  });

  return disposable;
}

function getStagedDiffOrShowError(): { cwd: string; diff: string } | null {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
        vscode.window.showErrorMessage('No workspace folder found.');
        return null;
    }

    const cwd = workspaceFolders[0].uri.fsPath;
    const diff = execSync('git diff --staged', { cwd, encoding: 'utf-8' });

    if (!diff.trim()) {
        vscode.window.showWarningMessage('No staged changes found. Stage your changes first.');
        return null;
    }

    return { cwd, diff };
}

export function deactivate() {}