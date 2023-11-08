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
        'base100': '#0C1116',
      },
      backgroundSize: {
        '300%': '300%',
        '400%': '400%',
      },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'gradient-y': 'gradient-y 15s ease infinite',
        'gradient-xy': 'gradient-xy 15s ease infinite',
      },
      keyframes: {
        animatedgradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
      animation: {
        gradient: 'animatedgradient 60s ease infinite alternate',
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
          accent: '#B832BE',
          neutral: '#f0f0f0',
          'base-100': '#0C1116',
          'base-200': '#252d37',
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
