import React, { useMemo, useState } from 'react';
import KalashSvg from './KalashSvg';
import { MandalaSvg, SuryaRaysSvg, VanshSunIcon } from './MandalaRaysSvg';
import { getResolvedTheme } from '../themes';
import { downloadBiodataText } from '../utils/exportText';
import { 
  Heart, 
  User, 
  GraduationCap, 
  Sparkles, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Home, 
  Share2, 
  Printer,
  Camera,
  X,
  FileText
} from 'lucide-react';

export default function BiodataPreview({ data, previewMode = 'desktop', onOpenFeedback }) {
  const theme = useMemo(() => {
    return getResolvedTheme(data);
  }, [data.themeId, data.themeOverrides, data.customTheme]);

  const [activeModalImage, setActiveModalImage] = useState(null);

  // Calculate live age from DOB
  const calculatedAge = useMemo(() => {
    if (!data.dob) return '28';
    try {
      const parts = data.dob.split('-');
      if (parts.length === 3) {
        const birthDate = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return isNaN(age) ? '28' : String(age);
      }
    } catch {
      // fallback
    }
    return '28';
  }, [data.dob]);

  // Height formatting (ft/in + cm)
  const formattedHeight = useMemo(() => {
    if (data.height && data.heightCm) {
      return `${data.height} (${data.heightCm} cm)`;
    }
    if (data.height) return data.height;
    if (data.heightCm) return `${data.heightCm} cm`;
    return "5'8\" (173 cm)";
  }, [data.height, data.heightCm]);

  // Multiple photos resolution
  const photoList = useMemo(() => {
    if (Array.isArray(data.photoUrls) && data.photoUrls.length > 0) {
      return data.photoUrls;
    }
    if (data.photoUrl) return [data.photoUrl];
    return ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=600&h=750&q=80"];
  }, [data.photoUrls, data.photoUrl]);

  const primaryPhoto = photoList[0];
  const additionalPhotos = photoList.slice(1);

  const handlePrint = () => {
    window.print();
    setTimeout(() => {
      onOpenFeedback?.();
    }, 1200);
  };

  const handleDownloadTxt = () => {
    downloadBiodataText(data);
    setTimeout(() => {
      onOpenFeedback?.();
    }, 800);
  };

  // Responsive wrapper styling
  const wrapperWidth = previewMode === 'mobile' 
    ? 'max-w-[420px]' 
    : previewMode === 'tablet' 
      ? 'max-w-[640px]' 
      : 'max-w-[820px]';

  return (
    <div 
      className="w-full min-h-full py-8 px-3 transition-colors duration-300"
      style={{
        background: `
          radial-gradient(1200px 600px at 50% -10%, #ffe4b0 0%, transparent 60%),
          radial-gradient(800px 500px at 0% 100%, #ffd5c2 0%, transparent 60%),
          radial-gradient(800px 500px at 100% 80%, #ffe9a8 0%, transparent 60%),
          ${theme.bgCream}
        `,
        color: theme.ink
      }}
    >
      <div className={`mx-auto ${wrapperWidth} transition-all duration-300`}>
        {/* Sacred Kalash */}
        <KalashSvg className="w-24 md:w-28 h-auto mx-auto drop-shadow-lg" />

        {/* Shloka */}
        <p 
          className="text-center font-sanskrit font-semibold text-lg md:text-xl tracking-wider mt-3"
          style={{ color: theme.headerColor }}
        >
          {data.shloka}
        </p>

        {/* Hero Section */}
        <header 
          className="relative mt-5 text-center rounded-3xl p-6 md:p-10 text-white overflow-hidden shadow-2xl transition-all"
          style={{
            background: `radial-gradient(circle at 50% 0%, rgba(255,214,120,0.35), transparent 55%), ${theme.heroBg}`,
            boxShadow: `0 20px 50px -15px ${theme.primary}66`
          }}
        >
          {/* Animated Mandala Background Ornaments */}
          {data.enableMandala && (
            <>
              <div className="absolute -top-24 -left-24 pointer-events-none animate-spin-slow">
                <MandalaSvg className="w-64 h-64 md:w-72 md:h-72 opacity-15" />
              </div>
              <div className="absolute -bottom-24 -right-24 pointer-events-none animate-spin-slow-rev">
                <MandalaSvg className="w-64 h-64 md:w-72 md:h-72 opacity-15" />
              </div>
            </>
          )}

          {/* Arched Portrait with Surya Rays */}
          <div className="relative mx-auto w-40 md:w-48 aspect-[4/5] flex items-center justify-center">
            {data.enableSuryaRays && (
              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] md:w-[340px] h-[280px] md:h-[340px] pointer-events-none">
                <SuryaRaysSvg className="w-full h-full" />
              </div>
            )}
            
            {/* The Arch Frame */}
            <div 
              onClick={() => setActiveModalImage(primaryPhoto)}
              className="relative w-full h-full overflow-hidden border-4 shadow-2xl z-10 cursor-pointer group"
              style={{
                borderRadius: '50% 50% 18px 18px / 40% 40% 18px 18px',
                borderColor: theme.goldLight,
                boxShadow: `0 0 0 3px rgba(255,255,255,0.35), 0 0 0 9px rgba(243,211,138,0.22), 0 0 40px rgba(255,200,100,0.65), 0 16px 32px rgba(0,0,0,0.4)`
              }}
              title="Click to view full photo"
            >
              <img 
                src={primaryPhoto} 
                alt={data.fullName}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>

          <p className="font-script text-3xl md:text-4xl mt-4 leading-none" style={{ color: theme.goldLight }}>
            Biodata
          </p>

          <h1 className="font-serif font-bold text-3xl md:text-5xl mt-2 tracking-wide text-transparent bg-clip-text bg-gradient-to-b from-[#fff7e2] via-[#ffd77a] to-[#f0b13a] drop-shadow-md">
            {data.fullName}
          </h1>

          {/* Vansh / Community Badge */}
          {data.communityBadge && (
            <div 
              className="inline-flex items-center gap-2 mt-3 px-5 py-1 rounded-full font-sanskrit text-base md:text-lg font-medium shadow-md"
              style={{
                background: theme.badgeBg,
                color: theme.primaryDark
              }}
            >
              <VanshSunIcon className="w-5 h-5 flex-none" />
              <span>{data.communityBadge}</span>
            </div>
          )}

          <p className="mt-2 text-sm md:text-base font-light text-amber-100">
            {data.profileTagline}
          </p>

          {/* Highlights Chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-4 text-xs md:text-sm">
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/15 border border-amber-200/40 text-amber-50 backdrop-blur-sm">
              <b className="text-amber-300 font-semibold mr-1">{calculatedAge}</b> years
            </span>
            {formattedHeight && (
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/15 border border-amber-200/40 text-amber-50 backdrop-blur-sm">
                <b className="text-amber-300 font-semibold mr-1">{formattedHeight}</b>
              </span>
            )}
            {data.birthPlace && (
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/15 border border-amber-200/40 text-amber-50 backdrop-blur-sm">
                Born in&nbsp;<b className="text-amber-300 font-semibold">{data.birthPlace}</b>
              </span>
            )}
            {data.manglik && (
              <span className="inline-flex items-center px-3.5 py-1.5 rounded-full bg-white/15 border border-amber-200/40 text-amber-50 backdrop-blur-sm">
                <b className="text-amber-300 font-semibold">
                  {data.manglik === 'No' ? 'Non-Manglik' : `${data.manglik} Manglik`}
                </b>
              </span>
            )}
          </div>
        </header>

        {/* Section: Multiple Photographs Gallery */}
        {additionalPhotos.length > 0 && (
          <section 
            className="relative mt-6 rounded-2xl p-6 border shadow-md transition-all print-break-inside-avoid"
            style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: theme.borderColor 
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl grid place-items-center text-white shadow-sm flex-none"
                style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})` }}
              >
                <Camera className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold" style={{ color: theme.headerColor }}>
                  Photo Gallery
                </h2>
                <small className="block font-sans text-xs uppercase tracking-widest text-amber-700 font-semibold">
                  Additional Photographs ({photoList.length} total)
                </small>
              </div>
              <div className="flex-1 h-[2px] ml-2 bg-gradient-to-r from-amber-200 to-transparent" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {photoList.map((imgUrl, idx) => (
                <div 
                  key={idx}
                  onClick={() => setActiveModalImage(imgUrl)}
                  className="group relative aspect-[4/5] rounded-xl overflow-hidden border-2 cursor-pointer shadow-sm hover:shadow-lg transition-all"
                  style={{ borderColor: idx === 0 ? theme.accentGold : theme.borderColor }}
                >
                  <img 
                    src={imgUrl} 
                    alt={`Candidate photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500 text-stone-950 shadow-sm">
                      Portrait Arch
                    </span>
                  )}
                  <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity grid place-items-center text-white text-xs font-medium">
                    <span>View Photo</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section: About Me */}
        {data.aboutMe && (
          <section 
            className="relative mt-6 rounded-2xl p-6 border shadow-md transition-all print-break-inside-avoid"
            style={{ 
              backgroundColor: theme.cardBg, 
              borderColor: theme.borderColor 
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl grid place-items-center text-white shadow-sm flex-none"
                style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})` }}
              >
                <Heart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold" style={{ color: theme.headerColor }}>
                  About Me
                </h2>
                <small className="block font-sans text-xs uppercase tracking-widest text-amber-700 font-semibold">
                  A little introduction
                </small>
              </div>
              <div className="flex-1 h-[2px] ml-2 bg-gradient-to-r from-amber-200 to-transparent" />
            </div>
            <p className="text-sm md:text-base leading-relaxed text-stone-700">
              {data.aboutMe}
            </p>
          </section>
        )}

        {/* Section: Personal & Kundali Details */}
        <section 
          className="relative mt-6 rounded-2xl p-6 border shadow-md transition-all print-break-inside-avoid"
          style={{ 
            backgroundColor: theme.cardBg, 
            borderColor: theme.borderColor 
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl grid place-items-center text-white shadow-sm flex-none"
              style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})` }}
            >
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold" style={{ color: theme.headerColor }}>
                Personal Details
              </h2>
              <small className="block font-sans text-xs uppercase tracking-widest text-amber-700 font-semibold">
                Janma &amp; Profile
              </small>
            </div>
            <div className="flex-1 h-[2px] ml-2 bg-gradient-to-r from-amber-200 to-transparent" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
            {data.dobFormatted && (
              <div className="p-3 rounded-xl bg-gradient-to-b from-white to-amber-50/40 border border-amber-100">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 block">Date of Birth</span>
                <span className="font-medium text-stone-800 text-sm md:text-base">{data.dobFormatted}</span>
              </div>
            )}
            {data.birthTime && (
              <div className="p-3 rounded-xl bg-gradient-to-b from-white to-amber-50/40 border border-amber-100">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 block">Birth Time</span>
                <span className="font-medium text-stone-800 text-sm md:text-base">{data.birthTime}</span>
              </div>
            )}
            {data.birthPlace && (
              <div className="p-3 rounded-xl bg-gradient-to-b from-white to-amber-50/40 border border-amber-100">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 block">Birth Place</span>
                <span className="font-medium text-stone-800 text-sm md:text-base">{data.birthPlace}</span>
              </div>
            )}
            <div className="p-3 rounded-xl bg-gradient-to-b from-white to-amber-50/40 border border-amber-100">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 block">Age</span>
              <span className="font-medium text-stone-800 text-sm md:text-base">{calculatedAge} years</span>
            </div>
            {formattedHeight && (
              <div className="p-3 rounded-xl bg-gradient-to-b from-white to-amber-50/40 border border-amber-100">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 block">Height</span>
                <span className="font-medium text-stone-800 text-sm md:text-base">{formattedHeight}</span>
              </div>
            )}
            {data.manglik && (
              <div className="p-3 rounded-xl bg-gradient-to-b from-white to-amber-50/40 border border-amber-100">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 block">Manglik</span>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {data.manglik}
                </span>
              </div>
            )}
            {data.gotra && (
              <div className="p-3 rounded-xl bg-gradient-to-b from-white to-amber-50/40 border border-amber-100">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 block">Gotra</span>
                <span className="font-medium text-stone-800 text-sm md:text-base">{data.gotra}</span>
              </div>
            )}
            {data.rashi && (
              <div className="p-3 rounded-xl bg-gradient-to-b from-white to-amber-50/40 border border-amber-100">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 block">Rashi</span>
                <span className="font-medium text-stone-800 text-sm md:text-base">{data.rashi}</span>
              </div>
            )}
            {data.nakshatra && (
              <div className="p-3 rounded-xl bg-gradient-to-b from-white to-amber-50/40 border border-amber-100">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 block">Nakshatra</span>
                <span className="font-medium text-stone-800 text-sm md:text-base">{data.nakshatra}</span>
              </div>
            )}
            {data.complexion && (
              <div className="p-3 rounded-xl bg-gradient-to-b from-white to-amber-50/40 border border-amber-100">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 block">Complexion</span>
                <span className="font-medium text-stone-800 text-sm md:text-base">{data.complexion}</span>
              </div>
            )}
          </div>
        </section>

        {/* Section: Education & Career */}
        <section 
          className="relative mt-6 rounded-2xl p-6 border shadow-md transition-all print-break-inside-avoid"
          style={{ 
            backgroundColor: theme.cardBg, 
            borderColor: theme.borderColor 
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl grid place-items-center text-white shadow-sm flex-none"
              style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})` }}
            >
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold" style={{ color: theme.headerColor }}>
                Education &amp; Career
              </h2>
              <small className="block font-sans text-xs uppercase tracking-widest text-amber-700 font-semibold">
                Learning and work
              </small>
            </div>
            <div className="flex-1 h-[2px] ml-2 bg-gradient-to-r from-amber-200 to-transparent" />
          </div>

          <div className="relative pl-7 space-y-4">
            <div 
              className="absolute left-2.5 top-2 bottom-2 w-0.5" 
              style={{ background: `linear-gradient(to bottom, ${theme.secondary}, ${theme.goldLight})` }}
            />
            {(data.careerItems || []).map((item) => (
              <div key={item.id} className="relative">
                <div 
                  className="absolute -left-7 top-1 w-3.5 h-3.5 rounded-full bg-white border-[3px]"
                  style={{ borderColor: theme.secondary, boxShadow: '0 0 0 3px #fff2db' }}
                />
                <div className="font-semibold text-base" style={{ color: theme.primary }}>
                  {item.title}
                </div>
                {item.subtitle && (
                  <div className="text-sm text-stone-600 mt-0.5">
                    {item.subtitle}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section: Interests & Languages */}
        <section 
          className="relative mt-6 rounded-2xl p-6 border shadow-md transition-all print-break-inside-avoid"
          style={{ 
            backgroundColor: theme.cardBg, 
            borderColor: theme.borderColor 
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl grid place-items-center text-white shadow-sm flex-none"
              style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})` }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold" style={{ color: theme.headerColor }}>
                Interests &amp; Languages
              </h2>
              <small className="block font-sans text-xs uppercase tracking-widest text-amber-700 font-semibold">
                What I enjoy
              </small>
            </div>
            <div className="flex-1 h-[2px] ml-2 bg-gradient-to-r from-amber-200 to-transparent" />
          </div>

          <div className="flex flex-wrap gap-2.5">
            {(data.hobbies || []).map((h, i) => (
              <div 
                key={i} 
                className="flex items-center gap-2.5 py-1.5 px-3 rounded-full bg-white border border-amber-200/80 shadow-xs text-sm font-medium text-stone-800"
              >
                <span className="w-7 h-7 rounded-full grid place-items-center bg-gradient-to-br from-amber-100 to-amber-200 text-base">
                  {h.emoji || '✨'}
                </span>
                <span>{h.text}</span>
              </div>
            ))}
          </div>

          {(data.languages || []).length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-stone-600">
              <span className="font-medium">Speaks:</span>
              {data.languages.map((lang, idx) => (
                <span 
                  key={idx} 
                  className="px-3 py-1 rounded-full text-xs font-medium text-amber-100 shadow-xs"
                  style={{ backgroundColor: theme.primary }}
                >
                  {lang}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Section: Family Parivar */}
        <section 
          className="relative mt-6 rounded-2xl p-6 border shadow-md transition-all print-break-inside-avoid"
          style={{ 
            backgroundColor: theme.cardBg, 
            borderColor: theme.borderColor 
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl grid place-items-center text-white shadow-sm flex-none"
              style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})` }}
            >
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold" style={{ color: theme.headerColor }}>
                Family
              </h2>
              <small className="block font-sans text-xs uppercase tracking-widest text-amber-700 font-semibold">
                Parivar
              </small>
            </div>
            <div className="flex-1 h-[2px] ml-2 bg-gradient-to-r from-amber-200 to-transparent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {(data.familyMembers || []).map((fam) => (
              <div 
                key={fam.id} 
                className="text-center p-4 rounded-xl border border-amber-100 bg-gradient-to-b from-white to-amber-50/50 shadow-xs relative"
              >
                <div 
                  className="w-12 h-12 mx-auto mb-2 rounded-full grid place-items-center font-serif text-lg font-bold text-white shadow-md ring-2 ring-white ring-offset-2 ring-offset-amber-200"
                  style={{
                    background: fam.isLate 
                      ? 'linear-gradient(135deg, #8a7a6a, #5e5146)' 
                      : `linear-gradient(135deg, ${theme.primary}, #b23a48)`
                  }}
                >
                  {(fam.name || 'F').trim().charAt(0).toUpperCase()}
                </div>
                <div className="text-[11px] uppercase tracking-wider font-semibold text-amber-700">
                  {fam.relation}
                </div>
                <div className="font-semibold text-stone-800 mt-0.5 text-sm md:text-base">
                  {fam.name}
                </div>
                {fam.role && (
                  <div className="text-xs text-stone-500 mt-0.5">
                    {fam.role}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section: Contact & Addresses */}
        <section 
          className="relative mt-6 rounded-2xl p-6 border shadow-md transition-all print-break-inside-avoid"
          style={{ 
            backgroundColor: theme.cardBg, 
            borderColor: theme.borderColor 
          }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div 
              className="w-10 h-10 rounded-xl grid place-items-center text-white shadow-sm flex-none"
              style={{ background: `linear-gradient(135deg, ${theme.secondary}, ${theme.primary})` }}
            >
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-xl font-bold" style={{ color: theme.headerColor }}>
                Contact Details
              </h2>
              <small className="block font-sans text-xs uppercase tracking-widest text-amber-700 font-semibold">
                Get in touch
              </small>
            </div>
            <div className="flex-1 h-[2px] ml-2 bg-gradient-to-r from-amber-200 to-transparent" />
          </div>

          <div className="grid gap-3">
            {data.contacts?.phone && (
              <a 
                href={`tel:${data.contacts.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white border border-amber-200/80 shadow-xs hover:-translate-y-0.5 transition-all text-stone-800"
              >
                <div className="w-10 h-10 rounded-xl grid place-items-center text-white bg-gradient-to-br from-emerald-600 to-emerald-500 shadow-sm flex-none">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 block">
                    {data.contacts.phoneLabel || 'Phone / WhatsApp'}
                  </span>
                  <span className="font-medium text-sm md:text-base">{data.contacts.phone}</span>
                </div>
              </a>
            )}

            {data.contacts?.email && (
              <a 
                href={`mailto:${data.contacts.email}`}
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white border border-amber-200/80 shadow-xs hover:-translate-y-0.5 transition-all text-stone-800"
              >
                <div className="w-10 h-10 rounded-xl grid place-items-center text-white bg-gradient-to-br from-amber-600 to-amber-500 shadow-sm flex-none">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 block">
                    Email
                  </span>
                  <span className="font-medium text-sm md:text-base">{data.contacts.email}</span>
                </div>
              </a>
            )}

            {data.contacts?.currentAddress && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.contacts.currentAddress)}`}
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white border border-amber-200/80 shadow-xs hover:-translate-y-0.5 transition-all text-stone-800"
              >
                <div 
                  className="w-10 h-10 rounded-xl grid place-items-center text-white shadow-sm flex-none"
                  style={{ background: `linear-gradient(135deg, ${theme.primary}, #b23a48)` }}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 block">
                    Current Address (Google Maps)
                  </span>
                  <span className="font-medium text-sm leading-snug">{data.contacts.currentAddress}</span>
                </div>
              </a>
            )}

            {data.contacts?.nativeAddress && (
              <a 
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(data.contacts.nativeAddress)}`}
                target="_blank" 
                rel="noreferrer"
                className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white border border-amber-200/80 shadow-xs hover:-translate-y-0.5 transition-all text-stone-800"
              >
                <div className="w-10 h-10 rounded-xl grid place-items-center text-white bg-gradient-to-br from-amber-800 to-yellow-600 shadow-sm flex-none">
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-amber-700 block">
                    Native Village Address
                  </span>
                  <span className="font-medium text-sm leading-snug">{data.contacts.nativeAddress}</span>
                </div>
              </a>
            )}
          </div>
        </section>

        {/* Footer Blessing */}
        <p className="text-center mt-8 font-sanskrit text-lg font-semibold" style={{ color: theme.headerColor }}>
          {data.footerBlessing || '॥ शुभम् भवतु ॥'}
          <small className="block font-sans text-xs text-stone-500 font-normal mt-1">
            {data.footerNote || 'Thank you for taking the time to know me.'}
          </small>
        </p>

        {/* Floating Action Bar */}
        <div className="no-print fixed left-1/2 bottom-5 -translate-x-1/2 z-40 flex items-center gap-2 p-2 rounded-full bg-stone-900/90 text-white backdrop-blur-md shadow-2xl border border-white/10">
          <button 
            type="button" 
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `${data.fullName} · Biodata`,
                  text: `Biodata of ${data.fullName}`,
                  url: window.location.href
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Page link copied to clipboard!');
              }
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs text-stone-950 bg-gradient-to-b from-amber-200 to-amber-400 hover:brightness-105 transition-all shadow-sm"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share</span>
          </button>

          <button 
            type="button" 
            onClick={handleDownloadTxt}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full font-medium text-xs text-amber-200 border border-amber-300/30 hover:bg-white/10 transition-all"
            title="Download lightweight plain text file (~2 KB)"
          >
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>.TXT (2KB)</span>
          </button>

          <button 
            type="button" 
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full font-bold text-xs text-stone-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-105 transition-all shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Save PDF</span>
          </button>
        </div>
      </div>

      {/* Image Modal Lightbox */}
      {activeModalImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 no-print"
          onClick={() => setActiveModalImage(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] rounded-2xl overflow-hidden shadow-2xl border-2 border-amber-400">
            <button
              type="button"
              onClick={() => setActiveModalImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <img 
              src={activeModalImage} 
              alt="Enlarged view" 
              className="w-full h-auto max-h-[85vh] object-contain bg-stone-950" 
            />
          </div>
        </div>
      )}
    </div>
  );
}
