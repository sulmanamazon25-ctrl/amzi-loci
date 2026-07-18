/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        card: "var(--card)",
        border: "var(--border)",
        "border-hover": "var(--border-hover)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
        },
        success: "var(--success)",
        danger: "var(--danger)",
        warning: "var(--warning)",
        text: {
          DEFAULT: "var(--text)",
          muted: "var(--text-muted)",
        },
      },
      borderRadius: {
        card: "var(--radius-card)",
        input: "var(--radius-input)",
        button: "var(--radius-button)",
        dialog: "var(--radius-dialog)",
      },
      fontFamily: {
        sans: ["var(--font-sans)"],
      },
      fontSize: {
        display: ["32px", { fontWeight: "600", lineHeight: "1.2" }],
        heading: ["24px", { fontWeight: "600", lineHeight: "1.3" }],
        section: ["18px", { fontWeight: "500", lineHeight: "1.4" }],
        body: ["14px", { fontWeight: "400", lineHeight: "1.5" }],
        caption: ["12px", { fontWeight: "500", lineHeight: "1.4" }],
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
};
