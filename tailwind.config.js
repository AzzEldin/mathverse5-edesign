/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        edesign: {
          primary: '#39A9D0',       // أزرق سماوي أساسي
          crimson: '#B51F3A',       // أحمر قرمزي
          gold: '#E5A91B',          // ذهبي
          glow: 'rgba(57, 169, 208, 0.25)',
          darkBg: '#0b0f19',
          darkCard: 'rgba(15, 23, 42, 0.75)',
          lightBg: '#f8fafc',
          lightCard: 'rgba(255, 255, 255, 0.95)',
          border: 'rgba(255, 255, 255, 0.08)',
          borderHover: 'rgba(57, 169, 208, 0.35)',
        }
      },
      fontFamily: {
        sans: ['Cairo', 'Segoe UI', 'Tahoma', 'sans-serif'],
        math: ['Inter', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px rgba(57, 169, 208, 0.35)',
        'glow-gold': '0 0 25px rgba(229, 169, 27, 0.35)',
        'glow-crimson': '0 0 25px rgba(181, 31, 58, 0.35)',
      }
    },
  },
  plugins: [
    function({ addVariant }) {
      addVariant('light', 'html.light &');
    }
  ],
}
