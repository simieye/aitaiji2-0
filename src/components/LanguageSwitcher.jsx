// @ts-ignore;
import React, { useState, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Globe, ChevronDown } from 'lucide-react';

export function LanguageSwitcher({
  currentLanguage,
  onLanguageChange,
  availableLanguages = ['zh', 'en']
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage || 'zh');
  const languages = {
    zh: {
      name: '中文',
      flag: '🇨🇳',
      code: 'zh'
    },
    en: {
      name: 'English',
      flag: '🇺🇸',
      code: 'en'
    }
  };
  useEffect(() => {
    setSelectedLanguage(currentLanguage || 'zh');
  }, [currentLanguage]);
  const handleLanguageSelect = languageCode => {
    setSelectedLanguage(languageCode);
    setIsOpen(false);
    if (onLanguageChange) {
      onLanguageChange(languageCode);
    }
    // 保存到localStorage
    localStorage.setItem('preferred-language', languageCode);
  };
  const currentLang = languages[selectedLanguage];
  return <div className="relative">
      <Button onClick={() => setIsOpen(!isOpen)} variant="ghost" className="flex items-center space-x-2 text-white hover:text-red-500 p-2 text-sm sm:text-base">
        <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="hidden sm:inline">{currentLang?.flag}</span>
        <span className="hidden md:inline">{currentLang?.name}</span>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {availableLanguages.map(langCode => {
          const lang = languages[langCode];
          return <button key={langCode} onClick={() => handleLanguageSelect(langCode)} className={`w-full px-3 sm:px-4 py-2 text-left flex items-center space-x-2 sm:space-x-3 hover:bg-gray-800 text-sm sm:text-base ${selectedLanguage === langCode ? 'bg-red-500/20 text-red-500' : 'text-white'}`}>
                <span className="text-base sm:text-lg">{lang.flag}</span>
                <span className="text-sm sm:text-base">{lang.name}</span>
                {selectedLanguage === langCode && <span className="ml-auto text-red-500 text-xs sm:text-sm">✓</span>}
              </button>;
        })}
          </div>
        </div>}
    </div>;
}