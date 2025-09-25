/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#138808", // Deep Indian Green
          foreground: "#FFFFFF",
          100: "#E6F5E6",
          200: "#C1E5C1",
          300: "#9DD59D",
          400: "#78C578",
          500: "#54B554",
          600: "#3C943C",
          700: "#2A742A",
          800: "#1C531C",
          900: "#0E330E",
        },
        secondary: {
          DEFAULT: "#FF9933", // Deep Saffron (from Indian flag)
          foreground: "#FFFFFF",
          100: "#FFF0E5",
          200: "#FFD9B8",
          300: "#FFC28A",
          400: "#FFAB5C",
          500: "#FF942E",
          600: "#FF8000",
          700: "#CC6600",
          800: "#994C00",
          900: "#663300",
        },
        accent: {
          DEFAULT: "#4B76E5", // Complementary blue (for balance)
          foreground: "#FFFFFF",
          100: "#E5ECFC",
          200: "#C1D0F8",
          300: "#9DB4F4",
          400: "#7998F0",
          500: "#547CEC",
          600: "#2F60E8",
          700: "#1A4AD3",
          800: "#143AA3",
          900: "#0F2872",
        },
        muted: {
          DEFAULT: "#F8FAF8", // Light green-tinted gray
          foreground: "#546854",
        },
        destructive: {
          DEFAULT: "#E53935", // Warning/error red
          foreground: "#FFFFFF",
        },
        success: {
          DEFAULT: "#2E7D32", // Success green
          foreground: "#FFFFFF",
        },
        warning: {
          DEFAULT: "#FF8F00", // Warning amber
          foreground: "#FFFFFF",
        },
        info: {
          DEFAULT: "#0277BD", // Info blue
          foreground: "#FFFFFF",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
      },
      fontFamily: {
        sans: ["Poppins", "sans-serif"],
        hindi: ["Mukta", "sans-serif"],
        display: ["'Playfair Display'", "serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'neumorphic-light': '5px 5px 10px #d1d9e6, -5px -5px 10px #ffffff',
        'neumorphic-pressed': 'inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff',
        'glass': '0 4px 30px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
        "fade-in": {
          "0%": {
            opacity: "0",
          },
          "100%": {
            opacity: "1",
          },
        },
        "scale-up": {
          "0%": {
            transform: "scale(0.95)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "float": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
        "pulse-gentle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
        "ripple": {
          "0%": { transform: "scale(0)", opacity: "0.5" },
          "100%": { transform: "scale(4)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "scale-up": "scale-up 0.5s ease-out",
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "float": "float 3s ease-in-out infinite",
        "pulse-gentle": "pulse-gentle 2s ease-in-out infinite",
        "ripple": "ripple 0.7s linear",
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}