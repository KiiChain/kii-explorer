/** @type {import("tailwindcss").Config} */
module.exports = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        yes: '#3fb68b',
        no: '#ff5353',
        info: '#00b2ff',
        main: 'var(--text-main)',
        secondary: 'var(--text-secondary)',
        active: 'var(--bg-active)',
        'base100': '#0c071d',
        'base200': '#1f2937',
        'light-purple': '#e0d2fe',
        'violet': '#8942b5'
      },
      backgroundSize: {
        '15%': '15%',
        '25%': '25%',
        '30%': '30%',
        '300%': '300%',
        '400%': '400%',
      },
      backgroundImage: {
        'radial-gradient-base-duo': 'radial-gradient(circle at 50%, #180d26 20%, transparent)',
      },
    },
  },
  daisyui: {
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["[data-theme=light]"],
          primary: "#f0f0f0",
        },
      },
      {
        dark: {
          ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
          primary: '#0D2B8E',
          secondary: '#12AAE8',
          accent: '#e0b1ff',
          neutral: '#f0f0f0',
          'base-100': '#0C1116',
          'base-200': '#1f2937',
          'base-300': '#6B54DD',
          info: '#3055e8',
          success: '#43d6a0',
          warning: '#bb720c',
          error: '#e24028',
        },
      },
    ],
  },
  plugins: [require("daisyui")],
};
