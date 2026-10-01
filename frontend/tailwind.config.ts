import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        destructive: 'hsl(0 84% 60%)',
        border: 'hsl(214 31.8% 91.4%)',
        input: 'hsl(214 31.8% 91.4%)',
        ring: 'hsl(212 95% 58%)',
        background: 'hsl(0 0% 100%)',
        foreground: 'hsl(212 12% 3.9%)',
        primary: {
          DEFAULT: 'hsl(212 95% 58%)',
          foreground: 'hsl(210 40% 98%)',
        },
        secondary: {
          DEFAULT: 'hsl(210 40% 96%)',
          foreground: 'hsl(212 12% 3.9%)',
        },
        muted: {
          DEFAULT: 'hsl(210 40% 96%)',
          foreground: 'hsl(215.4 16.3% 46.9%)',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: '0.375rem',
        sm: '0.25rem',
      },
    },
  },
  plugins: [],
}

export default config
