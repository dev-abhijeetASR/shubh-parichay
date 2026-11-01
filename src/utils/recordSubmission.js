import { generateBiodataText } from './exportText';

let lastSentPayload = '';
let lastSentTime = 0;

export async function recordUserSubmission(data, feedback = null) {
  if (!data || !data.fullName) return;

  const textContent = generateBiodataText(data, feedback);
  const now = Date.now();

  // Deduplication logic:
  // If this is a feedback submission, ALWAYS allow it to send through (don't block it)
  // If this is a duplicate plain submission within 15 seconds, skip sending
  const currentKey = `${data.fullName}_${feedback ? 'fb_' + feedback.rating : 'initial'}`;
  if (!feedback && currentKey === lastSentPayload && (now - lastSentTime) < 15000) {
    return;
  }
  lastSentPayload = currentKey;
  lastSentTime = now;

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
  try {
    await fetch('/api/save-submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: data.fullName,
        hasFeedback: Boolean(feedback),
        textContent
      })
    });
  } catch (err) {
    console.warn('Developer submission logging:', err);
  }
}
