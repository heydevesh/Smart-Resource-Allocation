/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary-fixed": "#a1f2e1",
        "on-surface": "#1a1c1c",
        "on-error-container": "#93000a",
        "on-secondary": "#ffffff",
        "primary-container": "#0a6b5e",
        "on-surface-variant": "#3e4946",
        "on-error": "#ffffff",
        "inverse-surface": "#2f3130",
        "background": "#f9f9f8",
        "tertiary-container": "#742fe5",
        "outline": "#6f7976",
        "on-tertiary-fixed": "#25005a",
        "surface-container": "#eeeeed",
        "on-secondary-container": "#007151",
        "primary": "#005147",
        "on-primary-fixed": "#00201b",
        "tertiary-fixed": "#eaddff",
        "surface-bright": "#f9f9f8",
        "secondary": "#006c4e",
        "primary-fixed-dim": "#85d5c5",
        "on-primary-container": "#98e8d8",
        "surface-container-high": "#e8e8e7",
        "on-secondary-fixed-variant": "#00513a",
        "secondary-fixed": "#86f8c9",
        "outline-variant": "#bec9c5",
        "on-primary-fixed-variant": "#005046",
        "surface-container-low": "#f3f4f3",
        "secondary-fixed-dim": "#68dbae",
        "inverse-primary": "#85d5c5",
        "error-container": "#ffdad6",
        "tertiary-fixed-dim": "#d2bbff",
        "tertiary": "#5b00c7",
        "surface-container-lowest": "#ffffff",
        "on-primary": "#ffffff",
        "on-background": "#1a1c1c",
        "surface": "#f9f9f8",
        "on-tertiary-fixed-variant": "#5a00c6",
        "on-tertiary-container": "#e3d2ff",
        "on-secondary-fixed": "#002115",
        "inverse-on-surface": "#f1f1f0",
        "surface-tint": "#086a5d",
        "secondary-container": "#83f5c6",
        "error": "#ba1a1a",
        "surface-dim": "#dadad9",
        "surface-variant": "#e2e2e2",
        "surface-container-highest": "#e2e2e2",
        "on-tertiary": "#ffffff"
      },
      borderRadius: {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      fontFamily: {
        "headline": ["DM Serif Display", "serif"],
        "body": ["Inter", "sans-serif"],
        "label": ["Inter", "sans-serif"]
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}

