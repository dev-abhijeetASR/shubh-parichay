import { calculateAge } from './vedicAstrology';

export function generateBiodataText(data, feedback = null) {
  // Calculate live age from DOB
  const age = calculateAge(data.dob) || '28';

  // Height formatting
  let heightStr = data.height || '';
  if (data.height && data.heightCm) {
    heightStr = `${data.height} (${data.heightCm} cm)`;
  } else if (data.heightCm) {
    heightStr = `${data.heightCm} cm`;
  }

  const divider = '='.repeat(60);
  const subDivider = '-'.repeat(60);

  let text = '';
  text += `${data.shloka || '॥ श्री गणेशाय नमः ॥'}\n\n`;
  text += `${divider}\n`;
  text += `MARRIAGE BIODATA · SHUBHPARICHAY\n`;
  text += `${divider}\n\n`;

  text += `FULL NAME           : ${data.fullName || ''}\n`;
  if (data.communityBadge) {
    text += `COMMUNITY / VANSH   : ${data.communityBadge}\n`;
  }
  if (data.profileTagline) {
    text += `PROFESSION / SUMMARY: ${data.profileTagline}\n`;
  }
  text += `\n`;

  // 1. Personal & Astrological Details
  text += `${subDivider}\n`;
  text += `1. PERSONAL & HOROSCOPE (JANMA) DETAILS\n`;
  text += `${subDivider}\n`;
  if (data.dobFormatted || data.dob) {
    text += `Date of Birth       : ${data.dobFormatted || data.dob}\n`;
  }
  text += `Age                 : ${age} years\n`;
  if (data.birthTime) {
    text += `Time of Birth       : ${data.birthTime}\n`;
  }
  if (data.birthPlace) {
    text += `Place of Birth      : ${data.birthPlace}\n`;
  }
  if (heightStr) {
    text += `Height              : ${heightStr}\n`;
  }
  if (data.manglik) {
    text += `Manglik Status      : ${data.manglik}\n`;
  }
  if (data.gotra) {
    text += `Paternal Gotra      : ${data.gotra}\n`;
  }
  if (data.rashi) {
    text += `Rashi (Moon Sign)   : ${data.rashi}\n`;
  }
  if (data.nakshatra) {
    text += `Nakshatra & Charan  : ${data.nakshatra}\n`;
  }
  if (data.complexion) {
    text += `Complexion          : ${data.complexion}\n`;
  }
  text += `\n`;

  // 2. About Me
  if (data.aboutMe) {
    text += `${subDivider}\n`;
    text += `2. ABOUT ME (INTRODUCTION)\n`;
    text += `${subDivider}\n`;
    text += `${data.aboutMe}\n\n`;
  }

  // 3. Education & Career
  if (Array.isArray(data.careerItems) && data.careerItems.length > 0) {
    text += `${subDivider}\n`;
    text += `3. EDUCATION & CAREER\n`;
    text += `${subDivider}\n`;
    data.careerItems.forEach((item, idx) => {
      text += `${idx + 1}. ${item.title || ''}\n`;
      if (item.subtitle) {
        text += `   ${item.subtitle}\n`;
      }
    });
    text += `\n`;
  }

  // 4. Interests & Languages
  const hobbiesList = (data.hobbies || []).map(h => `${h.emoji || '•'} ${h.text}`).join(', ');
  const langList = (data.languages || []).join(', ');
  if (hobbiesList || langList) {
    text += `${subDivider}\n`;
    text += `4. INTERESTS & LANGUAGES\n`;
    text += `${subDivider}\n`;
    if (hobbiesList) text += `Hobbies & Interests : ${hobbiesList}\n`;
    if (langList) text += `Languages Known     : ${langList}\n`;
    text += `\n`;
  }

  // 5. Family Background
  if (Array.isArray(data.familyMembers) && data.familyMembers.length > 0) {
    text += `${subDivider}\n`;
    text += `5. FAMILY BACKGROUND (PARIVAR)\n`;
    text += `${subDivider}\n`;
    data.familyMembers.forEach((m) => {
      const relation = (m.relation || 'Relative').padEnd(20, ' ');
      const lateStr = m.isLate ? '(Late) ' : '';
      const roleStr = m.role ? ` - ${m.role}` : '';
      text += `${relation}: ${lateStr}${m.name || ''}${roleStr}\n`;
    });
    text += `\n`;
  }

  // 6. Contact Information
  if (data.contacts) {
    text += `${subDivider}\n`;
    text += `6. CONTACT DETAILS\n`;
    text += `${subDivider}\n`;
    if (data.contacts.phone) {
      const label = data.contacts.phoneLabel ? ` (${data.contacts.phoneLabel})` : '';
      text += `Phone / WhatsApp    : ${data.contacts.phone}${label}\n`;
    }
    if (data.contacts.email) {
      text += `Email               : ${data.contacts.email}\n`;
    }
    if (data.contacts.currentAddress) {
      text += `Current Address     : ${data.contacts.currentAddress}\n`;
    }
    if (data.contacts.nativeAddress) {
      text += `Native Place Address: ${data.contacts.nativeAddress}\n`;
    }
    text += `\n`;
  }

  // 7. User Feedback & Rating (if provided)
  if (feedback && (feedback.rating || feedback.comment)) {
    const starStr = '★'.repeat(feedback.rating || 5) + '☆'.repeat(5 - (feedback.rating || 5));
    text += `${divider}\n`;
    text += `USER FEEDBACK & EXPERIENCE RATING\n`;
    text += `${divider}\n`;
    text += `Star Rating         : ${starStr} (${feedback.rating || 5}/5 Stars)\n`;
    if (feedback.comment) {
      text += `User Feedback/Notes : ${feedback.comment}\n`;
    }
    text += `Submitted Timestamp : ${feedback.submittedAt || new Date().toISOString()}\n`;
    text += `\n`;
  }

  text += `${divider}\n`;
  text += `${data.footerBlessing || '॥ शुभम् भवतु ॥'}\n`;
  if (data.footerNote) {
    text += `${data.footerNote}\n`;
  }
  text += `Generated with ShubhParichay (शुभ परिचय)\n`;
  text += `${divider}\n`;

  return text;
}

export function downloadBiodataText(data, feedback = null) {
  const content = generateBiodataText(data, feedback);
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cleanName = (data.fullName || 'Biodata').replace(/[^a-zA-Z0-9]/g, '_');
  a.download = `${cleanName}_Biodata_Summary.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
