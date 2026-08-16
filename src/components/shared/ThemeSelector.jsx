export default function ThemeSelector({ theme, setTheme }) {
  return (
    <div style={{ position: "fixed", top: "1rem", right: "1rem", zIndex: 9999 }}>
      <select value={theme} onChange={(e) => setTheme(e.target.value)}>
        <option value="light">☀️ Day</option>
        <option value="dark">🌙 Night</option>
        <option value="auto">⚙️ Auto</option>
      </select>
    </div>
  );
}
