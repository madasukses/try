import { useEffect, useState } from 'react';

export function useDarkMode() {
  const [gelap, setGelap] = useState(false);

  useEffect(() => {
    const simpanan = localStorage.getItem('tryout_dark') === '1';
    setGelap(simpanan);
    document.documentElement.classList.toggle('dark', simpanan);
  }, []);

  function toggle() {
    setGelap((prev) => {
      const next = !prev;
      localStorage.setItem('tryout_dark', next ? '1' : '0');
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  }

  return [gelap, toggle];
}
