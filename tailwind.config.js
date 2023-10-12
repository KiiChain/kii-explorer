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
      },
    },
  },
  plugins: [require("daisyui")],
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
          // ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
          // primary: '#0D2B8E',
          // secondary: '#12AAE8',
          // accent: '#B832BE',
          // neutral: '#f0f0f0',
          // // 'base-100': '#0F014A',
          // 'base-200': '#252d37',
          // info: '#3055e8',
          // success: '#43d6a0',
          // warning: '#bb720c',
          // error: '#e24028',
        },
      },
    ],
  },
};
