# UI Standardization Guide

This document outlines the UI standards for all games in the Web Games Collection.

## 🎯 Current Status

### Fixed
✅ Word Chain - Now works with 20K word dictionary
✅ Consistent purple gradient background across games
✅ Standard button padding and transitions

### Needs Standardization

#### Home Buttons
**Missing home buttons:**
- ❌ Minesweeper
- ❌ Four-in-a-Row
- ❌ Card Flip

**Has home buttons:**
- ✅ Snake Battle
- ✅ Gravity Switch
- ✅ Gomoku
- ✅ Word Chain

**Standard home button code:**
```html
<button class="home-btn" onclick="goHome()">🏠 Home</button>
```

```javascript
function goHome() {
    window.location.href = 'index.html';
}
```

## 📐 UI Standards

### Color Scheme
```css
/* Primary Background */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Button Gradient */
background: linear-gradient(135deg, #667eea, #764ba2);

/* Semi-transparent Panels */
background: rgba(255, 255, 255, 0.1);
backdrop-filter: blur(10px);
```

### Button Standards
```css
button {
    padding: 15px 30px;
    font-size: 1.1em;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
    min-width: 44px;
    min-height: 44px;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.4);
}
```

### Controls Layout
```css
.controls {
    display: flex;
    gap: 15px; /* STANDARD: Always 15px */
    justify-content: center;
    flex-wrap: wrap;
    margin: 20px 0;
}
```

### Modal Overlay
```css
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7); /* STANDARD: 0.7 opacity */
    z-index: 1000;
    justify-content: center;
    align-items: center;
}
```

### Settings Panel
```css
.settings-panel {
    background: rgba(255, 255, 255, 0.1);
    padding: 20px;
    border-radius: 15px;
    margin: 20px 0;
    backdrop-filter: blur(10px);
}
```

## 🎮 Game-Specific Elements

### Header
```html
<h1>🎮 Game Title</h1>
```
```css
h1 {
    font-size: 2.5em;
    text-align: center;
    margin-bottom: 20px;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
```

### Sound Controls (Standardized)
```html
<div class="sound-controls">
    <button id="soundToggle" onclick="toggleSound()">🔊 Sound On</button>
    <input type="range" id="volumeSlider" min="0" max="100" value="50">
    <span id="volumeLabel">50%</span>
</div>
```

## 🔧 Implementation Checklist

To standardize a game:

- [ ] Add home button if missing
- [ ] Update button gap to 15px
- [ ] Ensure modal backdrop is rgba(0,0,0,0.7)
- [ ] Verify purple gradient background
- [ ] Check button padding is 15px 30px
- [ ] Add min touch target (44px x 44px)
- [ ] Ensure hover effect: translateY(-2px)
- [ ] Verify transition: all 0.3s ease
- [ ] Check settings panel styling
- [ ] Test on mobile (touch targets)

## 📱 Mobile Responsiveness

All games should include:
```css
* {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
}

@media (max-width: 768px) {
    button {
        padding: 12px 24px;
        font-size: 1em;
    }

    .controls {
        gap: 10px;
    }
}
```

## 🎨 Typography
```css
body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    color: white;
}
```

## ⚡ Performance
- Use `backdrop-filter: blur(10px)` sparingly
- Minimize shadow complexity
- Use `transform` for animations (GPU accelerated)
- Avoid animating `width/height` (use `scale` instead)

## 🚀 Future Improvements
- Create shared CSS file for common components
- Implement Web Components for reusable UI elements
- Add dark/light theme toggle
- Improve accessibility (ARIA labels, keyboard navigation)
- Add animation preferences (reduce motion)

---

Last updated: 2025-11-18
