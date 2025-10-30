// @ts-ignore;
import React, { useState, useEffect } from 'react';

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight - windowHeight;
      const scrolled = window.scrollY;
      const progress = scrolled / documentHeight * 100;
      setProgress(Math.min(100, Math.max(0, progress)));
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // 初始化
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <div className="fixed top-0 left-0 w-full h-1 bg-gray-800 z-50">
      <div className="h-full bg-red-500 transition-all duration-300" style={{
      width: `${progress}%`
    }} />
    </div>;
}