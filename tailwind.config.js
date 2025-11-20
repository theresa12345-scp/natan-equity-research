/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    {
      pattern: /bg-(slate|emerald|blue|amber|red|purple|orange|indigo|rose|cyan|teal|yellow)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /text-(slate|emerald|blue|amber|red|purple|orange|indigo|rose|cyan|teal|yellow)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /border-(slate|emerald|blue|amber|red|purple|orange|indigo|rose|cyan|teal|yellow)-(50|100|200|300|400|500|600|700|800|900)/,
    },
    {
      pattern: /fill-(slate|emerald|blue|amber|red|purple|orange|indigo|rose|cyan|teal|yellow)-(50|100|200|300|400|500|600|700|800|900)/,
    },
  ],
}
