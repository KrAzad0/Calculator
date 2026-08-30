# Calculator

A responsive web calculator built from scratch using **HTML, CSS, and vanilla JavaScript**.

## Live Demo

Once GitHub Pages is enabled for this repository, the calculator is available at:

**https://krazad0.github.io/Calculator/**

## Features

- Addition, subtraction, multiplication, and division
- Percentage calculations
- Positive/negative sign toggle
- Decimal calculations
- Delete and all-clear controls
- Keyboard support
- Division-by-zero and invalid-expression handling
- Responsive mobile/desktop layout
- Light and dark themes with saved preference
- Custom arithmetic parser — no `eval()`

## Keyboard Controls

| Key | Action |
|---|---|
| `0-9` | Enter digits |
| `.` | Decimal point |
| `+ - * /` | Arithmetic operators |
| `%` | Percentage |
| `Enter` or `=` | Calculate |
| `Backspace` | Delete last character |
| `Esc` | Clear calculator |

## Project Structure

```text
Calculator/
├── index.html
├── styles.css
├── script.js
├── README.md
└── .github/
    └── workflows/
        └── deploy-pages.yml
```

## Run Locally

Clone the repository and open `index.html` in a browser:

```bash
git clone https://github.com/KrAzad0/Calculator.git
cd Calculator
```

No dependencies or build step are required.

## GitHub Pages

This repository contains a GitHub Actions workflow for Pages deployment. In GitHub, open **Settings → Pages** and set **Source** to **GitHub Actions** if Pages has not been enabled yet. Every push to `main` will then deploy the website automatically.

## Technologies

- HTML5
- CSS3
- JavaScript (ES6+)
- GitHub Actions
- GitHub Pages

## Author

Kumar Azad
