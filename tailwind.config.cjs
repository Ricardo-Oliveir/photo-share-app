/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        'hero-pattern': "url('https://images.unsplash.com/photo-1514525253161-7a46d19cd819?fit=crop&w=1920&q=80')",
      },
    },
  },
  plugins: [],
}
