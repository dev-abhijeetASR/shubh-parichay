import React, { useState } from 'react';
import { THEMES, SHLOKA_PRESETS } from '../../themes';
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
  Layers
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

  // Photo upload handler converting file to base64
  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('photoUrl', reader.result);
      };
      reader.readAsDataURL(file);
    }
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

  // Career timeline repeater handlers
  const addCareerItem = () => {
    const newItem = {
      id: Date.now().toString(),
      title: 'New Role / Degree',
      subtitle: 'Company / University'
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
      generation: 'Family',
      relation: 'Sibling / Relative',
      name: 'Name',
      role: 'Occupation',
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
    { id: 'theme', label: 'Theme & Shloka', icon: Palette },
    { id: 'identity', label: 'Basics & Photo', icon: User },
    { id: 'personal', label: 'Janma & Kundali', icon: Calendar },
    { id: 'about', label: 'About & Hobbies', icon: Heart },
    { id: 'career', label: 'Education & Career', icon: GraduationCap },
    { id: 'family', label: 'Family Details', icon: Users },
    { id: 'contact', label: 'Contact & Addresses', icon: Phone },
  ];

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
        {/* TAB 1: THEME & SACRED BLESSINGS */}
        {activeTab === 'theme' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
                1. Select Royal Theme
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {THEMES.map((theme) => {
                  const isSelected = data.themeId === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => updateField('themeId', theme.id)}
                      className={`flex items-center gap-3 p-3 rounded-2xl border text-left transition-all ${
                        isSelected 
                          ? 'border-amber-600 ring-2 ring-amber-500/30 bg-amber-50/30' 
                          : 'border-stone-200 hover:border-stone-300 bg-white'
                      }`}
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex-none flex items-center justify-center text-white shadow-sm"
                        style={{ background: theme.heroBg }}
                      >
                        {isSelected && <Check className="w-5 h-5 stroke-[3]" />}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-stone-900 text-sm truncate">{theme.name}</div>
                        <div className="text-xs text-stone-500 truncate">{theme.subtitle}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-stone-200 pt-5">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
                2. Sacred Shloka / Blessing
              </h3>
              <div className="space-y-2">
                <label className="text-xs text-stone-600 font-medium">Choose a Preset Blessing:</label>
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
                  <label className="text-xs text-stone-600 font-medium">Or type a Custom Shloka:</label>
                  <input
                    type="text"
                    value={data.shloka}
                    onChange={(e) => updateField('shloka', e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-sanskrit"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-5">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
                3. Visual Embellishments
              </h3>
              <div className="space-y-3">
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

        {/* TAB 2: PROFILE & PHOTO */}
        {activeTab === 'identity' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
              Candidate Photo & Basics
            </h3>

            {/* Photo Upload */}
            <div className="p-4 rounded-2xl border-2 border-dashed border-stone-300 bg-stone-50/50 flex flex-col items-center text-center">
              {data.photoUrl ? (
                <div className="relative mb-3">
                  <img
                    src={data.photoUrl}
                    alt="Preview"
                    className="w-24 h-32 object-cover rounded-xl border-2 border-amber-500 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => updateField('photoUrl', '')}
                    className="absolute -top-2 -right-2 p-1 rounded-full bg-red-600 text-white shadow-sm hover:bg-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-amber-100 grid place-items-center text-amber-700 mb-2">
                  <Upload className="w-7 h-7" />
                </div>
              )}
              <label className="cursor-pointer px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 shadow-sm transition-all">
                <span>{data.photoUrl ? 'Change Photograph' : 'Upload Candidate Photograph'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-stone-500 mt-2">
                Supports JPG, PNG or WEBP (auto-fits gracefully into the golden arch).
              </p>
            </div>

            {/* Full Name */}
            <div>
              <label className="text-xs font-semibold text-stone-700">Full Name *</label>
              <input
                type="text"
                value={data.fullName}
                onChange={(e) => updateField('fullName', e.target.value)}
                placeholder="e.g. Abhijeet B Singh"
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 font-medium"
              />
            </div>

            {/* Vansh / Community Badge */}
            <div>
              <label className="text-xs font-semibold text-stone-700">
                Community / Lineage / Vansh (optional)
              </label>
              <input
                type="text"
                value={data.communityBadge}
                onChange={(e) => updateField('communityBadge', e.target.value)}
                placeholder="e.g. रघुवंशी or Kshatriya or Sharma"
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-[11px] text-stone-500">Displays with a sacred solar emblem beneath the name.</span>
            </div>

            {/* Tagline / Subtitle */}
            <div>
              <label className="text-xs font-semibold text-stone-700">
                Subtitle Tagline (Profession & Location)
              </label>
              <input
                type="text"
                value={data.profileTagline}
                onChange={(e) => updateField('profileTagline', e.target.value)}
                placeholder="e.g. Computer Engineer · Infosys · Mumbai"
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        )}

        {/* TAB 3: JANMA & KUNDALI */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
              Horoscope & Personal Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* DOB */}
              <div>
                <label className="text-xs font-semibold text-stone-700">Date of Birth</label>
                <input
                  type="date"
                  value={data.dob}
                  onChange={handleDobChange}
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Formatted Date */}
              <div>
                <label className="text-xs font-semibold text-stone-700">Display Date</label>
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
                <label className="text-xs font-semibold text-stone-700">Birth Time</label>
                <input
                  type="text"
                  value={data.birthTime}
                  onChange={(e) => updateField('birthTime', e.target.value)}
                  placeholder="e.g. 09:30 AM"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Birth Place */}
              <div>
                <label className="text-xs font-semibold text-stone-700">Birth Place</label>
                <input
                  type="text"
                  value={data.birthPlace}
                  onChange={(e) => updateField('birthPlace', e.target.value)}
                  placeholder="e.g. Varanasi, U.P."
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Height */}
              <div>
                <label className="text-xs font-semibold text-stone-700">Height</label>
                <input
                  type="text"
                  value={data.height}
                  onChange={(e) => updateField('height', e.target.value)}
                  placeholder={`e.g. 5'8"`}
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Manglik */}
              <div>
                <label className="text-xs font-semibold text-stone-700">Manglik Status</label>
                <select
                  value={data.manglik}
                  onChange={(e) => updateField('manglik', e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white"
                >
                  <option value="No">No (Non-Manglik)</option>
                  <option value="Yes">Yes (Manglik)</option>
                  <option value="Anshik">Anshik Manglik</option>
                  <option value="Don't Know">Don't Know</option>
                </select>
              </div>

              {/* Gotra */}
              <div>
                <label className="text-xs font-semibold text-stone-700">Gotra</label>
                <input
                  type="text"
                  value={data.gotra}
                  onChange={(e) => updateField('gotra', e.target.value)}
                  placeholder="e.g. Kashyap"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Rashi */}
              <div>
                <label className="text-xs font-semibold text-stone-700">Rashi</label>
                <input
                  type="text"
                  value={data.rashi}
                  onChange={(e) => updateField('rashi', e.target.value)}
                  placeholder="e.g. Mesh (Aries)"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Nakshatra */}
              <div>
                <label className="text-xs font-semibold text-stone-700">Nakshatra</label>
                <input
                  type="text"
                  value={data.nakshatra}
                  onChange={(e) => updateField('nakshatra', e.target.value)}
                  placeholder="e.g. Bharani"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Complexion */}
              <div>
                <label className="text-xs font-semibold text-stone-700">Complexion</label>
                <input
                  type="text"
                  value={data.complexion}
                  onChange={(e) => updateField('complexion', e.target.value)}
                  placeholder="e.g. Fair / Wheatish"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: ABOUT & HOBBIES */}
        {activeTab === 'about' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
              Introduction & Lifestyle
            </h3>

            <div>
              <label className="text-xs font-semibold text-stone-700">About Me Bio</label>
              <textarea
                rows={4}
                value={data.aboutMe}
                onChange={(e) => updateField('aboutMe', e.target.value)}
                placeholder="Write a warm, authentic intro describing your values, outlook, and interests..."
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Hobbies */}
            <div className="border-t border-stone-200 pt-4">
              <label className="text-xs font-semibold text-stone-700 block mb-2">
                Hobbies &amp; Interests
              </label>
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
                  placeholder="e.g. Classical Dance or Cricket"
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
              <label className="text-xs font-semibold text-stone-700 block mb-2">
                Languages Spoken
              </label>
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
                  placeholder="e.g. English, Hindi, Gujarati"
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
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Education &amp; Career History
              </h3>
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
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => updateCareerItem(item.id, 'title', e.target.value)}
                    placeholder="Role / Degree (e.g. Senior Software Engineer · Google)"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl bg-white font-medium"
                  />
                  <input
                    type="text"
                    value={item.subtitle}
                    onChange={(e) => updateCareerItem(item.id, 'subtitle', e.target.value)}
                    placeholder="Details / Institution (e.g. IIT Bombay · Dual Degree)"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl bg-white text-stone-600"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: FAMILY MEMBERS */}
        {activeTab === 'family' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Family Background (Parivar)
              </h3>
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
              {(data.familyMembers || []).map((m, idx) => (
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
                        placeholder="Relation (e.g. Father)"
                        className="px-2 py-1 text-xs font-semibold border border-stone-300 rounded-lg bg-white w-28 uppercase text-amber-800"
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
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={m.name}
                    onChange={(e) => updateFamilyMember(m.id, 'name', e.target.value)}
                    placeholder="Full Name"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl bg-white font-medium"
                  />

                  <input
                    type="text"
                    value={m.role}
                    onChange={(e) => updateFamilyMember(m.id, 'role', e.target.value)}
                    placeholder="Occupation / Details (e.g. Professor, Homemaker, Business)"
                    className="w-full px-3 py-2 text-sm border border-stone-300 rounded-xl bg-white text-stone-600"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: CONTACT & ADDRESSES */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
              Contact &amp; Location Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700">Phone / WhatsApp</label>
                <input
                  type="text"
                  value={data.contacts?.phone || ''}
                  onChange={(e) => updateNestedField('contacts', 'phone', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700">Phone Belongs To</label>
                <input
                  type="text"
                  value={data.contacts?.phoneLabel || 'Father'}
                  onChange={(e) => updateNestedField('contacts', 'phoneLabel', e.target.value)}
                  placeholder="e.g. Father or Self"
                  className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700">Email Address</label>
              <input
                type="email"
                value={data.contacts?.email || ''}
                onChange={(e) => updateNestedField('contacts', 'email', e.target.value)}
                placeholder="name@example.com"
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700">
                Current Residential Address (links to Google Maps)
              </label>
              <textarea
                rows={2}
                value={data.contacts?.currentAddress || ''}
                onChange={(e) => updateNestedField('contacts', 'currentAddress', e.target.value)}
                placeholder="Flat / Building, Street, City, State, Pincode"
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700">
                Native Village / Ancestral Place (links to Google Maps)
              </label>
              <textarea
                rows={2}
                value={data.contacts?.nativeAddress || ''}
                onChange={(e) => updateNestedField('contacts', 'nativeAddress', e.target.value)}
                placeholder="Village / Town, Tehsil, District, State, Pincode"
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="border-t border-stone-200 pt-4">
              <label className="text-xs font-semibold text-stone-700">Footer Sanskrit Blessing</label>
              <input
                type="text"
                value={data.footerBlessing}
                onChange={(e) => updateField('footerBlessing', e.target.value)}
                placeholder="॥ शुभम् भवतु ॥"
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl font-sanskrit"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700">Footer Closing Note</label>
              <input
                type="text"
                value={data.footerNote}
                onChange={(e) => updateField('footerNote', e.target.value)}
                placeholder="Thank you for taking the time to know me."
                className="w-full mt-1 px-3 py-2 text-sm border border-stone-300 rounded-xl"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
