# CLAUDE.md - AI Assistant Development Guide

## Project Overview

**Repository**: Web-Game
**Type**: Single-page web application
**Primary File**: `card-flip-game-with-leaderboard.html`
**Live URL**: https://sampi314.github.io/Web-Game/card-flip-game-with-leaderboard.html

This is a feature-rich card matching memory game built as a self-contained HTML file with embedded CSS and JavaScript. The game includes multiple difficulty levels, game modes, themes, achievements, statistics tracking, and a persistent leaderboard system.

---

## Codebase Structure

### File Organization

```
Web-Game/
├── README.md                                    # Simple repo info with live URL
├── card-flip-game-with-leaderboard.html        # Main game file (~3,605 lines)
└── CLAUDE.md                                    # This file
```

### Architecture Pattern

The application follows a **monolithic single-file architecture** where everything is contained in one HTML file:

- **Lines 1-1700**: CSS Styling (inline `<style>` tag)
- **Lines 1701-3604**: JavaScript Logic (inline `<script>` tag)
- **HTML Structure**: Embedded throughout with game UI elements

This design choice prioritizes:
- Easy deployment (single file to host)
- GitHub Pages compatibility
- No build process required
- Self-contained functionality

---

## Core Game Features

### 1. Difficulty Levels (Board Dimensions)
- **4x4 Grid**: 8 pairs (16 cards) - Beginner
- **6x6 Grid**: 18 pairs (36 cards) - Intermediate
- **8x8 Grid**: 32 pairs (64 cards) - Advanced
- **Custom Dimensions**: User-configurable rows/columns

### 2. Game Modes

The game includes 8 distinct modes (stored in `gameMode` variable):

| Mode | Behavior | Line References |
|------|----------|-----------------|
| `normal` | Standard memory match | Default |
| `peek` | Shows all cards for 5 seconds at start | ~3502-3544 |
| `fade` | Cards fade out after 5 seconds of first view | ~2127-2135 |
| `fortune` | Shows hint message for first flipped card | ~2076-2125 |
| `chaos` | Cards randomly swap positions after matches | ~2225-2229 |
| `swap` | Alternative card swapping behavior | ~2227-2229 |
| `rotate` | Entire deck rotates after matches | ~2320-2347 |
| `color` | Card back colors shift every 5 seconds | ~3546-3594 |

### 3. Icon Sets

Players can choose from predefined emoji sets or create custom ones:

- **Animals**: 🐶 🐱 🐭 🐹 🐰 🦊 🐻 🐼 (default)
- **Fruits**: 🍎 🍊 🍋 🍌 🍉 🍇 🍓 🍒
- **Planets**: 🌍 🌎 🌏 ☀️ 🌙 ⭐ 🪐 💫
- **Sports**: ⚽ 🏀 🏈 ⚾ 🎾 🏐 🏉 🎱
- **Food**: 🍕 🍔 🌮 🍗 🍜 🍱 🍙 🍛
- **Ocean**: 🐠 🐡 🦈 🐙 🦑 🐚 🦀 🦞
- **Custom**: User-provided comma-separated emojis

Function: `setIconSet()` at line ~1973

### 4. Visual Themes

Six color themes modify the background gradient and card glow effects:

- **Purple** (default): `#667eea → #764ba2`
- **Ocean**: Blue-cyan gradient
- **Sunset**: Orange-pink gradient
- **Forest**: Green gradient
- **Midnight**: Dark blue gradient
- **Candy**: Pink-red gradient

Implementation: CSS classes `.theme-*` (lines 408-428) and `setTheme()` function (line ~2714)

### 5. Sound System

- **Background Music**: Web Audio API synthesized music
- **Sound Effects**: Match, mismatch, win, and combo sounds
- **Volume Controls**:
  - Music volume (0-100%)
  - Effects volume (0-100%)
  - Individual sliders with real-time preview

Key functions:
- `startMusic()` - Begins background audio loop
- `playMatchSound()` / `playMismatchSound()` - Effect triggers

### 6. Scoring System

Score calculation includes multiple factors:

```javascript
Base Match Points: 100
Combo Multiplier: (combo count) × 50
Time Bonus: max(0, 5000 - (time × 10))
Mode-specific bonuses: varies by gameMode
```

Combo system:
- Consecutive matches increase combo counter
- Each combo level adds visual effects and score multipliers
- Breaking the streak resets combo to 0

Implementation: `checkMatch()` function (line ~2155)

### 7. Persistent Data (localStorage)

The game stores three types of data:

| Key | Data Stored | Purpose |
|-----|-------------|---------|
| `memoryGameLeaderboard` | Array of high scores | Multi-board leaderboard |
| `memoryGameStats` | Statistics object | Lifetime game metrics |
| `memoryGameAchievements` | Achievement progress | Unlock tracking |

