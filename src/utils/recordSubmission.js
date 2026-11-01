import { generateBiodataText } from './exportText';

const SESSION_SUBMISSION_KEY = 'shubh_parichay_active_submission';

let lastSentPayload = '';
let lastSentTime = 0;

function getActiveSubmission() {
  try {
    const raw = sessionStorage.getItem(SESSION_SUBMISSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function setActiveSubmission(info) {
  try {
    sessionStorage.setItem(SESSION_SUBMISSION_KEY, JSON.stringify(info));
  } catch {
    // ignore
  }
}

export async function recordUserSubmission(data, feedback = null) {
  if (!data || !data.fullName) return;

  const textContent = generateBiodataText(data, feedback);
  const now = Date.now();

  // Deduplication logic:
  // If this is a feedback submission, ALWAYS allow it to send through (don't block it)
  // If this is a duplicate plain submission within 15 seconds, skip sending
  const currentKey = `${data.fullName}_${feedback ? 'fb_' + feedback.rating + '_' + (feedback.comment || '') : 'initial'}`;
  if (!feedback && currentKey === lastSentPayload && (now - lastSentTime) < 15000) {
    return;
  }
  lastSentPayload = currentKey;
  lastSentTime = now;

  // Retrieve existing submission in this session for the same candidate if any
  const active = getActiveSubmission();
  const isSameUser = active && active.fullName === data.fullName && active.fileName;

  // 1. Save to local developer cache in browser
  try {
    const existing = JSON.parse(localStorage.getItem('shubh_parichay_dev_submissions') || '[]');
    existing.unshift({
      id: now,
      name: data.fullName,
      hasFeedback: Boolean(feedback),
      rating: feedback?.rating || null,
      comment: feedback?.comment || '',
      submittedAt: new Date().toISOString(),
      summary: textContent
    });
    localStorage.setItem('shubh_parichay_dev_submissions', JSON.stringify(existing.slice(0, 50)));
  } catch {
    // ignore
  }

  // 2. Send to Vercel Serverless Function to commit file to GitHub
  // If active file already exists for this candidate, append/update that file instead of creating a new one
  try {
    const response = await fetch('/api/save-submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: data.fullName,
        hasFeedback: Boolean(feedback),
        textContent,
        fileName: isSameUser ? active.fileName : undefined,
        sha: isSameUser ? active.sha : undefined
      })
    });

    if (response.ok) {
      const resData = await response.json();
      if (resData.success && resData.fileName) {
        setActiveSubmission({
          fileName: resData.fileName,
          sha: resData.sha || active?.sha,
          fullName: data.fullName,
          timestamp: now
        });
      }
      return resData;
    }
  } catch (err) {
    console.warn('Developer submission logging:', err);
  }
}
