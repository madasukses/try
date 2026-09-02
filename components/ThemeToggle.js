import { useDarkMode } from '../lib/useDarkMode';

export default function ThemeToggle({ className = '' }) {
  const [gelap, toggle] = useDarkMode();
  return (
    <button
      onClick={toggle}
      className={`text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300 dark:border-navy-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-navy-800 flex-shrink-0 ${className}`}
    >
      {gelap ? '☀️ Terang' : '🌙 Gelap'}
    </button>
  );
}
