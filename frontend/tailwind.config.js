/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#8B7355',      // 拿鐵棕
        secondary: '#87ACA3',    // 鼠尾草綠
        accent: '#C89F9C',       // 乾燥玫瑰
        background: '#FAF8F5',   // 米白色
      },
    },
  },
  plugins: [],
}
