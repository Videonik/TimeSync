import { useState, useEffect } from 'react';

export function LoginButton() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Basic check for token existence
    const token = localStorage.getItem('jwt_token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    // Redirect to the NestJS backend route that triggers Yandex OAuth
    window.location.href = 'http://localhost:3000/auth/yandex';
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt_token');
    setIsLoggedIn(false);
    window.location.reload();
  };

  if (isLoggedIn) {
    return (
      <button 
        onClick={handleLogout}
        className="text-sm font-medium text-gray-500 hover:text-red-600 transition-colors ml-4"
      >
        Выйти
      </button>
    );
  }

  return (
    <button 
      onClick={handleLogin}
      className="ml-4 px-4 py-2 bg-[#ffcc00] hover:bg-[#ffdb4d] text-black text-sm font-medium rounded-md shadow-sm transition-colors flex items-center gap-2"
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8.61863 15.864C8.61863 15.864 12.0626 15.864 12.6366 15.864C13.2106 15.864 13.7846 15.29 13.7846 14.716V1.51602C13.7846 0.942021 13.2106 0.368021 12.6366 0.368021C12.0626 0.368021 8.61863 0.368021 8.61863 0.368021V3.23802C8.61863 3.23802 10.9146 3.23802 10.9146 5.53402V10.702C10.9146 12.998 8.61863 12.998 8.61863 12.998V15.864Z" fill="black"/>
        <path d="M7.38092 0.368021C7.38092 0.368021 3.93692 0.368021 3.36292 0.368021C2.78892 0.368021 2.21492 0.942021 2.21492 1.51602V14.716C2.21492 15.29 2.78892 15.864 3.36292 15.864C3.93692 15.864 7.38092 15.864 7.38092 15.864V12.994C7.38092 12.994 5.08492 12.994 5.08492 10.698V5.53002C5.08492 3.23402 7.38092 3.23402 7.38092 3.23402V0.368021Z" fill="#F03D25"/>
      </svg>
      Войти через Яндекс
    </button>
  );
}
