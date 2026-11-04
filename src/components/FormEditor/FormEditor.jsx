import React, { useState, useRef } from 'react';
import { THEMES, SHLOKA_PRESETS, getResolvedTheme } from '../../themes';
import InfoTooltip from '../InfoTooltip';
import { RASHI_LIST, calculateAge, calculateVedicRashi, normalizeRashiValue } from '../../utils/vedicAstrology';
import { optimizeImageFile } from '../../utils/imageOptimizer';
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
  Camera,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';

export default function FormEditor({ data, onChange, onSwitchToPreview }) {
  const [activeTab, setActiveTab] = useState('identity');
  const [errors, setErrors] = useState({});
  const MAX_ABOUT_CHARS = 450;

  const clearError = (fieldKey) => {
    setErrors((prev) => {
      if (!prev[fieldKey]) return prev;
      const next = { ...prev };
      delete next[fieldKey];
      return next;
    });
  };
  const contentScrollRef = useRef(null);
  const tabButtonRefs = useRef({});

  const updateField = (field, value) => {
    onChange({ ...data, [field]: value });
    clearError(field);
  };

  const updateNestedField = (parent, field, value) => {
    onChange({
      ...data,
      [parent]: {
        ...data[parent],
        [field]: value
      }
    });
    clearError(field);
    if (field === 'currentAddress' || field === 'nativeAddress') {
      clearError('address');
    }
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

  // Multiple Photos Upload Handler with automatic compression & arch priority
  const handleMultiplePhotoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Reset input value so selecting the same file again still fires change
    e.target.value = '';

    // Check if currently holding default sample photos (Unsplash URLs)
    const currentPhotos = Array.isArray(data.photoUrls) ? [...data.photoUrls] : (data.photoUrl ? [data.photoUrl] : []);
    const isSampleData = currentPhotos.length > 0 && currentPhotos.every(url => typeof url === 'string' && url.includes('images.unsplash.com'));

    // If it was sample data, start fresh with the user's real photos!
    const basePhotos = isSampleData ? [] : currentPhotos;

    try {
      // Optimize & scale down all selected photos in parallel
      const optimizedUrls = await Promise.all(
        files.map(file => optimizeImageFile(file))
      );
      const validNew = optimizedUrls.filter(Boolean);
      if (validNew.length === 0) return;

      // Put newly uploaded photos at the FRONT so user's photo is immediately the Arch Portrait!
      const updatedPhotos = [...validNew, ...basePhotos];

      onChange({
        ...data,
        photoUrls: updatedPhotos,
        photoUrl: updatedPhotos[0] || ''
      });
      clearError('photos');
    } catch (err) {
      console.error('Failed to process image upload:', err);
    }
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

  // DOB handler that formats date nicely and automatically updates Age and Vedic Rashi
  const handleDobChange = (e) => {
    const val = e.target.value;
    clearError('dob');
    let formatted = '';
    if (val) {
      try {
        const parts = val.split('-');
        if (parts.length === 3) {
          const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
          formatted = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        }
      } catch {
        formatted = val;
      }
    }

    const calculatedAge = calculateAge(val);

    // Update quickHighlights age chip if present
    const updatedHighlights = Array.isArray(data.quickHighlights)
      ? data.quickHighlights.map(h => (h.label === 'years' || h.autoFromDob) ? { ...h, value: calculatedAge || h.value } : h)
      : data.quickHighlights;

    // Auto-calculate Vedic Rashi from birth date, time and place
    const vedic = calculateVedicRashi(val, data.birthTime, data.birthPlace);

    onChange({
      ...data,
      dob: val,
      dobFormatted: formatted,
      quickHighlights: updatedHighlights,
      rashi: vedic ? vedic.rashiValue : data.rashi,
      nakshatra: (vedic && (!data.nakshatra || data.nakshatra.includes('Charan'))) ? vedic.nakshatra : data.nakshatra
    });
  };

  // Birth Time handler that recalculates Rashi automatically
  const handleBirthTimeChange = (e) => {
    const timeVal = e.target.value;
    clearError('birthTime');
    const vedic = data.dob ? calculateVedicRashi(data.dob, timeVal, data.birthPlace) : null;
    onChange({
      ...data,
      birthTime: timeVal,
      rashi: vedic ? vedic.rashiValue : data.rashi,
      nakshatra: (vedic && (!data.nakshatra || data.nakshatra.includes('Charan'))) ? vedic.nakshatra : data.nakshatra
    });
  };

  // Birth Place handler that recalculates Rashi
  const handleBirthPlaceChange = (e) => {
    const placeVal = e.target.value;
    clearError('birthPlace');
    const vedic = data.dob ? calculateVedicRashi(data.dob, data.birthTime, placeVal) : null;
    onChange({
      ...data,
      birthPlace: placeVal,
      rashi: vedic ? vedic.rashiValue : data.rashi
    });
  };

  const handleRecalculateRashi = () => {
    if (!data.dob) return;
    const vedic = calculateVedicRashi(data.dob, data.birthTime, data.birthPlace);
    if (vedic) {
      onChange({
        ...data,
        rashi: vedic.rashiValue,
        nakshatra: vedic.nakshatra
      });
    }
  };

  // Height conversion handlers (Feet/Inches <-> cm)
  const handleFeetInchesChange = (ft, inch) => {
    clearError('height');
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
    clearError('height');
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
    clearError('career');
    const newItem = {
      id: Date.now().toString(),
      title: '',
      subtitle: ''
    };
    updateField('careerItems', [...(data.careerItems || []), newItem]);
  };

  const updateCareerItem = (id, field, value) => {
    clearError('career');
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
    clearError('family');
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
    clearError('family');
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
    { id: 'identity', label: 'Photos & Identity', icon: User },
    { id: 'personal', label: 'Janma & Kundali', icon: Calendar },
    { id: 'career', label: 'Education & Career', icon: GraduationCap },
    { id: 'family', label: 'Family (Parivar)', icon: Users },
    { id: 'about', label: 'About & Hobbies', icon: Heart },
    { id: 'contact', label: 'Contact & Addresses', icon: Phone },
    { id: 'theme', label: 'Theme & Colors', icon: Palette },
  ];

  const validateTab = (tabId) => {
    const newErrors = {};

    if (tabId === 'identity') {
      const photos = Array.isArray(data.photoUrls) && data.photoUrls.length > 0 
        ? data.photoUrls 
        : (data.photoUrl ? [data.photoUrl] : []);
      if (photos.length === 0) {
        newErrors.photos = 'At least 1 candidate photograph is mandatory.';
      }
      if (!data.fullName || !data.fullName.trim()) {
        newErrors.fullName = 'Candidate full name is required.';
      }
      if (!data.profileTagline || !data.profileTagline.trim()) {
        newErrors.profileTagline = 'Headline tagline (Profession & City) is required.';
      }
    } else if (tabId === 'personal') {
      if (!data.dob || !data.dob.trim()) {
        newErrors.dob = 'Date of birth is required.';
      }
      if (!data.birthTime || !data.birthTime.trim()) {
        newErrors.birthTime = 'Time of birth is required.';
      }
      if (!data.birthPlace || !data.birthPlace.trim()) {
        newErrors.birthPlace = 'Place of birth is required.';
      }
      const hasHeight = (data.height && data.height.trim().length > 0) || (data.heightCm && String(data.heightCm).trim().length > 0);
      if (!hasHeight) {
        newErrors.height = 'Candidate height is required.';
      }
      if (!data.gotra || !data.gotra.trim()) {
        newErrors.gotra = "Self / Father's Gotra is required.";
      }
    } else if (tabId === 'career') {
      const items = data.careerItems || [];
      if (items.length === 0 || !items[0]?.title?.trim()) {
        newErrors.career = 'Please enter at least 1 education or career qualification.';
      }
    } else if (tabId === 'family') {
      const members = data.familyMembers || [];
      const hasNamedMember = members.some(m => m.name && m.name.trim().length > 0);
      if (!hasNamedMember) {
        newErrors.family = 'Please add at least 1 family member name (e.g. Father or Mother).';
      }
    } else if (tabId === 'about') {
      const bio = data.aboutMe || '';
      if (!bio.trim() || bio.trim().length < 20) {
        newErrors.aboutMe = 'Please write a brief introduction (minimum 20 characters).';
      } else if (bio.length > MAX_ABOUT_CHARS) {
        newErrors.aboutMe = `Bio must not exceed ${MAX_ABOUT_CHARS} characters.`;
      }
    } else if (tabId === 'contact') {
      const phone = data.contacts?.phone?.trim() || '';
      if (!phone) {
        newErrors.phone = 'Primary contact phone number is required.';
      } else if (phone.replace(/[^0-9]/g, '').length < 8) {
        newErrors.phone = 'Please enter a valid phone number (at least 8 digits).';
      }
      const hasAddress = (data.contacts?.currentAddress && data.contacts.currentAddress.trim().length > 0) ||
                         (data.contacts?.nativeAddress && data.contacts.nativeAddress.trim().length > 0);
      if (!hasAddress) {
        newErrors.address = 'Please provide either Current Residence or Native Address.';
      }
    }

    return newErrors;
  };

  const handleTabChange = (targetTabId) => {
    const currentIdx = tabs.findIndex(t => t.id === activeTab);
    const targetIdx = tabs.findIndex(t => t.id === targetTabId);

    // If moving forward, validate intermediate tabs
    if (targetIdx > currentIdx) {
      for (let i = currentIdx; i < targetIdx; i++) {
        const stepTab = tabs[i];
        const stepErrors = validateTab(stepTab.id);
        if (Object.keys(stepErrors).length > 0) {
          if (stepTab.id !== activeTab) {
            setActiveTab(stepTab.id);
          }
          setErrors(stepErrors);
          if (contentScrollRef.current) {
            contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
          }
          const tabEl = tabButtonRefs.current[stepTab.id];
          if (tabEl) {
            tabEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
          }
          return false;
        }
      }
    }

    // Moving backward or valid forward move
    setErrors({});
    setActiveTab(targetTabId);
    if (contentScrollRef.current) {
      contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    const tabEl = tabButtonRefs.current[targetTabId];
    if (tabEl) {
      tabEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    }
    return true;
  };

  const handleFinalSubmit = () => {
    for (let i = 0; i < tabs.length; i++) {
      const stepTab = tabs[i];
      const stepErrors = validateTab(stepTab.id);
      if (Object.keys(stepErrors).length > 0) {
        setActiveTab(stepTab.id);
        setErrors(stepErrors);
        if (contentScrollRef.current) {
          contentScrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
        const tabEl = tabButtonRefs.current[stepTab.id];
        if (tabEl) {
          tabEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
        return false;
      }
    }

    if (onSwitchToPreview) {
      onSwitchToPreview();
    }
    return true;
  };

  const renderTabNavigation = () => {
    const currentIndex = tabs.findIndex(t => t.id === activeTab);
    const prevTab = currentIndex > 0 ? tabs[currentIndex - 1] : null;
    const nextTab = currentIndex < tabs.length - 1 ? tabs[currentIndex + 1] : null;

    return (
      <div className="pt-6 mt-6 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 select-none pb-6">
        {prevTab ? (
          <button
            type="button"
            onClick={() => handleTabChange(prevTab.id)}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 font-medium text-xs sm:text-sm transition-all active:scale-[0.98] shadow-xs cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4 text-stone-500" />
            <span>Back: {prevTab.label}</span>
          </button>
        ) : (
          <div className="hidden sm:block" />
        )}

        {nextTab ? (
          <button
            type="button"
            onClick={() => handleTabChange(nextTab.id)}
            className="w-full sm:w-auto ml-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold text-xs sm:text-sm transition-all active:scale-[0.98] shadow-md shadow-amber-900/20 cursor-pointer"
          >
            <span>Next: {nextTab.label}</span>
            <ChevronRight className="w-4 h-4 text-amber-200" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            className="w-full sm:w-auto ml-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-xs sm:text-sm transition-all active:scale-[0.98] shadow-md shadow-emerald-900/20 cursor-pointer"
          >
            <span>Preview & Download Biodata</span>
            <Sparkles className="w-4 h-4 text-emerald-200" />
          </button>
        )}
      </div>
    );
  };

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
              ref={(el) => (tabButtonRefs.current[tab.id] = el)}
              onClick={() => handleTabChange(tab.id)}
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
      <div ref={contentScrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
        {/* Validation Errors Alert Banner */}
        {Object.keys(errors).length > 0 && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-900 shadow-sm flex items-start gap-3 animate-fadeIn">
            <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <AlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div className="text-xs flex-1">
              <span className="font-bold text-red-950 block text-[13px]">
                Please fill the required mandatory field{Object.keys(errors).length > 1 ? 's' : ''} to proceed:
              </span>
              <ul className="list-disc list-inside mt-1 space-y-0.5 text-red-800">
                {Object.entries(errors).map(([key, msg]) => (
                  <li key={key} className="font-medium">{msg}</li>
                ))}
              </ul>
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
                    Candidate Photographs <span className="text-red-500 font-bold">*</span> <span className="text-xs font-normal text-stone-500 ml-1">({photoList.length} Uploaded · 1 required)</span>
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
                <label className={`cursor-pointer flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl transition-all ${
                    errors.photos 
                      ? 'border-red-400 bg-red-50/50 ring-2 ring-red-400/20' 
                      : 'border-amber-300 hover:border-amber-500 bg-amber-50/40'
                  }`}>
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
                {errors.photos && (
                  <p className="text-xs text-red-600 font-medium mt-1 flex items-center justify-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.photos}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Full Name */}
            <div className="border-t border-stone-200 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-stone-700">Full Name <span className="text-red-500 font-bold">*</span></label>
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
                className={`w-full mt-1 px-3 py-2 text-sm border rounded-xl focus:ring-2 font-medium ${
                  errors.fullName ? 'border-red-500 bg-red-50/20 focus:ring-red-400' : 'border-stone-300 focus:ring-amber-500'
                }`}
              />
              {errors.fullName && (
                <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.fullName}</span>
                </p>
              )}
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
                  Subtitle Tagline (Profession &amp; City) <span className="text-red-500 font-bold">*</span>
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
                className={`w-full mt-1 px-3 py-2 text-sm border rounded-xl focus:ring-2 ${
                  errors.profileTagline ? 'border-red-500 bg-red-50/20 focus:ring-red-400' : 'border-stone-300 focus:ring-amber-500'
                }`}
              />
              {errors.profileTagline && (
                <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.profileTagline}</span>
                </p>
              )}
            </div>
            {/* Bottom Next / Back Navigation */}
            {renderTabNavigation()}
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
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-semibold text-stone-700">Date of Birth <span className="text-red-500 font-bold">*</span></label>
                    {data.dob && calculateAge(data.dob) && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                        Age: {calculateAge(data.dob)} yrs
                      </span>
                    )}
                  </div>
                  <InfoTooltip 
                    title="Date of Birth"
                    text="Used to auto-calculate the candidate's exact age in years and Vedic planetary horoscope (Rashi & Nakshatra)."
                    example="e.g. 1998-05-22"
                  />
                </div>
                <input
                  type="date"
                  value={data.dob}
                  onChange={handleDobChange}
                  className={`w-full mt-1 px-3 py-2 text-sm border rounded-xl focus:ring-2 ${
                    errors.dob ? 'border-red-500 bg-red-50/20 focus:ring-red-400' : 'border-stone-300 focus:ring-amber-500'
                  }`}
                />
                {errors.dob && (
                  <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.dob}</span>
                  </p>
                )}
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
                  <label className="text-xs font-semibold text-stone-700">Birth Time <span className="text-red-500 font-bold">*</span></label>
                  <InfoTooltip 
                    title="Exact Birth Time"
                    text="Essential for casting the exact Lagna Kundali, Moon sign (Rashi), and Navamsha chart."
                    example="e.g. 09:30 AM (IST)"
                  />
                </div>
                <input
                  type="text"
                  value={data.birthTime}
                  onChange={handleBirthTimeChange}
                  placeholder="e.g. 09:30 AM (or 14:15 Hrs)"
                  className={`w-full mt-1 px-3 py-2 text-sm border rounded-xl focus:ring-2 ${
                    errors.birthTime ? 'border-red-500 bg-red-50/20 focus:ring-red-400' : 'border-stone-300 focus:ring-amber-500'
                  }`}
                />
                {errors.birthTime && (
                  <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.birthTime}</span>
                  </p>
                )}
              </div>

              {/* Birth Place */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-stone-700">Birth Place (City, State) <span className="text-red-500 font-bold">*</span></label>
                  <InfoTooltip 
                    title="Birth Place"
                    text="City and state where candidate was born, needed for astrological coordinates and Rashi."
                    example="e.g. Varanasi, Uttar Pradesh"
                  />
                </div>
                <input
                  type="text"
                  value={data.birthPlace}
                  onChange={handleBirthPlaceChange}
                  placeholder="e.g. Varanasi, Uttar Pradesh"
                  className={`w-full mt-1 px-3 py-2 text-sm border rounded-xl focus:ring-2 ${
                    errors.birthPlace ? 'border-red-500 bg-red-50/20 focus:ring-red-400' : 'border-stone-300 focus:ring-amber-500'
                  }`}
                />
                {errors.birthPlace && (
                  <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.birthPlace}</span>
                  </p>
                )}
              </div>

              {/* DUAL HEIGHT BUILDER: Feet/Inches & cm */}
              <div className={`sm:col-span-2 p-3 rounded-2xl border transition-all ${
                  errors.height ? 'border-red-400 bg-red-50/30 ring-2 ring-red-400/20' : 'border-amber-200 bg-amber-50/30'
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Candidate Height (Feet &amp; cm) <span className="text-red-500 font-bold">*</span>
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
              {errors.height && (
                <p className="sm:col-span-2 text-xs text-red-600 font-medium -mt-2 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.height}</span>
                </p>
              )}

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

              {/* Rashi Dropdown with 12 Vedic Rashis */}
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <label className="text-xs font-semibold text-stone-700">Rashi (Zodiac / Moon Sign)</label>
                    {data.dob && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-semibold flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-600" />
                        Auto-calculated
                      </span>
                    )}
                  </div>
                  <InfoTooltip 
                    title="Janma Rashi (12 Rashis)"
                    text="Vedic Moon sign at time of birth. Auto-calculated based on Date, Time, and Place of birth (or select directly from the 12 Vedic Rashis)."
                    example="e.g. Mesh (Aries) · मेष"
                  />
                </div>
                <select
                  value={normalizeRashiValue(data.rashi)}
                  onChange={(e) => updateField('rashi', e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white font-medium text-stone-800 cursor-pointer"
                >
                  <option value="">-- Select Rashi (12 Vedic Rashis) --</option>
                  {RASHI_LIST.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                  {/* Preserve custom entry if user had one that is not in RASHI_LIST */}
                  {data.rashi && !RASHI_LIST.some(r => r.value === normalizeRashiValue(data.rashi)) && (
                    <option value={data.rashi}>{data.rashi}</option>
                  )}
                </select>
                {data.dob && (
                  <div className="flex items-center justify-between mt-1 px-1 text-[11px] text-stone-500">
                    <span>Vedic Chart (Lahiri Ayanamsha)</span>
                    <button
                      type="button"
                      onClick={handleRecalculateRashi}
                      className="text-amber-700 hover:text-amber-900 font-semibold hover:underline"
                    >
                      Recalculate
                    </button>
                  </div>
                )}
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
            {/* Bottom Next / Back Navigation */}
            {renderTabNavigation()}
          </div>
        )}

        {/* TAB 5: EDUCATION & CAREER */}
        {activeTab === 'career' && (
          <div className="space-y-4">
            {errors.career && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errors.career}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Education &amp; Career History <span className="text-red-500 font-bold">*</span>
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
            {/* Bottom Next / Back Navigation */}
            {renderTabNavigation()}
          </div>
        )}

        {/* TAB 6: FAMILY MEMBERS (WITH MOTHER'S GOTRA EXPLICITLY) */}
        {activeTab === 'family' && (
          <div className="space-y-4">
            {errors.family && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                <span>{errors.family}</span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Family Background (Parivar) <span className="text-red-500 font-bold">*</span>
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
            {/* Bottom Next / Back Navigation */}
            {renderTabNavigation()}
          </div>
        )}

        {/* TAB 4: ABOUT & HOBBIES */}
        {activeTab === 'about' && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Introduction &amp; Lifestyle <span className="text-red-500 font-bold">*</span>
                </h3>
                <InfoTooltip 
                  title="About Me Bio"
                  text="Write an authentic, balanced introduction covering values, educational journey, personal interests, and family bonding."
                  example="Mention your perspective on life, passions, and cultural roots."
                />
              </div>

              <textarea
                rows={4}
                maxLength={MAX_ABOUT_CHARS}
                value={data.aboutMe}
                onChange={(e) => updateField('aboutMe', e.target.value)}
                placeholder="e.g. I appreciate the beauty of diverse experiences and hold my family, friends, and personal interests in high regard. My academic journey led me to pursue a degree in Computer Science..."
                className={`w-full mt-2 px-3 py-2 text-sm border rounded-xl focus:ring-2 ${
                  errors.aboutMe ? 'border-red-500 bg-red-50/20 focus:ring-red-400' : 'border-stone-300 focus:ring-amber-500'
                }`}
              />
              <div className="flex items-center justify-between mt-1 text-xs">
                {errors.aboutMe ? (
                  <span className="text-red-600 font-medium flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.aboutMe}</span>
                  </span>
                ) : (
                  <span className="text-stone-500 text-[11px]">
                    Keep bio concise so it fits comfortably on A4 print.
                  </span>
                )}
                <span className={`font-mono text-[11px] font-semibold ${
                  (data.aboutMe || '').length >= MAX_ABOUT_CHARS 
                    ? 'text-red-600 font-bold' 
                    : (data.aboutMe || '').length >= MAX_ABOUT_CHARS - 30 
                      ? 'text-amber-600' 
                      : 'text-stone-500'
                }`}>
                  {(data.aboutMe || '').length} / {MAX_ABOUT_CHARS} chars
                </span>
              </div>
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
            {/* Bottom Next / Back Navigation */}
            {renderTabNavigation()}
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
                  <label className="text-xs font-semibold text-stone-700">Phone / WhatsApp <span className="text-red-500 font-bold">*</span></label>
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
                  className={`w-full mt-1 px-3 py-2 text-sm border rounded-xl focus:ring-2 ${
                    errors.phone ? 'border-red-500 bg-red-50/20 focus:ring-red-400' : 'border-stone-300 focus:ring-amber-500'
                  }`}
                />
                {errors.phone && (
                  <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{errors.phone}</span>
                  </p>
                )}
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
                className={`w-full mt-1 px-3 py-2 text-sm border rounded-xl focus:ring-2 ${
                  errors.address ? 'border-red-500 bg-red-50/20 focus:ring-red-400' : 'border-stone-300 focus:ring-amber-500'
                }`}
              />
              {errors.address && (
                <p className="text-xs text-red-600 font-medium mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.address}</span>
                </p>
              )}
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
            {/* Bottom Next / Back Navigation */}
            {renderTabNavigation()}
          </div>
        )}

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
            {/* Bottom Next / Back Navigation */}
            {renderTabNavigation()}
          </div>
        )}
      </div>
    </div>
  );
}
