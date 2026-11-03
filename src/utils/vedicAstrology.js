// Vedic Astrology & Calculations Engine for ShubhParichay
// Computes Sidereal (Nirayana) Moon Sign (Janma Chandra Rashi) and age accurately

export const RASHI_LIST = [
  { value: 'Mesh (Aries) · मेष', label: 'Mesh (Aries) · मेष', english: 'Aries', hindi: 'मेष', sanskrit: 'मेष' },
  { value: 'Vrishabh (Taurus) · वृषभ', label: 'Vrishabh (Taurus) · वृषभ', english: 'Taurus', hindi: 'वृषभ', sanskrit: 'वृषभ' },
  { value: 'Mithun (Gemini) · मिथुन', label: 'Mithun (Gemini) · मिथुन', english: 'Gemini', hindi: 'मिथुन', sanskrit: 'मिथुन' },
  { value: 'Kark (Cancer) · कर्क', label: 'Kark (Cancer) · कर्क', english: 'Cancer', hindi: 'कर्क', sanskrit: 'कर्क' },
  { value: 'Simha (Leo) · सिंह', label: 'Simha (Leo) · सिंह', english: 'Leo', hindi: 'सिंह', sanskrit: 'सिंह' },
  { value: 'Kanya (Virgo) · कन्या', label: 'Kanya (Virgo) · कन्या', english: 'Virgo', hindi: 'कन्या', sanskrit: 'कन्या' },
  { value: 'Tula (Libra) · तुला', label: 'Tula (Libra) · तुला', english: 'Libra', hindi: 'तुला', sanskrit: 'तुला' },
  { value: 'Vrishchik (Scorpio) · वृश्चिक', label: 'Vrishchik (Scorpio) · वृश्चिक', english: 'Scorpio', hindi: 'वृश्चिक', sanskrit: 'वृश्चिक' },
  { value: 'Dhanu (Sagittarius) · धनु', label: 'Dhanu (Sagittarius) · धनु', english: 'Sagittarius', hindi: 'धनु', sanskrit: 'धनु' },
  { value: 'Makar (Capricorn) · मकर', label: 'Makar (Capricorn) · मकर', english: 'Capricorn', hindi: 'मकर', sanskrit: 'मकर' },
  { value: 'Kumbh (Aquarius) · कुम्भ', label: 'Kumbh (Aquarius) · कुम्भ', english: 'Aquarius', hindi: 'कुम्भ', sanskrit: 'कुम्भ' },
  { value: 'Meen (Pisces) · मीन', label: 'Meen (Pisces) · मीन', english: 'Pisces', hindi: 'मीन', sanskrit: 'मीन' }
];

export const NAKSHATRA_LIST = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra',
  'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni',
  'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha',
  'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
];

/**
 * Calculates candidate's age in completed years from Date of Birth
 * @param {string} dobString - Format 'YYYY-MM-DD'
 * @returns {string} Age in years or empty string
 */
export function calculateAge(dobString) {
  if (!dobString) return '';
  try {
    const parts = dobString.split('-');
    if (parts.length === 3) {
      const birthDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 ? String(age) : '';
    }
  } catch {
    return '';
  }
  return '';
}

/**
 * Helper to parse various time string formats (12h with AM/PM or 24h)
 */
function parseTimeString(timeStr) {
  let hours = 12;
  let minutes = 0;
  if (!timeStr) return { hours, minutes };

  const str = String(timeStr).trim();
  const ampmMatch = str.match(/(\d+)(?::(\d+))?\s*(am|pm)/i);
  if (ampmMatch) {
    let h = parseInt(ampmMatch[1], 10);
    const m = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const isPm = ampmMatch[3].toLowerCase() === 'pm';
    if (isPm && h < 12) h += 12;
    if (!isPm && h === 12) h = 0;
    return { hours: h, minutes: m };
  }

  const match24 = str.match(/(\d+):(\d+)/);
  if (match24) {
    return {
      hours: parseInt(match24[1], 10),
      minutes: parseInt(match24[2], 10)
    };
  }

  return { hours, minutes };
}

function deg2rad(d) {
  return (d * Math.PI) / 180;
}

function normalizeDegrees(deg) {
  const d = deg % 360;
  return d < 0 ? d + 360 : d;
}

/**
 * Computes Vedic Sidereal Moon Sign (Chandra Rashi) & Nakshatra using Lahiri Ayanamsha
 * @param {string} dob - 'YYYY-MM-DD'
 * @param {string} birthTime - e.g. '09:30 AM' or '14:30'
 * @param {string} birthPlace - e.g. 'Mumbai' (defaults to standard Indian Standard Time UTC+5:30)
 * @returns {object|null}
 */
