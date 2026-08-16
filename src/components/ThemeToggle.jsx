import { motion, AnimatePresence } from "framer-motion";
import { FaSun, FaMoon, FaLaptop } from "react-icons/fa";
import useTheme from "../hooks/useTheme";

export default function ThemeToggle() {
  const [theme, setTheme] = useTheme();

  const toggleTheme = () => {
    if (theme === "system") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("system");
    }
  };

  const getThemeDetails = () => {
    switch (theme) {
      case "light":
        return { icon: <FaSun size={15} className="text-amber-500" />, label: "Light" };
      case "dark":
        return { icon: <FaMoon size={14} className="text-indigo-400" />, label: "Dark" };
      case "system":
      default:
        return { icon: <FaLaptop size={14} className="text-teal-500" />, label: "System" };
    }
  };

  const { icon, label } = getThemeDetails();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Current theme is ${label}. Click to toggle.`}
      className="relative flex items-center justify-center gap-2 rounded-xl border border-ink-900/10 dark:border-white/10 bg-sand-50/50 dark:bg-ink-900/50 px-3.5 py-2 text-xs font-medium text-ink-900 dark:text-sand-100 shadow-sm transition-all hover:bg-sand-100/50 dark:hover:bg-sand-100/5"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ y: -10, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 10, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.15 }}
          className="flex items-center gap-1.5"
        >
          {icon}
          <span>{label}</span>
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
