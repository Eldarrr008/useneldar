import { useTheme } from "@/components/ThemeProvider";
import "./ThemeToggle.css";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleToggle = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <label className="theme-switch">
      <input
        type="checkbox"
        checked={isDark}
        onChange={handleToggle}
        aria-label="Переключить тему"
      />
      <div className="theme-slider round">
        <div className="sun-moon">
          <svg className="moon-dot" style={{ left: 10, top: 3, width: 6, height: 6 }} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className="moon-dot" style={{ left: 2, top: 10, width: 10, height: 10 }} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className="moon-dot" style={{ left: 16, top: 18, width: 3, height: 3 }} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className="light-ray" style={{ left: -8, top: -8, width: 43, height: 43 }} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className="light-ray" style={{ left: '-50%', top: '-50%', width: 55, height: 55 }} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className="light-ray" style={{ left: -18, top: -18, width: 60, height: 60 }} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className="cloud-dark" style={{ left: 30, top: 15, width: 40 }} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className="cloud-dark" style={{ left: 44, top: 10, width: 20 }} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className="cloud-dark" style={{ left: 18, top: 24, width: 30 }} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className="cloud-light" style={{ left: 36, top: 18, width: 40 }} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className="cloud-light" style={{ left: 48, top: 14, width: 20 }} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
          <svg className="cloud-light" style={{ left: 22, top: 26, width: 30 }} viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" /></svg>
        </div>
        <div className="stars">
          <svg className="star" style={{ width: 20, top: 2, left: 3, animationDelay: '0.3s' }} viewBox="0 0 20 20">
            <path d="M 0 10 C 10 10,10 10,0 10 C 10 10,10 10,10 20 C 10 10,10 10,20 10 C 10 10,10 10,10 0 C 10 10,10 10,0 10 Z" />
          </svg>
          <svg className="star" style={{ width: 6, top: 16, left: 3 }} viewBox="0 0 20 20">
            <path d="M 0 10 C 10 10,10 10,0 10 C 10 10,10 10,10 20 C 10 10,10 10,20 10 C 10 10,10 10,10 0 C 10 10,10 10,0 10 Z" />
          </svg>
          <svg className="star" style={{ width: 12, top: 20, left: 10, animationDelay: '0.6s' }} viewBox="0 0 20 20">
            <path d="M 0 10 C 10 10,10 10,0 10 C 10 10,10 10,10 20 C 10 10,10 10,20 10 C 10 10,10 10,10 0 C 10 10,10 10,0 10 Z" />
          </svg>
          <svg className="star" style={{ width: 18, top: 0, left: 18, animationDelay: '1.3s' }} viewBox="0 0 20 20">
            <path d="M 0 10 C 10 10,10 10,0 10 C 10 10,10 10,10 20 C 10 10,10 10,20 10 C 10 10,10 10,10 0 C 10 10,10 10,0 10 Z" />
          </svg>
        </div>
      </div>
    </label>
  );
}
