export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0c",
        panel: "#16161a",
        primary: "#4f46e5",
        secondary: "#10b981",
        risk: {
          low: "#10b981",
          medium: "#f59e0b",
          high: "#ef4444",
        }
      },
    },
  },
  plugins: [],
}
