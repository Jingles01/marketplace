import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
            },
        },
    },
    plugins: [
        // eslint-disable-next-line no-undef
        require('@tailwindcss/forms'),
    ],
}