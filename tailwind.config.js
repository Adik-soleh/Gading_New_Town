/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#137fec",
                "primary-blue": "#135bec",
                "warga-primary": "#137fec",
                "mutasi-primary": "#137fec",
                "ipl-primary": "#137fec",
                "izin-primary": "#137fec",
                "lapor-primary": "#137fec",
                "log-primary": "#137fec",
                "background-light": "#f6f8f6",
                "background-dark": "#112116",
                "surface-light": "#ffffff",
                "surface-dark": "#1c2e22",
                "text-main": "#0e1b12",
                "text-secondary": "#4e9767",
            },
            fontFamily: {
                "display": ["Public Sans", "sans-serif"],
                "body": ["Public Sans", "sans-serif"],
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "lg": "0.5rem",
                "xl": "0.75rem",
                "2xl": "1rem",
                "full": "9999px",
            },
        },
    },
    plugins: [],
}
