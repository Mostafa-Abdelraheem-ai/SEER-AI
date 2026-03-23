import { useTheme } from "../hooks/useTheme";

export default function ThemeToggle({ className = "", compact = false }) {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle ${className}`}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      <span className="theme-toggle__thumb">{isDark ? "◐" : "◑"}</span>
      {!compact ? <span className="theme-toggle__label">{isDark ? "Light UI" : "Dark UI"}</span> : null}
    </button>
  );
}
