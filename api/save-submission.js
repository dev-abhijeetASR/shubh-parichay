// Vercel Serverless Function: Saves biodata text submission to GitHub in a dedicated 'submissions/' folder
// Runs securely on the server without exposing GitHub credentials to client browsers.

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { fullName, textContent } = req.body || {};

    if (!textContent) {
      return res.status(400).json({ error: 'Missing textContent' });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER || 'dev-abhijeetASR';
    const repoName = process.env.GITHUB_REPO_NAME || 'shubh-parichay';

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeName = (fullName || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
    const randomId = Math.random().toString(36).substring(2, 7);
    const fileName = `submissions/${timestamp}_${safeName}_${randomId}.txt`;

    // If GITHUB_TOKEN is configured in Vercel environment variables, commit directly to GitHub repository
    if (githubToken) {
      const contentBase64 = Buffer.from(textContent, 'utf-8').toString('base64');
      const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${fileName}`;

      const ghResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'ShubhParichay-Bot'
        },
        body: JSON.stringify({
          message: `chore(data): record biodata submission for ${fullName || 'Candidate'}`,
          content: contentBase64,
          branch: 'main'
        })
      });

      if (!ghResponse.ok) {
        const errorData = await ghResponse.json();
        console.error('GitHub API error:', errorData);
        return res.status(500).json({ error: 'Failed to commit to GitHub', details: errorData });
      }

      return res.status(200).json({
        success: true,
        savedTo: 'github',
        fileName
      });
    }

    // Fallback response if GITHUB_TOKEN is not yet added in Vercel
    return res.status(200).json({
      success: true,
      savedTo: 'pending_token',
      message: 'Submission received. Add GITHUB_TOKEN in Vercel settings to auto-commit to GitHub repository.',
      fileName
    });

  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