**Leaderboard Entry Structure**:
```javascript
{
  name: string,
  score: number,
  moves: number,
  time: number,
  boardSize: "4x4" | "6x6" | "8x8" | string,
  gameMode: string,
  date: ISO timestamp
}
```

### 8. Statistics Tracking

Comprehensive statistics include:
- Games played
- Total/average/best score
- Total playtime (seconds)
- Average time per game
- Average moves per game
- Match accuracy percentage
- Best combo streak
- Total matches vs attempts

Functions:
- `updateStatisticsDisplay()` (line ~2644)
- `resetStatistics()` (line ~2692)

### 9. Achievement System

15 unlockable achievements with progress tracking:

Categories:
- **Performance**: Fast completion times, few moves
- **Exploration**: Try all modes/themes
- **Mastery**: High scores, combos, accuracy
- **Milestones**: Games played, total playtime

Implementation:
- `checkAchievement()` (line ~2791)
- `unlockAchievement()` (line ~2808)
- `showAchievementNotification()` (line ~2824)

---

## Key JavaScript Functions

### Game Flow Functions

| Function | Line | Purpose |
|----------|------|---------|
| `createBoard()` | ~2025 | Initialize game grid with card pairs |
| `flipCard()` | ~2047 | Handle card click and flip animation |
| `checkMatch()` | ~2155 | Validate if two flipped cards match |
| `winGame()` | ~2356 | End game, calculate score, show modal |
| `startTimer()` | ~2349 | Begin game timer |

### UI Management Functions

| Function | Line | Purpose |
|----------|------|---------|
| `applyDimensions()` | ~1937 | Set custom board size |
| `setIconSet()` | ~1973 | Change card icon theme |
| `applyCustomIcons()` | ~2002 | Apply user-provided icons |
| `setTheme()` | ~2714 | Change visual theme |
| `toggleLeaderboard()` | ~2528 | Show/hide leaderboard panel |
| `toggleStats()` | ~2628 | Show/hide statistics panel |
| `toggleAchievements()` | ~2736 | Show/hide achievements panel |

### Special Mode Functions

| Function | Line | Purpose |
|----------|------|---------|
| `startPeekMode()` | ~3502 | Show all cards temporarily |
| `startCardFade()` | ~2127 | Begin fade effect on card |
| `showFortuneHint()` | ~2076 | Display fortune cookie hint |
| `randomizeCards()` | ~2239 | Shuffle card positions (chaos) |
| `swapCards()` | ~2301 | Swap two card positions |
| `rotateDeck()` | ~2320 | Rotate entire board |
| `startColorChaos()` | ~3546 | Begin color shifting effect |

### Data Persistence Functions

| Function | Line | Purpose |
|----------|------|---------|
| `submitScore()` | ~2489 | Save score to leaderboard |
| `addToLeaderboard()` | ~2515 | Add entry to localStorage |
| `displayLeaderboard()` | ~2551 | Render leaderboard UI |
| `updateStatisticsDisplay()` | ~2644 | Refresh stats panel |

---

## Development Conventions

### Code Style

1. **Naming Conventions**:
   - Functions: `camelCase` (e.g., `flipCard`, `checkMatch`)
   - Variables: `camelCase` (e.g., `flippedCards`, `gameMode`)
   - CSS Classes: `kebab-case` (e.g., `.card-front`, `.info-panel`)
   - IDs: `camelCase` (e.g., `#leaderboardPanel`, `#modeSelect`)

2. **Global State Variables** (declared at top of `<script>`):
   ```javascript
   let boardSize = { rows: 4, cols: 4 };
   let currentIcons = [...];
   let flippedCards = [];
   let matchedPairs = 0;
   let canFlip = true;
   let moves = 0;
   let score = 0;
   let combo = 0;
   let timer = 0;
   let gameMode = 'normal';
   ```

3. **Event Handlers**:
   - Inline `onclick` attributes in HTML
   - Direct function calls (no event delegation)

4. **CSS Organization**:
   - Universal reset (`*` selector)
   - Component-based sections with comments
   - Theme variations via body classes
   - Responsive design with flexbox

### Animation Patterns

1. **Card Flip**: CSS `transform: rotateY(180deg)` with 0.6s transition
2. **Combo Messages**: Fixed position with keyframe animation (`@keyframes comboPopup`)
3. **Achievement Notifications**: Slide-in from right with auto-dismiss
4. **Color Shifts**: `setInterval` updating inline styles

### LocalStorage Schema

Always use try-catch when accessing localStorage to handle quota/privacy errors:

