/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        base: '#0a0a0f',
        surface: '#12121a',
        card: '#1a1a26',
        border: '#2a2a3a',
        'neon-cyan': '#00e5ff',
        'neon-purple': '#bf5af2',
        'neon-green': '#39ff14',
        'neon-red': '#ff3366',
        'text-primary': '#e8e8f0',
        'text-muted': '#6b6b80',
        'text-dim': '#3d3d55',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 229, 255, 0.4), 0 0 40px rgba(0, 229, 255, 0.15)',
        'neon-purple': '0 0 20px rgba(191, 90, 242, 0.4), 0 0 40px rgba(191, 90, 242, 0.15)',
        'neon-green': '0 0 20px rgba(57, 255, 20, 0.4), 0 0 40px rgba(57, 255, 20, 0.15)',
        'neon-red': '0 0 20px rgba(255, 51, 102, 0.4), 0 0 40px rgba(255, 51, 102, 0.15)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
        'card-hover': '0 8px 40px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'pulse-neon': 'pulseNeon 2s ease-in-out infinite',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'shake': 'shake 0.4s ease-out forwards',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 1.5s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseNeon: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.92)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '20%': { transform: 'translateX(-8px)' },
          '40%': { transform: 'translateX(8px)' },
          '60%': { transform: 'translateX(-5px)' },
          '80%': { transform: 'translateX(5px)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(0, 229, 255, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(0, 229, 255, 0.6), 0 0 60px rgba(0, 229, 255, 0.2)' },
        },
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
