# Inventory Management App

A modern, responsive Inventory Management System built with Vanilla HTML, CSS, and JavaScript.

## Features
- Dashboard with key metrics
- Product Management (Add/Edit)
- Category Management
- Inventory Movement Tracking (Stock In/Out)
- Light/Dark Mode
- LocalStorage persistence (No backend required)

## How to Run

Since this project uses modern ES Modules, you **cannot** simply double-click `index.html` due to browser security restrictions (CORS).

### Option 1: VS Code (Recommended)
1. Open this folder in VS Code.
2. Install the "Live Server" extension.
3. Right-click `index.html` and select "Open with Live Server".

### Option 2: Python
If you have Python installed, run this command in the project folder:
```bash
python -m http.server
```
Then open `http://localhost:8000`.

### Option 3: Node.js (If available)
```bash
npx http-server .
```
