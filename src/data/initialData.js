export const initialBiodata = {
  themeId: 'royal-maroon',
  shloka: '॥ श्री गणेशाय नमः ॥',
  enablePetals: true,
  enableMandala: true,
  enableSuryaRays: true,
  
  // Custom theme colors (used when themeId === 'custom')
  customTheme: {
    primary: '#7a1f2b',
    secondary: '#f28c28',
    accentGold: '#c9962b',
    goldLight: '#f3d38a',
    bgCream: '#fff8ec'
  },

  // Multiple Profile Photos: first photo is primary portrait in arch
  photoUrls: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=600&h=750&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?fit=crop&w=600&h=750&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?fit=crop&w=600&h=750&q=80'
  ],
  photoUrl: '', // legacy fallback if single string
  
  // Profile Basics
  fullName: 'Abhijeet B Singh',
  profileTagline: 'Computer Engineer · Infosys · Mumbai',
  communityBadge: 'रघुवंशी',
  
  // Quick Highlight Chips
  quickHighlights: [
    { label: 'years', value: '28', autoFromDob: true },
    { label: 'height', value: "5'8\" (173 cm)" },
    { label: 'Born in', value: 'Varanasi' },
    { label: 'Kundali', value: 'Non-Manglik' }
  ],

  // About Me
  aboutMe: "I appreciate the beauty of diverse experiences and hold my family, friends, and personal interests in high regard. My academic journey led me to pursue a degree in Computer Science from Mumbai University. I am a passionate, adventurous, and creatively inclined individual with a keen interest in exploring Ancient Bharat's architectural monuments.",

  // Personal Details
  dob: '1998-05-22',
  dobFormatted: '22 May 1998',
  birthTime: '09:30 AM',
  birthPlace: 'Varanasi',
  height: "5'8\"",
  heightCm: '173',
  complexion: 'Wheatish',
  manglik: 'No', // 'No', 'Yes', 'Anshik', "Don't Know"
  rashi: 'Mesh (Aries)',
  nakshatra: 'Bharani',
  gotra: 'Kashyap',

  // Education & Career (repeater items)
  careerItems: [
    {
      id: '1',
      title: 'Digital Specialist Engineer · Infosys Ltd.',
      subtitle: 'Specialising in the Techno-Functional domain of Oracle Utilities products.'
    },
    {
      id: '2',
      title: 'Bachelor of Engineering · Computer Science',
      subtitle: 'Mumbai University'
    }
  ],

  // Interests / Hobbies
  hobbies: [
    { emoji: '🏏', text: 'Playing Cricket' },
    { emoji: '🎵', text: 'Soft Music' },
    { emoji: '🪔', text: 'Cultural Practices' },
    { emoji: '🛕', text: "Ancient Bharat's Monuments" }
  ],
  languages: ['English', 'Hindi', 'Marathi'],

  // Family Members (Mother with Gotra)
  familyMembers: [
    {
      id: 'f1',
      generation: 'Grandparents',
      relation: 'Grandfather',
      name: 'Late Mr. Tejdhari D. Singh',
      role: 'Professor',
      isLate: true
    },
    {
      id: 'f2',
      generation: 'Grandparents',
      relation: 'Grandmother',
      name: 'Mrs. Shakuntala Devi',
      role: 'Homemaker',
      isLate: false
    },
    {
      id: 'f3',
      generation: 'Parents',
      relation: 'Father',
      name: 'Mr. Brajeshkumar T. Singh',
      role: 'Retired B.M.C. Teacher',
      isLate: false
    },
    {
      id: 'f4',
      generation: 'Parents',
      relation: 'Mother',
      name: 'Mrs. Reema B. Singh (Gotra: Sandilya)',
      role: 'Homemaker',
      isLate: false
    }
  ],

  // Contact Information
  contacts: {
    phone: '+91 98695 07492',
    phoneLabel: 'Father',
    email: 'abhijeet.b.singh@gmail.com',
    currentAddress: '603, Bldg No. 61, EMP Phase 4, Thakur Village, Kandivali East, Mumbai 400101',
    nativeAddress: 'Village Sidhauni, Post S.G.R.P.G. College, Dobhi, District Jaunpur (U.P.) 222149'
  },

  // Footer Blessing
  footerBlessing: '॥ शुभम् भवतु ॥',
  footerNote: 'Thank you for taking the time to know me.'
};
