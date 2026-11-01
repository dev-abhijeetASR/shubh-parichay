export const THEMES = [
  {
    id: 'royal-maroon',
    name: 'Royal Maroon & Gold',
    subtitle: 'Classic Vedic & Regal',
    primary: '#7a1f2b',
    primaryDark: '#4a0f18',
    secondary: '#f28c28',
    accentGold: '#c9962b',
    goldLight: '#f3d38a',
    bgCream: '#fff8ec',
    cardBg: '#fffdf8',
    borderColor: '#efd9b4',
    ink: '#3b1d14',
    heroBg: 'linear-gradient(160deg, #8f2433 0%, #7a1f2b 45%, #4a0f18 100%)',
    badgeBg: 'linear-gradient(180deg, #fff0bf, #f3c25a)',
    headerColor: '#7a1f2b',
    previewDot: 'bg-[#7a1f2b]',
  },
  {
    id: 'emerald-gold',
    name: 'Pavitra Emerald & Gold',
    subtitle: 'Royal South & Vedic Green',
    primary: '#134e38',
    primaryDark: '#0a2f22',
    secondary: '#d97706',
    accentGold: '#d4af37',
    goldLight: '#fae49d',
    bgCream: '#f4f9f5',
    cardBg: '#fcfffd',
    borderColor: '#cde3d6',
    ink: '#0e291e',
    heroBg: 'linear-gradient(160deg, #1b6348 0%, #134e38 45%, #0a2f22 100%)',
    badgeBg: 'linear-gradient(180deg, #fff2cc, #f4d068)',
    headerColor: '#134e38',
    previewDot: 'bg-[#134e38]',
  },
  {
    id: 'peacock-blue',
    name: 'Peacock Blue & Gold',
    subtitle: 'Divine Krishna & Majestic',
    primary: '#123f66',
    primaryDark: '#08233b',
    secondary: '#ea580c',
    accentGold: '#e5b84c',
    goldLight: '#fbe8a6',
    bgCream: '#f3f8fc',
    cardBg: '#fcfdff',
    borderColor: '#cce0f0',
    ink: '#0c2338',
    heroBg: 'linear-gradient(160deg, #1a568a 0%, #123f66 45%, #08233b 100%)',
    badgeBg: 'linear-gradient(180deg, #fff3cf, #f3ca5a)',
    headerColor: '#123f66',
    previewDot: 'bg-[#123f66]',
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold & Blush',
    subtitle: 'Soft, Romantic & Modern',
    primary: '#882d49',
    primaryDark: '#54172a',
    secondary: '#e17153',
    accentGold: '#dca358',
    goldLight: '#fce2bc',
    bgCream: '#fff7f7',
    cardBg: '#fffdfd',
    borderColor: '#f2d5dc',
    ink: '#451622',
    heroBg: 'linear-gradient(160deg, #a13d5d 0%, #882d49 45%, #54172a 100%)',
    badgeBg: 'linear-gradient(180deg, #ffeef2, #f3b4c4)',
    headerColor: '#882d49',
    previewDot: 'bg-[#882d49]',
  },
  {
    id: 'saffron-amber',
    name: 'Saffron & Sandalwood',
    subtitle: 'Vedic Sandhya & Auspicious',
    primary: '#a84310',
    primaryDark: '#6b2505',
    secondary: '#d97706',
    accentGold: '#ca8a04',
    goldLight: '#fed7aa',
    bgCream: '#fffaf2',
    cardBg: '#fffdfa',
    borderColor: '#fed7aa',
    ink: '#451a03',
    heroBg: 'linear-gradient(160deg, #c25218 0%, #a84310 45%, #6b2505 100%)',
    badgeBg: 'linear-gradient(180deg, #fef3c7, #fcd34d)',
    headerColor: '#a84310',
    previewDot: 'bg-[#a84310]',
  }
];

export function getResolvedTheme(data) {
  if (data.themeId === 'custom' && data.customTheme) {
    const c = data.customTheme;
    const primary = c.primary || '#7a1f2b';
    const secondary = c.secondary || '#f28c28';
    const gold = c.accentGold || '#c9962b';
    const goldLight = c.goldLight || '#f3d38a';
    const bg = c.bgCream || '#fff8ec';

    return {
      id: 'custom',
      name: 'Custom Theme',
      subtitle: 'Personalized Palette',
      primary,
      primaryDark: adjustColor(primary, -30),
      secondary,
      accentGold: gold,
      goldLight,
      bgCream: bg,
      cardBg: '#ffffff',
      borderColor: goldLight,
      ink: '#222222',
      heroBg: `linear-gradient(160deg, ${adjustColor(primary, 20)} 0%, ${primary} 45%, ${adjustColor(primary, -40)} 100%)`,
      badgeBg: `linear-gradient(180deg, #fff2cc, ${goldLight})`,
      headerColor: primary,
      previewDot: 'bg-stone-800',
    };
  }

  return THEMES.find(t => t.id === data.themeId) || THEMES[0];
}

// Lighten/darken a hex color
function adjustColor(hex, percent) {
  let num = parseInt(hex.replace('#', ''), 16);
  let amt = Math.round(2.55 * percent);
  let R = (num >> 16) + amt;
  let B = ((num >> 8) & 0x00ff) + amt;
  let G = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (B < 255 ? (B < 1 ? 0 : B) : 255) * 0x100 +
      (G < 255 ? (G < 1 ? 0 : G) : 255)
    )
      .toString(16)
      .slice(1)
  );
}

export const SHLOKA_PRESETS = [
  { id: 'ganesh', text: '॥ श्री गणेशाय नमः ॥', label: 'Shree Ganeshay Namah' },
  { id: 'radha-krishna', text: '॥ श्री राधा-कृष्णाभ्यां नमः ॥', label: 'Shree Radha-Krishnabhyam Namah' },
  { id: 'shiva', text: '॥ ॐ नमः शिवाय ॥', label: 'Om Namah Shivaya' },
  { id: 'gurudev', text: '॥ श्री गुरुदेव नमः ॥', label: 'Shree Gurudev Namah' },
  { id: 'saraswati', text: '॥ ॐ ऐं सरस्वत्यै नमः ॥', label: 'Om Aim Saraswatyai Namah' },
  { id: 'waheguru', text: '॥ ੴ सतिगुर प्रसादि ॥', label: 'Ik Onkar Satgur Prasad' },
  { id: 'custom', text: '॥ शुभम् भवतु ॥', label: 'Custom Shloka / Blessing' }
];
