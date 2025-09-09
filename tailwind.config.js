// tailwind.config.js
module.exports = {
  darkMode: 'class', // أو 'media'
  theme: {
    extend: {
      colors: {
        background: '#ffffff',
        foreground: '#1f2937',
        primary: '#06b6d4',
        secondary: '#facc15',
      },
    },
  },
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}"
  ],
  plugins: [],
}

