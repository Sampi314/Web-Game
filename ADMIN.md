# Admin Panel Guide

Secure admin panel for managing leaderboard data across all games.

## 🔐 Access

Open the admin panel at:
```
https://your-site.com/admin.html
```

**Default Password:** `admin123`

⚠️ **IMPORTANT:** Change the default password immediately!

## 🔑 Changing the Admin Password

### Method 1: Edit the HTML file

1. Open `admin.html` in a text editor
2. Find this line (around line 347):
   ```javascript
   const ADMIN_PASSWORD = 'admin123'; // TODO: Change this password!
   ```
3. Change `'admin123'` to your secure password:
   ```javascript
   const ADMIN_PASSWORD = 'your-secure-password-here';
   ```
4. Save the file

### Method 2: Use a stronger authentication system (Advanced)

For production sites, consider implementing:
- Hash-based password storage
- Server-side authentication
- JWT tokens
- Multi-factor authentication

## 📊 Features

### Dashboard Statistics

The admin panel displays:
- **Total Scores**: All scores across all games
- **Active Games**: Games with recorded scores
- **Oldest Record**: Date of the oldest score
- **Latest Record**: Date of the most recent score

### Global Actions

#### 💾 Download Backup
- Downloads all leaderboard data as a JSON file
- Filename: `leaderboard-backup-YYYY-MM-DD.json`
- Contains all scores from all games
- Safe to download regularly

#### 📥 Restore Backup
- Restores leaderboard data from a backup file
- Accepts JSON files created by the backup feature
- Overwrites existing data
- Works with both full and single-game backups

#### 🗑️ Clear All Leaderboards
- **WARNING:** Permanently deletes ALL scores from ALL games
- Requires confirmation
- Cannot be undone (unless you have a backup)
- Use with extreme caution!

### Individual Game Management

For each game, you can:

#### 👁️ View
- Opens the leaderboard in a new tab
- Shows all scores for that specific game
- Read-only view

#### 💾 Backup
- Downloads scores for just that game
- Filename: `{game}-backup-YYYY-MM-DD.json`
- Useful for selective restores

#### 🗑️ Clear
- Deletes all scores for that specific game only
- Requires confirmation
- Cannot be undone (unless you have a backup)
- Other games remain unaffected

## 🎮 Supported Games

The admin panel manages these games:

- 🐍 **Snake Battle** (`snakeBattleScores`)
- 🌀 **Gravity Switch** (`flappyBirdScores`)
- 🎴 **Card Flip Memory** (`cardFlipScores`)
- ⚫ **Gomoku** (`gomokuScores`)
- 🔴 **4 in a Row** (`fourInRowScores`)
- 🔤 **Word Chain** (`wordChainScores`)
- 💣 **Minesweeper** (`minesweeperScores`)

## 💡 Best Practices

### Regular Backups

1. **Weekly Backups**: Download backups regularly
2. **Before Clearing**: Always backup before deleting data
3. **Version Control**: Keep multiple backup versions
4. **Off-site Storage**: Store backups in a safe location

### Data Management

1. **Review First**: Check leaderboards before clearing
2. **Partial Clears**: Clear individual games instead of all data when possible
3. **Test Restores**: Verify backups work by testing restores
4. **Monitor Stats**: Keep an eye on the statistics

### Security

1. **Change Default Password**: Use a strong, unique password
2. **Keep URL Private**: Don't share the admin URL publicly
3. **Log Out**: Always log out when done
4. **HTTPS Only**: Use HTTPS in production
5. **Limit Access**: Only give access to trusted admins

## 🔧 Backup File Format

### Full Backup
```json
{
  "version": "1.0",
  "timestamp": "2025-11-18T12:00:00.000Z",
  "data": {
    "snakeBattleScores": [...],
    "cardFlipScores": [...],
    "gomokuScores": [...],
    ...
  }
}
```

### Single Game Backup
```json
{
  "version": "1.0",
  "timestamp": "2025-11-18T12:00:00.000Z",
  "game": "wordChain",
  "data": [...]
}
```

## 🚨 Troubleshooting

### Can't Login

- **Wrong password**: Check that you're using the correct password
- **Password changed**: Verify the password in `admin.html`
- **Browser cache**: Try clearing browser cache
- **Check console**: Open browser developer tools for errors

### Backup/Restore Issues

- **File format error**: Ensure the file is a valid JSON backup
- **Old format**: Backups from different versions may not work
- **Browser compatibility**: Try a different browser
- **File size**: Very large backups may have issues

### Data Not Clearing

- **Browser cache**: Try clearing browser cache and reloading
- **Multiple tabs**: Close other tabs with the admin panel
- **LocalStorage**: Check browser's localStorage in developer tools
- **Permissions**: Ensure browser allows localStorage

## 📱 Mobile Access

The admin panel works on mobile devices:
- Responsive design
- Touch-friendly buttons
- Works on tablets and phones
- Same features as desktop

## ⚠️ Important Notes

1. **No Undo**: Deleted data cannot be recovered without a backup
2. **Client-Side Only**: All data is stored in browser localStorage
3. **Per-Browser**: Data is specific to each browser/device
4. **Not Synced**: Clearing data on one device doesn't affect others
5. **Session Based**: Login persists for the browser session only

## 🔒 Security Considerations

### For Production Sites

The current implementation is basic. For production:

1. **Move Authentication Server-Side**
   - Don't store passwords in client-side code
   - Use proper authentication APIs
   - Implement session management

2. **Add Rate Limiting**
   - Prevent brute force attacks
   - Limit login attempts
   - Add CAPTCHA if needed

3. **Use HTTPS**
   - Encrypt all traffic
   - Protect passwords in transit
   - Use secure cookies

4. **Audit Logging**
   - Track who clears data
   - Log all admin actions
   - Monitor for suspicious activity

5. **IP Restrictions**
   - Limit access by IP address
   - Use VPN or firewall rules
   - Whitelist admin IPs only

## 🆘 Support

If you encounter issues:

1. Check browser console for errors
2. Verify localStorage is enabled
3. Try a different browser
4. Clear browser cache
5. Check the backup file format

## 📄 License

Same as the main project (MIT)

---

**Remember**: Always backup before clearing data! 💾