```javascript
try {
  const data = JSON.parse(localStorage.getItem('key')) || defaultValue;
  // Use data
} catch (error) {
  console.error('LocalStorage error:', error);
}
```

---

## Common Development Tasks

### Adding a New Game Mode

1. Add mode option to `<select id="modeSelect">` in HTML
2. Update `setMode()` function to handle new mode
3. Add mode-specific logic in `flipCard()` or `checkMatch()`
4. Update achievement tracking in `winGame()`
5. Add mode icon to `modeIcons` object in `displayLeaderboard()`

**Example locations**:
- Mode selector HTML: ~1488
- Mode logic: ~2059-2229
- Mode icons: ~2591

### Adding a New Theme

1. Define gradient in CSS `body.theme-{name}` selector
2. Add matched card glow effect in `body.theme-{name} .card.matched`
3. Create theme button in HTML theme selector section
4. Update `setTheme()` function to handle new theme
5. Save theme preference to localStorage

**Example locations**:
- Theme CSS: 408-428
- Theme selector: Look for `.theme-options` in HTML

### Adding a New Achievement

1. Add achievement object to `achievements` variable:
   ```javascript
   newAchievement: {
     id: 'uniqueId',
     name: 'Achievement Name',
     description: 'What to do',
     icon: '🏆',
     unlocked: false,
     progress: 0,
     total: targetValue
   }
   ```
2. Add check logic in `checkAchievement()` function
3. Call `checkAchievement('uniqueId')` at appropriate trigger point
4. Achievement notification will auto-display on unlock

**Example location**: Achievement definitions start around line ~1682

### Modifying Scoring Algorithm

1. Locate `checkMatch()` function (~2155)
2. Find the score calculation section
3. Adjust base points, multipliers, or bonuses
4. Consider mode-specific scoring variations
5. Test with different board sizes and modes

### Adding New Icon Set

1. Add button to `.icon-sets` div in HTML
2. Create icon array (8+ unique emojis)
3. Call `setIconSet('setName')` with new array
4. Icons automatically duplicate to fill board

**Example location**: Icon sets defined around line ~1973

---

## Testing Checklist

When making changes, verify:

- [ ] All board sizes work (4x4, 6x6, 8x8, custom)
- [ ] Each game mode functions correctly
- [ ] Theme changes apply properly
- [ ] Sound effects play at correct volume
- [ ] LocalStorage saves/loads correctly
- [ ] Leaderboard displays and filters by size
- [ ] Statistics update accurately
- [ ] Achievements unlock at proper triggers
- [ ] Responsive design works on mobile
- [ ] No console errors in browser DevTools

---

## Git Workflow

### Branch Strategy

This repository uses feature branches with a specific naming pattern:
- Branch format: `claude/claude-md-{session-id}`
- Example: `claude/claude-md-mi2dsblyuikf5zuv-01ERSMJsCZXbE2G5YhfNeErY`

### Commit Guidelines

1. **Message Format**: Use clear, descriptive messages
   - Good: "Add color chaos game mode with 5-second intervals"
   - Bad: "Update file"

2. **Frequency**: Commit logical units of work
   - Single feature additions
   - Bug fixes
   - UI improvements

3. **Push Strategy**:
   ```bash
   git push -u origin <branch-name>
   ```
   - Always use `-u` flag for first push
   - Retry on network errors with exponential backoff (2s, 4s, 8s, 16s)

### Example Workflow

```bash
# Check current branch
git status

# Make changes to files
# ... edit card-flip-game-with-leaderboard.html ...

# Stage changes
git add card-flip-game-with-leaderboard.html

# Commit with descriptive message
git commit -m "Add rainbow theme with gradient animation"

# Push to remote
git push -u origin claude/claude-md-{session-id}
```

---

## Deployment

The game is deployed via **GitHub Pages**:
- **Source**: Root directory
- **Branch**: Main/master
- **File**: `card-flip-game-with-leaderboard.html`
- **URL**: https://sampi314.github.io/Web-Game/card-flip-game-with-leaderboard.html

### Deployment Process

1. Merge feature branch to main
2. GitHub Pages automatically builds from main branch
3. Changes go live within 1-2 minutes
4. No build process needed (static HTML)

---

## AI Assistant Guidelines

### When Modifying Code

1. **Always read the entire relevant section** before making changes
   - The file is large (~3,605 lines)
   - Use Read tool with offset/limit for targeted sections
   - Search for function definitions with Grep tool

2. **Preserve existing functionality**
   - Test all game modes after changes
   - Verify localStorage compatibility
   - Check for unintended side effects

3. **Maintain code style consistency**
   - Use existing naming patterns
   - Match indentation (4 spaces)
   - Keep inline HTML event handlers