export function calculateVedicRashi(dob, birthTime = '', birthPlace = '') {
  if (!dob) return null;

  try {
    const parts = dob.split('-');
    if (parts.length !== 3) return null;
    let Y = parseInt(parts[0], 10);
    let M = parseInt(parts[1], 10);
    const D = parseInt(parts[2], 10);

    if (isNaN(Y) || isNaN(M) || isNaN(D)) return null;

    const { hours, minutes } = parseTimeString(birthTime);

    // Standard Indian Standard Time offset (IST = UTC+5.5)
    // Most Indian marriage biodatas are within Bharat or IST reference
    const istOffset = 5.5;
    const universalTimeHours = hours + minutes / 60 - istOffset;

    if (M <= 2) {
      Y -= 1;
      M += 12;
    }

    const A = Math.floor(Y / 100);
    const B = 2 - A + Math.floor(A / 4);
    const JD =
      Math.floor(365.25 * (Y + 4716)) +
      Math.floor(30.6001 * (M + 1)) +
      D +
      universalTimeHours / 24 +
      B -
      1524.5;

    // Julian centuries from J2000.0
    const T = (JD - 2451545.0) / 36525;

    // Astronomical lunar orbital elements
    const Lp = normalizeDegrees(218.3164477 + 481267.88123421 * T);
    const D_elong = normalizeDegrees(297.8501921 + 445267.1114034 * T);
    const M_sun = normalizeDegrees(357.5291092 + 35999.0502909 * T);
    const Mp_moon = normalizeDegrees(134.9633964 + 477198.8675055 * T);
    const F_lat = normalizeDegrees(93.272095 + 483202.0175233 * T);

    // Major lunar perturbations for ecliptic longitude
    const pert =
      6.288774 * Math.sin(deg2rad(Mp_moon)) +
      1.274027 * Math.sin(deg2rad(2 * D_elong - Mp_moon)) +
      0.658314 * Math.sin(deg2rad(2 * D_elong)) +
      0.213618 * Math.sin(deg2rad(2 * Mp_moon)) -
      0.185116 * Math.sin(deg2rad(M_sun)) -
      0.114332 * Math.sin(deg2rad(2 * F_lat)) +
      0.058793 * Math.sin(deg2rad(2 * D_elong - 2 * Mp_moon)) +
      0.057066 * Math.sin(deg2rad(2 * D_elong - M_sun - Mp_moon)) +
      0.053322 * Math.sin(deg2rad(2 * D_elong + Mp_moon)) +
      0.045758 * Math.sin(deg2rad(2 * D_elong - M_sun)) -
      0.040923 * Math.sin(deg2rad(M_sun - Mp_moon)) -
      0.03472 * Math.sin(deg2rad(D_elong)) -
      0.030383 * Math.sin(deg2rad(M_sun + Mp_moon)) +
      0.015327 * Math.sin(deg2rad(2 * D_elong - 2 * F_lat));

    const tropLongitude = normalizeDegrees(Lp + pert);

    // Lahiri (Chitra Paksha) Ayanamsha conversion from Sayana to Nirayana
    const actualYear = parseInt(parts[0], 10);
    const ayanamsha = 23.858072 + 0.0139697 * (actualYear - 2000) + 0.0003086 * T;
    const siderealLongitude = normalizeDegrees(tropLongitude - ayanamsha);

    const rashiIndex = Math.min(11, Math.max(0, Math.floor(siderealLongitude / 30)));
    const nakshatraIndex = Math.min(26, Math.max(0, Math.floor(siderealLongitude / (360 / 27))));
    const charan = Math.min(4, Math.max(1, Math.floor((siderealLongitude % (360 / 27)) / (360 / 108)) + 1));

    const matchedRashi = RASHI_LIST[rashiIndex];
    const nakshatraName = NAKSHATRA_LIST[nakshatraIndex];

    return {
      rashiValue: matchedRashi.value,
      rashiLabel: matchedRashi.label,
      englishSign: matchedRashi.english,
      hindiSign: matchedRashi.hindi,
      nakshatra: `${nakshatraName} (Charan ${charan})`,
      nakshatraName,
      charan,
      siderealLongitude
    };
  } catch (err) {
    console.warn('Vedic astrology calculation error:', err);
    return null;
  }
}

/**
 * Maps any arbitrary rashi string (e.g. 'Mesh (Aries)' or 'Leo' or 'Scorpio')
 * to standard RASHI_LIST value
 */
export function normalizeRashiValue(current) {
  if (!current) return '';
  const str = String(current).toLowerCase().trim();

  for (const item of RASHI_LIST) {
    if (
      item.value === current ||
      str === item.english.toLowerCase() ||
      str === item.hindi.toLowerCase() ||
      str.includes(item.english.toLowerCase()) ||
      str.includes(item.hindi.toLowerCase())
    ) {
      return item.value;
    }
  }

  return current;
}
