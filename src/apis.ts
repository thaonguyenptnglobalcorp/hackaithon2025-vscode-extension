import fetch from 'node-fetch';

export async function fetchCommitMessageFromAPI(
  diff: string,
  format: string,
  apiKey: string,
  authToken: string
): Promise<string> {
  const response = await fetch("https://hackaithon2025-backend.onrender.com/generate/commit-messages", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
	    'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      diff,
      apiKey,
      format,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch from AI backend');
  }

  const data = await response.json() as { message: string | undefined };
  return data.message || 'No message generated.';
}

export async function fetchReviewCommitMessageFromAPI(
  diff: string,
  apiKey: string,
  authToken: string
): Promise<string> {
  const response = await fetch("https://hackaithon2025-backend.onrender.com/generate/review-comments", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
    body: JSON.stringify({
      diff,
      apiKey
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to fetch from AI backend');
  }

  const data = await response.json() as { message: string | undefined };
  return data.message || 'No message generated.';
}