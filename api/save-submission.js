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
    const { fullName, textContent, fileName: existingFileName, sha } = req.body || {};

    if (!textContent) {
      return res.status(400).json({ error: 'Missing textContent' });
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const repoOwner = process.env.GITHUB_REPO_OWNER || 'dev-abhijeetASR';
    const repoName = process.env.GITHUB_REPO_NAME || 'shubh-parichay';

    // Determine target file name and check if we are updating an existing submission
    let targetFileName = existingFileName || null;
    let fileSha = sha || null;

    // If GITHUB_TOKEN is configured in Vercel environment variables, commit directly to GitHub repository
    if (githubToken) {
      // If updating an existing file, resolve its current SHA if not provided
      if (targetFileName && !fileSha) {
        try {
          const checkUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${targetFileName}`;
          const checkRes = await fetch(checkUrl, {
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github+json',
              'User-Agent': 'ShubhParichay-Bot'
            }
          });
          if (checkRes.ok) {
            const checkData = await checkRes.json();
            fileSha = checkData.sha;
          } else {
            // File does not exist yet under this name, create fresh file
            targetFileName = null;
          }
        } catch (err) {
          console.warn('Could not verify existing file SHA, creating new file:', err);
          targetFileName = null;
        }
      }

      // If no valid existing file name, generate a unique new file name
      if (!targetFileName) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const safeName = (fullName || 'Candidate').replace(/[^a-zA-Z0-9]/g, '_');
        const randomId = Math.random().toString(36).substring(2, 7);
        targetFileName = `submissions/${timestamp}_${safeName}_${randomId}.txt`;
      }

      const contentBase64 = Buffer.from(textContent, 'utf-8').toString('base64');
      const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${targetFileName}`;

      const commitPayload = {
        message: fileSha
          ? `chore(data): append feedback to submission for ${fullName || 'Candidate'}`
          : `chore(data): record biodata submission for ${fullName || 'Candidate'}`,
        content: contentBase64,
        branch: 'main'
      };

      if (fileSha) {
        commitPayload.sha = fileSha;
      }

      let ghResponse = await fetch(url, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github+json',
          'Content-Type': 'application/json',
          'User-Agent': 'ShubhParichay-Bot'
        },
        body: JSON.stringify(commitPayload)
      });

      // Handle 409 conflict: re-fetch latest SHA and retry once
      if (ghResponse.status === 409 && targetFileName) {
        const refetchRes = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github+json',
            'User-Agent': 'ShubhParichay-Bot'
          }
        });
        if (refetchRes.ok) {
          const latestData = await refetchRes.json();
          commitPayload.sha = latestData.sha;
          ghResponse = await fetch(url, {
            method: 'PUT',
            headers: {
              'Authorization': `Bearer ${githubToken}`,
              'Accept': 'application/vnd.github+json',
              'Content-Type': 'application/json',
              'User-Agent': 'ShubhParichay-Bot'
            },
            body: JSON.stringify(commitPayload)
          });
        }
      }

      const ghData = await ghResponse.json();
      if (!ghResponse.ok) {
        console.error('GitHub API error:', ghData);
        return res.status(500).json({ error: 'Failed to commit to GitHub', details: ghData });
      }

      return res.status(200).json({
        success: true,
        savedTo: 'github',
        fileName: targetFileName,
        sha: ghData.content?.sha || null,
        updated: Boolean(fileSha)
      });
    }

    // Fallback response if GITHUB_TOKEN is not yet added in Vercel
    const fallbackName = targetFileName || `submissions/${new Date().toISOString().replace(/[:.]/g, '-')}_Candidate.txt`;
    return res.status(200).json({
      success: true,
      savedTo: 'pending_token',
      message: 'Submission received. Add GITHUB_TOKEN in Vercel settings to auto-commit to GitHub repository.',
      fileName: fallbackName
    });

  } catch (error) {
    console.error('Submission error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}
