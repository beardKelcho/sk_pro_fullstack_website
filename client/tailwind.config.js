/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class', // 'class' stratejisi ile karanlık mod
  theme: {
    extend: {
      colors: {
        primary: '#0066CC', // SK Production mavi rengi
        'primary-dark': '#004C99', // Daha koyu mavi tonu
        'primary-light': '#4D94DB', // Daha açık mavi tonu
        // Karanlık mod renkleri
        dark: {
          background: '#121212', // Koyu arkaplan
          surface: '#1E1E1E',   // Biraz daha açık arkaplan (bileşenler için)
          card: '#252525',      // Kartlar için arkaplan
          text: '#E1E1E1',      // Ana metin rengi
          secondary: '#AAAAAA', // İkincil metin rengi
          border: '#333333',    // Kenarlık rengi
        }
      },
      animation: {
        'fade-in-slide-up': 'fadeInSlideUp 1s ease-out',
        'scroll-right-to-left': 'scrollRightToLeft 60s linear infinite',
        'scroll-left-to-right': 'scrollLeftToRight 60s linear infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.4s cubic-bezier(0.165, 0.84, 0.44, 1) forwards',
      },
      keyframes: {
        fadeInSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scrollRightToLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(calc(-50% - 2rem))' }
        },
        scrollLeftToRight: {
          '0%': { transform: 'translateX(calc(-50% - 2rem))' },
          '100%': { transform: 'translateX(0)' }
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}; 