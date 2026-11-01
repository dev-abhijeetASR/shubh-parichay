import React, { useState } from 'react';
import { THEMES, SHLOKA_PRESETS, getResolvedTheme } from '../../themes';
import InfoTooltip from '../InfoTooltip';
import { 
  Palette, 
  User, 
  Sparkles, 
  GraduationCap, 
  Users, 
  Phone, 
  Heart, 
  Upload, 
  Plus, 
  Trash2, 
  Check, 
  Calendar, 
  Star, 
  RotateCcw,
  Camera
} from 'lucide-react';

export default function FormEditor({ data, onChange }) {
  const [activeTab, setActiveTab] = useState('theme');

  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
  };

  const updateNestedField = (parent, field, value) => {
    onChange({
      ...data,
      [parent]: {
        ...data[parent],
        [field]: value
      }
    });
  };

  // Get active theme definition and current colors
  const activeThemeBase = THEMES.find(t => t.id === data.themeId) || THEMES[0];
  const activeResolvedTheme = getResolvedTheme(data);

  // When user clicks a theme, switch themeId.
  const handleSelectTheme = (themeId) => {
    onChange({
      ...data,
      themeId
    });
  };

  // Update a specific color for the CURRENTLY selected theme
  const handleUpdateThemeColor = (colorKey, colorVal) => {
    const currentOverrides = data.themeOverrides?.[data.themeId] || {
      primary: activeThemeBase.primary,
      secondary: activeThemeBase.secondary,
      accentGold: activeThemeBase.accentGold,
      goldLight: activeThemeBase.goldLight,
      bgCream: activeThemeBase.bgCream
    };

    onChange({
      ...data,
      themeOverrides: {
        ...(data.themeOverrides || {}),
        [data.themeId]: {
          ...currentOverrides,
          [colorKey]: colorVal
        }
      }
    });
  };

  // Reset current theme's colors to its original defaults
  const handleResetThemeColors = () => {
    if (!data.themeOverrides?.[data.themeId]) return;
    const updatedOverrides = { ...(data.themeOverrides || {}) };
    delete updatedOverrides[data.themeId];
    onChange({
      ...data,
      themeOverrides: updatedOverrides
    });
  };

  // Multiple Photos Upload Handler
  const handleMultiplePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const existingPhotos = Array.isArray(data.photoUrls) ? [...data.photoUrls] : (data.photoUrl ? [data.photoUrl] : []);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          existingPhotos.push(reader.result);
          onChange({
            ...data,
            photoUrls: [...existingPhotos],
            photoUrl: existingPhotos[0] || ''
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const setPrimaryPhoto = (index) => {
    if (!data.photoUrls || index >= data.photoUrls.length) return;
    const reordered = [...data.photoUrls];
    const [selected] = reordered.splice(index, 1);
    reordered.unshift(selected);
    onChange({
      ...data,
      photoUrls: reordered,
      photoUrl: reordered[0]
    });
  };

  const removePhoto = (index) => {
    const filtered = (data.photoUrls || []).filter((_, i) => i !== index);
    onChange({
      ...data,
      photoUrls: filtered,
      photoUrl: filtered[0] || ''
    });
  };

  // DOB handler that also formats date nicely
  const handleDobChange = (e) => {
    const val = e.target.value;
    let formatted = '';
    if (val) {
      try {
        const parts = val.split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
          formatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      } catch {
        formatted = val;
      }
    }
    onChange({
      ...data,
      dob: val,
      dobFormatted: formatted
    });
  };

  // Height conversion handlers (Feet/Inches <-> cm)
  const handleFeetInchesChange = (ft, inch) => {
    const feetNum = parseInt(ft) || 0;
    const inchNum = parseInt(inch) || 0;
    const totalInches = (feetNum * 12) + inchNum;
    const cm = totalInches > 0 ? Math.round(totalInches * 2.54) : '';
    const heightStr = `${feetNum}'${inchNum}"`;

    onChange({
      ...data,
      height: heightStr,
      heightCm: String(cm)
    });
  };

  const handleCmChange = (cmVal) => {
    const cmNum = parseInt(cmVal) || 0;
    let heightStr = data.height || '';
    if (cmNum > 0) {
      const totalInches = cmNum / 2.54;
      const feet = Math.floor(totalInches / 12);
      const inches = Math.round(totalInches % 12);
      heightStr = `${feet}'${inches}"`;
    }
    onChange({
      ...data,
      heightCm: cmVal,
      height: heightStr
    });
  };

  const currentFeet = (() => {
    const match = (data.height || '').match(/(\d+)'/);
    return match ? match[1] : '5';
  })();
  const currentInches = (() => {
    const match = (data.height || '').match(/'(\d+)"/);
    return match ? match[1] : '8';
  })();

  // Career timeline repeater handlers
  const addCareerItem = () => {
    const newItem = {
      id: Date.now().toString(),
      title: '',
      subtitle: ''
    };
    updateField('careerItems', [...(data.careerItems || []), newItem]);
  };

  const updateCareerItem = (id, field, value) => {
    const updated = (data.careerItems || []).map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    updateField('careerItems', updated);
  };

  const removeCareerItem = (id) => {
    updateField('careerItems', (data.careerItems || []).filter(item => item.id !== id));
  };

  // Family repeater handlers
  const addFamilyMember = () => {
    const newMember = {
      id: Date.now().toString(),
      generation: 'Parents',
      relation: '',
      name: '',
      role: '',
      isLate: false
    };
    updateField('familyMembers', [...(data.familyMembers || []), newMember]);
  };

  const updateFamilyMember = (id, field, value) => {
    const updated = (data.familyMembers || []).map(m => 
      m.id === id ? { ...m, [field]: value } : m
    );
    updateField('familyMembers', updated);
  };

  const removeFamilyMember = (id) => {
    updateField('familyMembers', (data.familyMembers || []).filter(m => m.id !== id));
  };

  // Hobbies tags handlers
  const [newHobbyEmoji, setNewHobbyEmoji] = useState('✨');
  const [newHobbyText, setNewHobbyText] = useState('');

  const addHobby = () => {
    if (!newHobbyText.trim()) return;
    updateField('hobbies', [...(data.hobbies || []), { emoji: newHobbyEmoji || '✨', text: newHobbyText.trim() }]);
    setNewHobbyText('');
  };

  const removeHobby = (index) => {
    updateField('hobbies', (data.hobbies || []).filter((_, i) => i !== index));
  };

  // Languages tags handlers
  const [newLang, setNewLang] = useState('');
  const addLanguage = () => {
    if (!newLang.trim()) return;
    updateField('languages', [...(data.languages || []), newLang.trim()]);
    setNewLang('');
  };

  const removeLanguage = (index) => {
    updateField('languages', (data.languages || []).filter((_, i) => i !== index));
  };

  const tabs = [
    { id: 'theme', label: 'Theme & Colors', icon: Palette },
    { id: 'identity', label: 'Photos & Identity', icon: User },
    { id: 'personal', label: 'Janma & Kundali', icon: Calendar },
    { id: 'about', label: 'About & Hobbies', icon: Heart },
    { id: 'career', label: 'Education & Career', icon: GraduationCap },
    { id: 'family', label: 'Family (Parivar)', icon: Users },
    { id: 'contact', label: 'Contact & Addresses', icon: Phone },
  ];

  const photoList = Array.isArray(data.photoUrls) && data.photoUrls.length > 0 
    ? data.photoUrls 
    : (data.photoUrl ? [data.photoUrl] : []);

  const hasColorOverrides = Boolean(data.themeOverrides?.[data.themeId]);

  return (
    <div className="flex flex-col h-full bg-white border-r border-stone-200">
      {/* Category Tabs */}
      <div className="flex overflow-x-auto p-2 gap-1 bg-stone-50 border-b border-stone-200 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-600 hover:bg-stone-200/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {/* TAB 1: THEME & COLOR PALETTE */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    1. Select Royal Theme
                  </h3>
                  <InfoTooltip 
                    title="Royal Themes & Customization"
                    text="Select any of the 5 royal themes. Each theme comes with its authentic Vedic defaults, and you can freely adjust any color below!"
                  />
                </div>
              </div>

              {/* 5 Preset Theme Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {THEMES.map((theme) => {
                  const isSelected = data.themeId === theme.id;
                  const themeColors = data.themeOverrides?.[theme.id] || theme;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleSelectTheme(theme.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                        isSelected 
                          ? 'border-amber-600 ring-2 ring-amber-500/30 bg-amber-50/30' 
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex-none flex items-center justify-center text-white shadow-sm"
                        style={{ 
                          background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})` 
                        }}
                      >
                        {isSelected && <Check className="w-5 h-5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 text-xs md:text-sm truncate">{theme.name}</div>
                        <div className="text-[11px] text-stone-500 truncate">{theme.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Live Color Customizer for Selected Theme */}
              <div className="mt-4 p-4 rounded-2xl border border-amber-300 bg-amber-50/40 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-950 block">
                      Customize Colors for {activeThemeBase.name}
                    </span>
                    <span className="text-[10px] text-amber-800">
                      Change any shade while keeping typography &amp; layout intact
                    </span>
                  </div>
                  {hasColorOverrides && (
                    <button
                      type="button"
                      onClick={handleResetThemeColors}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-amber-900 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors shadow-2xs"
                      title="Reset this theme's colors back to its original preset"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      Primary Royal Shade
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeResolvedTheme.primary}
                        onChange={(e) => handleUpdateThemeColor('primary', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={activeResolvedTheme.primary}
                        onChange={(e) => handleUpdateThemeColor('primary', e.target.value)}
                        className="w-20 px-2 py-1 text-xs border border-stone-300 rounded-lg uppercase font-mono bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      Accent Gold
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeResolvedTheme.accentGold}
                        onChange={(e) => handleUpdateThemeColor('accentGold', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={activeResolvedTheme.accentGold}
                        onChange={(e) => handleUpdateThemeColor('accentGold', e.target.value)}
                        className="w-20 px-2 py-1 text-xs border border-stone-300 rounded-lg uppercase font-mono bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      Secondary Accent Warmth
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeResolvedTheme.secondary}
                        onChange={(e) => handleUpdateThemeColor('secondary', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={activeResolvedTheme.secondary}
                        onChange={(e) => handleUpdateThemeColor('secondary', e.target.value)}
                        className="w-20 px-2 py-1 text-xs border border-stone-300 rounded-lg uppercase font-mono bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                      Background Tint (Canvas)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={activeResolvedTheme.bgCream}
                        onChange={(e) => handleUpdateThemeColor('bgCream', e.target.value)}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-stone-300 p-0.5 bg-white"
                      />
                      <input
                        type="text"
                        value={activeResolvedTheme.bgCream}
                        onChange={(e) => handleUpdateThemeColor('bgCream', e.target.value)}
                        className="w-20 px-2 py-1 text-xs border border-stone-300 rounded-lg uppercase font-mono bg-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sacred Shloka Section */}
            <div className="border-t border-stone-200 pt-5">
              <div className="flex items-center mb-3">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  2. Sacred Shloka / Blessing
                </h3>
                <InfoTooltip 
                  title="Auspicious Shloka / Blessing"
                  text="Traditional Hindu biodatas open with an auspicious invocation to Lord Ganesha, Radha-Krishna, or Kuldevi/Kuldevta."
                  example="॥ श्री गणेशाय नमः ॥ or ॥ श्री राधा-कृष्णाभ्यां नमः ॥"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-stone-600 font-medium">Select a Preset Blessing:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SHLOKA_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => updateField('shloka', preset.text)}
                      className={`px-3 py-2 text-xs rounded-xl border text-left transition-all ${
                        data.shloka === preset.text
                          ? 'border-amber-600 bg-amber-50 text-amber-900 font-semibold'
                          : 'border-stone-200 hover:bg-stone-50 text-stone-700'
                      }`}
                    >
                      <div className="font-sanskrit text-sm">{preset.text}</div>
                      <div className="text-[11px] text-stone-500">{preset.label}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-3">
                  <label className="text-xs text-stone-600 font-medium">Or type a Custom Shloka / Blessing:</label>
                  <input
                    type="text"
                    value={data.shloka}
                    onChange={(e) => updateField('shloka', e.target.value)}
                    placeholder="e.g. ॥ ॐ श्री गणेशाय नमः ॥ or ॥ ॐ नमो भगवते वासुदेवाय ॥"
                    className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-sanskrit"
                  />
                </div>
              </div>
            </div>

            {/* Visual Embellishments */}
            <div className="border-t border-stone-200 pt-5">
              <div className="flex items-center mb-3">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  3. Visual Embellishments
                </h3>
                <InfoTooltip 
                  title="Animations & Background Accents"
                  text="Toggle falling rose and marigold petals, radiant golden Surya rays, and traditional rotating mandalas."
                />
              </div>

              <div className="space-y-2.5">
                <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                  <input
                    type="checkbox"
                    checked={data.enablePetals}
                    onChange={(e) => updateField('enablePetals', e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <div>
                    <span className="font-semibold text-stone-800 text-sm block">Falling Petals Animation</span>
                    <span className="text-xs text-stone-500">Graceful rose & marigold petals shower gently in the background</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                  <input
                    type="checkbox"
                    checked={data.enableSuryaRays}
                    onChange={(e) => updateField('enableSuryaRays', e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <div>
                    <span className="font-semibold text-stone-800 text-sm block">Golden Surya Rays Behind Arch</span>
                    <span className="text-xs text-stone-500">Radiant solar aura around the portrait photograph</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 cursor-pointer hover:bg-stone-50">
                  <input
                    type="checkbox"
                    checked={data.enableMandala}
                    onChange={(e) => updateField('enableMandala', e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <div>
                    <span className="font-semibold text-stone-800 text-sm block">Rotating Mandalas in Header</span>
                    <span className="text-xs text-stone-500">Slow rotating traditional Vedic geometric mandalas</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MULTIPLE PHOTOS & CANDIDATE IDENTITY */}
        {activeTab === 'identity' && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                    Candidate Photographs ({photoList.length} Uploaded)
                  </h3>
                  <InfoTooltip 
                    title="Multiple Candidate Photos"
                    text="You can upload multiple high-resolution photos! The first photo is framed in the royal golden arch. Additional photos are automatically showcased in an elegant Photo Gallery card."
                    example="Click 'Set as Arch' to pick which photo sits at the top!"
                  />
                </div>
              </div>

              {/* Photos Grid & Upload Button */}
              <div className="space-y-3">
                {photoList.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {photoList.map((url, idx) => (
                      <div 
                        key={idx}
                        className={`relative aspect-[4/5] rounded-xl overflow-hidden border-2 shadow-xs group ${
                          idx === 0 ? 'border-amber-500 ring-2 ring-amber-400/30' : 'border-stone-200'
                        }`}
                      >
                        <img 
                          src={url} 
                          alt={`Uploaded ${idx + 1}`} 
                          className="w-full h-full object-cover"
                        />
                        {idx === 0 ? (
                          <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-stone-950 shadow-sm flex items-center gap-1">
                            <Star className="w-3 h-3 fill-stone-950" />
                            Arch Portrait
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPrimaryPhoto(idx)}
                            className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-900/80 hover:bg-amber-600 text-white shadow-sm transition-all"
                            title="Set as main arch portrait"
                          >
                            Set as Arch
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => removePhoto(idx)}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-red-600/90 text-white shadow-sm hover:bg-red-700 transition-all opacity-80 group-hover:opacity-100"
                          title="Remove photo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Button */}
                <label className="cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-300 rounded-2xl bg-amber-50/40 hover:bg-amber-50 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 grid place-items-center mb-1 shadow-xs">
                    <Camera className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-amber-900">
                    {photoList.length > 0 ? '+ Add More Photographs' : 'Upload Candidate Photographs'}
                  </span>
                  <span className="text-[11px] text-stone-500 mt-0.5">
                    Select 1 or multiple photos (JPG, PNG, WEBP)
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultiplePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Full Name */}
            <div className="border-t border-stone-200 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700">Full Name *</label>
                <InfoTooltip 
                  title="Full Name Format"
                  text="Enter candidate's complete official name. Professional prefixes (e.g. Er., Dr., CA) can be included."
                  example="e.g. Abhijeet B. Singh or Dr. Ananya Sharma"
                />
              </div>
              <input
                type="text"
                value={data.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="e.g. Abhijeet B Singh"
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* Vansh / Lineage / Community Badge */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700">
                  Community / Lineage / Vansh (optional)
                </label>
                <InfoTooltip 
                  title="Vansh & Community Emblem"
                  text="Prominently displays the candidate's traditional lineage or community (e.g., Raghuvanshi, Suryavanshi, Kanyakubj, Maratha, etc.) with a sacred sun emblem."
                  example="e.g. रघुवंशी or Kshatriya or Sharma"
                />
              </div>
              <input
                type="text"
                value={data.communityBadge}
                onChange={(e) => updateField('communityBadge', e.target.value)}
                placeholder="e.g. रघुवंशी (or Kshatriya / Kanyakubj Brahmin / Maratha)"
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-stone-500">Displays with a sacred solar emblem beneath the name.</span>
            </div>

            {/* Tagline / Subtitle */}
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700">
                  Subtitle Tagline (Profession &amp; City)
                </label>
                <InfoTooltip 
                  title="Subtitle / Header Summary"
                  text="Quick summary beneath the name showing qualification, current company/designation, and location."
                  example="e.g. Computer Engineer · Infosys · Mumbai"
                />
              </div>
              <input
                type="text"
                value={data.profileTagline}
                onChange={(e) => updateField('profileTagline', e.target.value)}
                placeholder="e.g. Software Engineer · Infosys Ltd. · Mumbai"
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        {/* TAB 3: JANMA & KUNDALI */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Horoscope &amp; Personal Profile
              </h3>
              <InfoTooltip 
                title="Janma & Kundali Details"
                text="Crucial astrological and physical details used for Kundali Milan (horoscope matching) and compatibility verification."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* DOB */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">Date of Birth</label>
                  <InfoTooltip 
                    title="Date of Birth"
                    text="Used to automatically calculate the candidate's exact age in years."
                    example="e.g. 1998-05-22"
                  />
                </div>
                <input
                  type="date"
                  value={data.dob}
                  onChange={handleDobChange}
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Formatted Date */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">Display Date of Birth</label>
                  <InfoTooltip 
                    title="Display Date Format"
                    text="The readable date formatted for the final biodata card."
                    example="e.g. 22 May 1998"
                  />
                </div>
                <input
                  type="text"
                  value={data.dobFormatted}
                  onChange={(e) => updateField('dobFormatted', e.target.value)}
                  placeholder="e.g. 22 May 1998"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Birth Time */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">Birth Time</label>
                  <InfoTooltip 
                    title="Exact Birth Time"
                    text="Essential for casting the exact Lagna Kundali and Navamsha chart."
                    example="e.g. 09:30 AM (IST)"
                  />
                </div>
                <input
                  type="text"
                  value={data.birthTime}
                  onChange={(e) => updateField('birthTime', e.target.value)}
                  placeholder="e.g. 09:30 AM (or 14:15 Hrs)"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Birth Place */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">Birth Place (City, State)</label>
                  <InfoTooltip 
                    title="Birth Place"
                    text="City and state where candidate was born, needed for astrological coordinates."
                    example="e.g. Varanasi, Uttar Pradesh"
                  />
                </div>
                <input
                  type="text"
                  value={data.birthPlace}
                  onChange={(e) => updateField('birthPlace', e.target.value)}
                  placeholder="e.g. Varanasi, Uttar Pradesh"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* DUAL HEIGHT BUILDER: Feet/Inches & cm */}
              <div className="sm:col-span-2 p-3 rounded-2xl border border-amber-200 bg-amber-50/30">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Candidate Height (Feet &amp; cm)
                  </label>
                  <InfoTooltip 
                    title="Height in Feet & cm"
                    text="Specify height in Feet & Inches or cm. Changing either automatically calculates the other and displays both (e.g. 5'8&quot; (173 cm))."
                    example="e.g. 5 Feet 8 Inches = 173 cm"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] text-stone-600 block mb-0.5">Feet</label>
                    <select
                      value={currentFeet}
                      onChange={(e) => handleFeetInchesChange(e.target.value, currentInches)}
                      className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded-xl bg-white"
                    >
                      {[4, 5, 6, 7].map(f => (
                        <option key={f} value={f}>{f} ft</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-600 block mb-0.5">Inches</label>
                    <select
                      value={currentInches}
                      onChange={(e) => handleFeetInchesChange(currentFeet, e.target.value)}
                      className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded-xl bg-white"
                    >
                      {Array.from({ length: 12 }).map((_, idx) => (
                        <option key={idx} value={idx}>{idx} in</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] text-stone-600 block mb-0.5">Height (in cm)</label>
                    <input
                      type="number"
                      value={data.heightCm || ''}
                      onChange={(e) => handleCmChange(e.target.value)}
                      placeholder="e.g. 173"
                      className="w-full px-2 py-1.5 text-sm border border-stone-300 rounded-xl bg-white"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-amber-800 font-medium mt-1.5 text-right">
                  Preview display: <span className="font-bold">{data.height} {data.heightCm ? `(${data.heightCm} cm)` : ''}</span>
                </div>
              </div>

              {/* Manglik */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">Manglik Status</label>
                  <InfoTooltip 
                    title="Manglik / Mars Dosha"
                    text="Placement of Mars (Mangal) in 1st, 2nd, 4th, 7th, 8th, or 12th house. Select Non-Manglik, Manglik, or Anshik (partial)."
                    example="Select 'No (Non-Manglik)' if not Manglik."
                  />
                </div>
                <select
                  value={data.manglik}
                  onChange={(e) => updateField('manglik', e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="No">No (Non-Manglik)</option>
                  <option value="Yes">Yes (Manglik)</option>
                  <option value="Anshik">Anshik Manglik (Partial)</option>
                  <option value="Don't Know">Don't Know / To be verified</option>
                </select>
              </div>

              {/* Gotra */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">Paternal Gotra</label>
                  <InfoTooltip 
                    title="Paternal Gotra"
                    text="The ancestral Vedic lineage traced from Rishis (e.g. Kashyap, Bhardwaj, Vashishtha, Shandilya)."
                    example="e.g. Kashyap"
                  />
                </div>
                <input
                  type="text"
                  value={data.gotra}
                  onChange={(e) => updateField('gotra', e.target.value)}
                  placeholder="e.g. Kashyap (or Bhardwaj / Vashishtha)"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Rashi */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">Rashi (Zodiac / Moon Sign)</label>
                  <InfoTooltip 
                    title="Janma Rashi"
                    text="Moon sign at time of birth (e.g. Mesh, Vrishabha, Mithun, Kark, Singh, Kanya, Tula, Vrishchik, Dhanu, Makar, Kumbh, Meen)."
                    example="e.g. Mesh (Aries)"
                  />
                </div>
                <input
                  type="text"
                  value={data.rashi}
                  onChange={(e) => updateField('rashi', e.target.value)}
                  placeholder="e.g. Mesh (Aries) or Kanya (Virgo)"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Nakshatra */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">Nakshatra &amp; Charan</label>
                  <InfoTooltip 
                    title="Birth Star (Nakshatra)"
                    text="Birth constellation and quarter (Charan) used for Guna Milan (e.g. Rohini, Ashwini, Bharani, Swati)."
                    example="e.g. Bharani (Charan 2)"
                  />
                </div>
                <input
                  type="text"
                  value={data.nakshatra}
                  onChange={(e) => updateField('nakshatra', e.target.value)}
                  placeholder="e.g. Bharani (Charan 2) or Rohini"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Complexion */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">Complexion</label>
                  <InfoTooltip 
                    title="Skin Tone / Complexion"
                    text="General physical appearance / complexion."
                    example="e.g. Wheatish or Fair"
                  />
                </div>
                <input
                  type="text"
                  value={data.complexion}
                  onChange={(e) => updateField('complexion', e.target.value)}
                  placeholder="e.g. Wheatish / Fair / Medium"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ABOUT & HOBBIES */}
        {activeTab === 'about' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Introduction &amp; Lifestyle
                </h3>
                <InfoTooltip 
                  title="About Me Bio"
                  text="Write an authentic, balanced introduction covering values, educational journey, personal interests, and family bonding."
                  example="Mention your perspective on life, passions, and cultural roots."
                />
              </div>

              <textarea
                rows={4}
                value={data.aboutMe}
                onChange={(e) => updateField('aboutMe', e.target.value)}
                placeholder="e.g. I appreciate the beauty of diverse experiences and hold my family, friends, and personal interests in high regard. My academic journey led me to pursue a degree in Computer Science..."
                className="w-full mt-2 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Hobbies */}
            <div className="border-t border-stone-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-700">
                  Hobbies &amp; Interests
                </label>
                <InfoTooltip 
                  title="Hobbies & Interests"
                  text="Add your favorite sports, musical tastes, cultural practices, travel, and books with emojis!"
                  example="🏏 Playing Cricket, 🎵 Classical Music, 🛕 Visiting Heritage Temples"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {(data.hobbies || []).map((h, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-800 text-xs border border-stone-300"
                  >
                    <span>{h.emoji}</span>
                    <span>{h.text}</span>
                    <button
                      type="button"
                      onClick={() => removeHobby(idx)}
                      className="ml-1 text-stone-400 hover:text-red-600"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Emoji"
                  value={newHobbyEmoji}
                  onChange={(e) => setNewHobbyEmoji(e.target.value)}
                  className="w-16 px-2 py-1.5 text-sm border border-stone-300 rounded-xl text-center"
                />
                <input
                  type="text"
                  placeholder="e.g. Playing Badminton, Photography, Reading"
                  value={newHobbyText}
                  onChange={(e) => setNewHobbyText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addHobby()}
                  className="flex-1 px-3 py-1.5 text-sm border border-stone-300 rounded-xl"
                />
                <button
                  type="button"
                  onClick={addHobby}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>

            {/* Spoken Languages */}
            <div className="border-t border-stone-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-stone-700">
                  Languages Spoken
                </label>
                <InfoTooltip 
                  title="Spoken Languages"
                  text="Languages in which candidate can converse comfortably."
                  example="e.g. English, Hindi, Marathi, Gujarati"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {(data.languages || []).map((lang, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-900 text-xs border border-amber-300"
                  >
                    <span>{lang}</span>
                    <button
                      type="button"
                      onClick={() => removeLanguage(idx)}
                      className="ml-1 text-amber-700 hover:text-red-600"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. English, Hindi, Marathi"
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addLanguage()}
                  className="flex-1 px-3 py-1.5 text-sm border border-stone-300 rounded-xl"
                />
                <button
                  type="button"
                  onClick={addLanguage}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: EDUCATION & CAREER */}
        {activeTab === 'career' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Education &amp; Career History
                </h3>
                <InfoTooltip 
                  title="Education & Profession Timeline"
                  text="Add all educational qualifications and work experience milestones. The most recent designation should ideally be at the top."
                  example="Title: Senior Product Designer · Microsoft / Subtitle: B.Tech IIT Delhi"
                />
              </div>

              <button
                type="button"
                onClick={addCareerItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Milestone
              </button>
            </div>

            <div className="space-y-3">
              {(data.careerItems || []).map((item, idx) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-amber-800">
                      Milestone #{idx + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeCareerItem(item.id)}
                      className="text-stone-400 hover:text-red-600 p-1"
                      title="Delete milestone"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Role / Degree Title *</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => updateCareerItem(item.id, 'title', e.target.value)}
                      placeholder="e.g. Digital Specialist Engineer · Infosys Ltd. or B.E. Computer Science"
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl bg-white font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Institution / Details</label>
                    <input
                      type="text"
                      value={item.subtitle}
                      onChange={(e) => updateCareerItem(item.id, 'subtitle', e.target.value)}
                      placeholder="e.g. Mumbai University or Specialising in Cloud Architecture"
                      className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl bg-white text-stone-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: FAMILY MEMBERS (WITH MOTHER'S GOTRA EXPLICITLY) */}
        {activeTab === 'family' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Family Background (Parivar)
                </h3>
                <InfoTooltip 
                  title="Family Background & Gotra"
                  text="In Indian Hindu traditions, four Gotras are traditionally verified: Self/Father, Mother, Paternal Grandmother, and Maternal Grandmother. Always mention Mother's Maiden Gotra alongside her name!"
                  example="e.g. Mrs. Reema Singh (Gotra: Sandilya)"
                />
              </div>

              <button
                type="button"
                onClick={addFamilyMember}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Member
              </button>
            </div>

            <div className="space-y-3">
              {(data.familyMembers || []).map((m, idx) => {
                const isMother = (m.relation || '').toLowerCase().includes('mother');
                return (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-2xl border border-stone-200 bg-stone-50/50 space-y-2 relative"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={m.relation}
                          onChange={(e) => updateFamilyMember(m.id, 'relation', e.target.value)}
                          placeholder="Relation (e.g. Mother, Father, Grandfather)"
                          className="px-2 py-1 text-xs font-semibold border border-stone-300 rounded-lg bg-white w-32 uppercase text-amber-800"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-stone-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={m.isLate}
                            onChange={(e) => updateFamilyMember(m.id, 'isLate', e.target.checked)}
                            className="rounded text-amber-600"
                          />
                          <span>Late (स्वर्गवासी)</span>
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFamilyMember(m.id)}
                        className="text-stone-400 hover:text-red-600 p-1"
                        title="Delete member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[11px] font-semibold text-stone-600">
                          {isMother ? "Mother's Full Name (Include Maiden Gotra) *" : "Full Name *"}
                        </label>
                        {isMother && (
                          <span className="text-[10px] text-amber-700 font-bold bg-amber-100 px-1.5 py-0.5 rounded">
                            Include Gotra
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => updateFamilyMember(m.id, 'name', e.target.value)}
                        placeholder={
                          isMother 
                            ? "e.g. Mrs. Reema B. Singh (Gotra: Sandilya)" 
                            : "e.g. Mr. Brajeshkumar T. Singh (or Late Mr. Tejdhari D. Singh)"
                        }
                        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-stone-600 block mb-0.5">Occupation / Designation</label>
                      <input
                        type="text"
                        value={m.role}
                        onChange={(e) => updateFamilyMember(m.id, 'role', e.target.value)}
                        placeholder="e.g. Homemaker / Retired B.M.C. Teacher / Businessman / Professor"
                        className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl bg-white text-stone-600"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 7: CONTACT & ADDRESSES */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Contact &amp; Location Details
              </h3>
              <InfoTooltip 
                title="Contact & Addresses"
                text="Provide direct contact numbers, email, current residence, and ancestral native place. Addresses automatically link to Google Maps."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">Phone / WhatsApp *</label>
                  <InfoTooltip 
                    title="Phone / WhatsApp"
                    text="Active phone number for matrimonial correspondence."
                    example="e.g. +91 98695 07492"
                  />
                </div>
                <input
                  type="text"
                  value={data.contacts?.phone || ''}
                  onChange={(e) => updateNestedField('contacts', 'phone', e.target.value)}
                  placeholder="e.g. +91 98695 07492"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">Contact Person Label</label>
                  <InfoTooltip 
                    title="Contact Person Label"
                    text="Whose contact number this is (e.g. Father, Mother, Self, Guardian)."
                    example="e.g. Father or Self"
                  />
                </div>
                <input
                  type="text"
                  value={data.contacts?.phoneLabel || 'Father'}
                  onChange={(e) => updateNestedField('contacts', 'phoneLabel', e.target.value)}
                  placeholder="e.g. Father or Self or Mother"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700">Email Address</label>
                <InfoTooltip 
                  title="Email Address"
                  text="Email for sending detailed horoscope charts or portfolio resumes."
                  example="e.g. candidate@gmail.com"
                />
              </div>
              <input
                type="email"
                value={data.contacts?.email || ''}
                onChange={(e) => updateNestedField('contacts', 'email', e.target.value)}
                placeholder="e.g. abhijeet.b.singh@gmail.com"
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700">
                  Current Residential Address (links to Google Maps)
                </label>
                <InfoTooltip 
                  title="Current Residential Address"
                  text="Where the family currently resides. Tapping it on the live biodata opens Google Maps directly."
                  example="e.g. 603, Bldg No. 61, Thakur Village, Kandivali East, Mumbai 400101"
                />
              </div>
              <textarea
                rows={2}
                value={data.contacts?.currentAddress || ''}
                onChange={(e) => updateNestedField('contacts', 'currentAddress', e.target.value)}
                placeholder="e.g. 603, Bldg No. 61, EMP Phase 4, Thakur Village, Kandivali East, Mumbai 400101"
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700">
                  Native Village / Ancestral Place (links to Google Maps)
                </label>
                <InfoTooltip 
                  title="Ancestral Village / Native Place (Mool Niwas)"
                  text="Ancestral village or hometown in native state. Elders value native roots for background matching."
                  example="e.g. Village Sidhauni, Post Dobhi, District Jaunpur (U.P.) 222149"
                />
              </div>
              <textarea
                rows={2}
                value={data.contacts?.nativeAddress || ''}
                onChange={(e) => updateNestedField('contacts', 'nativeAddress', e.target.value)}
                placeholder="e.g. Village Sidhauni, Post S.G.R.P.G. College, Dobhi, District Jaunpur (U.P.) 222149"
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="border-t border-stone-200 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700">Footer Sanskrit Blessing</label>
                <InfoTooltip 
                  title="Closing Blessing"
                  text="Sacred concluding blessing at the bottom of the biodata."
                  example="॥ शुभम् भवतु ॥ (May all auspiciousness happen)"
                />
              </div>
              <input
                type="text"
                value={data.footerBlessing}
                onChange={(e) => updateField('footerBlessing', e.target.value)}
                placeholder="e.g. ॥ शुभम् भवतु ॥ or ॥ ॐ तत्सत् ॥"
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl font-sanskrit"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700">Footer Closing Note</label>
                <InfoTooltip 
                  title="Closing Note"
                  text="Polite parting message thanking readers for reviewing the profile."
                  example="e.g. Thank you for taking the time to know me."
                />
              </div>
              <input
                type="text"
                value={data.footerNote}
                onChange={(e) => updateField('footerNote', e.target.value)}
                placeholder="e.g. Thank you for taking the time to know me."
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
