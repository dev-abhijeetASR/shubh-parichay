import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import FormEditor from './components/FormEditor/FormEditor';
import BiodataPreview from './components/BiodataPreview';
import FallingPetals from './components/FallingPetals';
import FeedbackModal from './components/FeedbackModal';
import { initialBiodata } from './data/initialData';

const STORAGE_KEY = 'shubh_parichay_biodata_v1';

export default function App() {
  // Load from localStorage or use initial sample data
  const [biodata, setBiodata] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return initialBiodata;
  });

  // Save to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(biodata));
    } catch {
      // ignore
    }
  }, [biodata]);

  const [previewMode, setPreviewMode] = useState('desktop'); // 'mobile' | 'tablet' | 'desktop'
  const [mobileActiveView, setMobileActiveView] = useState('editor'); // 'editor' | 'preview'
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to clear all form fields?')) {
      setBiodata({
        ...initialBiodata,
        fullName: '',
        profileTagline: '',
        communityBadge: '',
        photoUrl: '',
        photoUrls: [],
        aboutMe: '',
        dob: '',
        dobFormatted: '',
        birthTime: '',
        birthPlace: '',
        height: '',
        heightCm: '',
        manglik: 'No',
        gotra: '',
        rashi: '',
        nakshatra: '',
        complexion: '',
        careerItems: [],
        hobbies: [],
        languages: [],
        familyMembers: [],
        contacts: {
          phone: '',
          phoneLabel: 'Father',
          email: '',
          currentAddress: '',
          nativeAddress: ''
        }
      });
    }
  };

  const handleLoadDemo = () => {
    if (window.confirm('Reset and load the sample biodata profile?')) {
      setBiodata(initialBiodata);
    }
  };

  const handleImportData = (newData) => {
    setBiodata(newData);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden flex flex-col bg-stone-100 text-stone-900">
      {/* Top Navigation */}
      <div className="no-print w-full max-w-full">
        <Navbar
          data={biodata}
          onResetData={handleResetData}
          onLoadDemo={handleLoadDemo}
          onImportData={handleImportData}
          previewMode={previewMode}
          setPreviewMode={setPreviewMode}
          mobileActiveView={mobileActiveView}
          setMobileActiveView={setMobileActiveView}
          onOpenFeedback={() => setIsFeedbackOpen(true)}
        />
      </div>

      {/* Main Studio Body: 2-Panel Split on Desktop, Tabbed on Mobile */}
      <div className="flex-1 flex overflow-hidden w-full max-w-full">
        {/* Left Side: Form Editor */}
        <aside 
          className={`w-full lg:w-[460px] xl:w-[500px] flex-none h-[calc(100dvh-53px)] lg:h-[calc(100vh-53px)] min-h-0 overflow-hidden no-print ${
            mobileActiveView === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          <FormEditor 
            data={biodata} 
            onChange={setBiodata} 
            onSwitchToPreview={() => setMobileActiveView('preview')}
          />
        </aside>

        {/* Right Side: Live Interactive Preview */}
        <main 
          className={`flex-1 h-[calc(100dvh-53px)] lg:h-[calc(100vh-53px)] min-h-0 overflow-y-auto relative scroll-smooth print:block print:h-auto print:overflow-visible print:w-full print:p-0 ${
            mobileActiveView === 'editor' ? 'hidden lg:block' : 'block'
          }`}
        >
          {biodata.enablePetals && <FallingPetals count={24} />}
          <div className="py-2 px-1 md:px-4 print:p-0 print:m-0">
            <BiodataPreview 
              data={biodata} 
              previewMode={previewMode} 
              onOpenFeedback={() => setIsFeedbackOpen(true)}
            />
          </div>
        </main>
      </div>

      {/* Feedback & Text Summary Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        data={biodata}
      />
    </div>
  );
}
