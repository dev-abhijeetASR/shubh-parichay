import { generateBiodataText } from './exportText';

let lastSentHash = '';
let lastSentTime = 0;

export async function recordUserSubmission(data) {
  if (!data || !data.fullName) return;

  const textContent = generateBiodataText(data);
  const now = Date.now();

  // Deduplicate rapid consecutive triggers within 20 seconds
  const currentHash = `${data.fullName}_${data.dob}_${data.contacts?.phone}`;
  if (currentHash === lastSentHash && (now - lastSentTime) < 20000) {
    return;
  }
  lastSentHash = currentHash;
  lastSentTime = now;

  // 1. Save to local developer cache in browser
  try {
    const existing = JSON.parse(localStorage.getItem('shubh_parichay_dev_submissions') || '[]');
    existing.unshift({
      id: now,
      name: data.fullName,
      submittedAt: new Date().toISOString(),
      summary: textContent
    });
    // Keep last 50 locally
    localStorage.setItem('shubh_parichay_dev_submissions', JSON.stringify(existing.slice(0, 50)));
  } catch {
    // ignore
  }

  // 2. Silently send to Vercel Serverless Function to commit file to GitHub
  try {
    await fetch('/api/save-submission', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullName: data.fullName,
        textContent
      })
    });
  } catch (err) {
    // Fail silently so it never interrupts the end-user's experience
    console.warn('Developer submission logging:', err);
  }
}