4. **Consider performance**
   - Minimize DOM queries (cache selectors)
   - Avoid memory leaks in intervals/timeouts
   - Clean up event listeners

5. **Update related systems**
   - If adding features, update achievements
   - If changing scoring, update statistics
   - If modifying UI, check responsive design

### When Answering Questions

1. **Provide line references** for code locations
   - Example: "The scoring logic is in `checkMatch()` at line 2155"

2. **Explain context** from surrounding code
   - How features interact
   - Why certain patterns are used

3. **Reference this file** for architecture questions
   - Point to relevant sections in CLAUDE.md

### Common Pitfalls to Avoid

1. **Don't create separate JS/CSS files**
   - Keep everything in single HTML file
   - Maintains deployment simplicity

2. **Don't break localStorage compatibility**
   - Always migrate existing data formats
   - Use fallback values for missing keys

3. **Don't remove inline event handlers**
   - Code relies on onclick attributes
   - Refactoring would require major changes

4. **Don't assume standard build tools**
   - No webpack, npm, or transpilation
   - Pure ES5/ES6 compatibility

5. **Don't forget mobile support**
   - Test responsive breakpoints
   - Ensure touch events work

---

## Performance Considerations

### Current Optimizations

1. **CSS Animations**: Hardware-accelerated transforms
2. **Event Handling**: Minimal delegation, direct function calls
3. **LocalStorage**: Batch reads/writes, error handling
4. **DOM Updates**: Update only changed elements

### Known Limitations

1. **Large Boards**: 8x8+ may have performance issues on low-end devices
2. **Animations**: Multiple simultaneous effects can cause lag
3. **localStorage**: 5-10MB limit may restrict leaderboard size
4. **Single File**: Large file size (~100KB+) increases load time

### Improvement Opportunities

1. Virtual scrolling for large leaderboards
2. Web Workers for complex calculations
3. Service Worker for offline play
4. Code splitting (would require build process)

---

## Browser Compatibility

**Tested/Supported Browsers**:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

**Required Features**:
- CSS Grid
- CSS Transforms (3D)
- localStorage
- ES6 features (const, let, arrow functions, template literals)
- Web Audio API (for sounds)

---

## Troubleshooting

### Common Issues

1. **Cards won't flip**
   - Check `canFlip` variable state
   - Verify no modal overlays blocking clicks
   - Look for JavaScript errors in console

2. **Leaderboard not saving**
   - Check localStorage quota
   - Verify browser privacy settings
   - Look for JSON parse errors

3. **Sounds not playing**
   - Check volume settings (may be 0)
   - Verify Web Audio API support
   - Check browser autoplay policies

4. **Theme not applying**
   - Verify body class is set
   - Check CSS specificity conflicts
   - Clear browser cache

### Debug Mode

To enable verbose logging, add to `<script>`:
```javascript
const DEBUG = true;
console.log('Debug info...');
```

---

## Future Enhancement Ideas

### Potential Features

1. **Multiplayer Mode**
   - Turn-based play
   - WebSocket or Firebase integration
   - Real-time leaderboard updates

2. **Power-ups**
   - Reveal two random cards
   - Freeze timer for 10 seconds
   - Earn through gameplay

3. **Daily Challenges**
   - Preset boards with specific goals
   - Bonus points for completion
   - Shareable results

4. **Accessibility**
   - Screen reader support
   - Keyboard navigation
   - High contrast mode
   - Sound-only mode option

5. **Social Features**
   - Share scores on social media
   - Challenge friends
   - Global leaderboard (requires backend)

6. **Analytics**
   - Track popular modes
   - Average session duration
   - Completion rates by difficulty

### Technical Debt

1. Refactor into modular components (would require build process)
2. Migrate to TypeScript for type safety
3. Add unit tests (Jest/Vitest)
4. Implement state management (Redux/Zustand)
5. Extract CSS to separate file with PostCSS
6. Add CI/CD pipeline for automated testing

---

## Useful Resources

- **GitHub Repository**: https://github.com/Sampi314/Web-Game
- **Live Demo**: https://sampi314.github.io/Web-Game/card-flip-game-with-leaderboard.html
- **Web Audio API**: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- **LocalStorage**: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **CSS Grid**: https://css-tricks.com/snippets/css/complete-guide-grid/

---

## Version History

- **Current Version**: Latest (see git commits)
- **Line Count**: ~3,605 lines
- **Size**: ~100KB (uncompressed)

---

## Contact & Contribution

For bugs, features, or questions:
1. Open an issue on GitHub
2. Submit a pull request with clear description
3. Follow existing code style and conventions

---

**Last Updated**: 2025-11-17
**Maintained By**: AI assistants working with repository owner
