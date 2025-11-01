// @ts-ignore;
import React, { useState, useRef, useEffect } from 'react';
// @ts-ignore;
import { Button } from '@/components/ui';
// @ts-ignore;
import { Globe, ChevronDown } from 'lucide-react';

// @ts-ignore;
import { useLanguage } from '@/components/LanguageContext';
export function LanguageSwitcher({
  className = ''
}) {
  const {
    currentLanguage,
    languages,
    changeLanguage
  } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const currentLang = languages.find(lang => lang.code === currentLanguage);
  const handleLanguageChange = languageCode => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };
  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = event => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  return <div className={`relative ${className}`} ref={dropdownRef}>
      <Button onClick={() => setIsOpen(!isOpen)} variant="ghost" className="flex items-center space-x-2 text-white hover:text-red-500 p-2">
        <Globe className="w-4 h-4 sm:w-5 sm:h-5" />
        <span className="flex items-center space-x-1">
          <span className="text-lg sm:text-xl">{currentLang?.flag || '🌐'}</span>
          <span className="hidden sm:inline text-sm">{currentLang?.displayName || 'Language'}</span>
        </span>
        <ChevronDown className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-50">
          <div className="py-2">
            {languages.filter(lang => lang.isActive).map(language => <button key={language.code} onClick={() => handleLanguageChange(language.code)} className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left flex items-center space-x-3 hover:bg-gray-800 transition-colors ${currentLanguage === language.code ? 'bg-red-900/30 text-red-400' : 'text-gray-300'}`}>
                <span className="text-lg sm:text-xl">{language.flag}</span>
                <div className="flex-1">
                  <div className="font-medium text-sm">{language.displayName}</div>
                  {language.isDefault && <div className="text-xs text-gray-500">默认语言</div>}
                </div>
                {currentLanguage === language.code && <div className="ml-auto">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  </div>}
              </button>)}
          </div>
        </div>}
    </div>;
}