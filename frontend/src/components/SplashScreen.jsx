import { useState, useEffect } from 'react';

export default function SplashScreen({ onFinish }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 2000);
    const finishTimer = setTimeout(() => onFinish(), 2600);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-900 to-indigo-700 transition-opacity duration-600 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
      {/* Spinner */}
      <div className="w-14 h-14 border-4 border-indigo-300 border-t-white rounded-full animate-spin mb-6"></div>

      {/* Teks dengan fade in */}
      <h1 className={`text-white text-xl font-bold tracking-wide transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        Sistem Manajemen Anggaran Tim
      </h1>
      <p className={`text-indigo-300 text-sm mt-2 transition-opacity duration-700 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
        Memuat aplikasi...
      </p>
    </div>
  );
}