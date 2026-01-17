# Math Master 🧮 - AI-Powered Math Game for Kids

An exciting, interactive math game for children featuring AI-powered hints and word problems using Google's Gemini API.

## Features

### 🎮 Game Modes
- **Practice Mode**: No timer, unlimited hints - perfect for learning
- **Time Attack**: 60-second challenge to answer as many questions as possible
- **Challenge Mode**: 10 questions with 3 lives
- **Daily Challenge**: Special AI-generated problem sets

### 📊 Difficulty Levels
- **Easy**: Numbers 1-10, Addition & Subtraction
- **Medium**: Numbers 1-50, All basic operations
- **Hard**: Numbers 1-100, Complex operations
- **AI Challenge**: AI-generated word problems with fun themes

### 🤖 AI Features
- **Smart Hints**: Step-by-step explanations in kid-friendly language
- **Word Problems**: Contextual problems about space, animals, sports, and more
- **Adaptive Learning**: Problems adjust to selected difficulty

### 🏆 Achievements & Progress
- **7 Unique Badges**: Unlock achievements for various milestones
- **Leaderboard**: Track top scores across all difficulties
- **Statistics**: View accuracy, streaks, and time played
- **Progress Tracking**: Monitor improvement over time

### 🎨 Visual Design
- Vibrant, colorful interface with smooth animations
- Glassmorphism effects and particle backgrounds
- Animated mascot character that reacts to answers
- Confetti celebrations for correct answers
- Dark mode optimized

## Setup Instructions

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure the Game

Open `script.js` and replace the API key on line 2:

```javascript
GEMINI_API_KEY: 'YOUR_GEMINI_API_KEY_HERE', // Replace with your actual API key
```

Replace `'YOUR_GEMINI_API_KEY_HERE'` with your actual Gemini API key.

### 3. Run the Game

Simply open `index.html` in a modern web browser:

- **Option 1**: Double-click `index.html`
- **Option 2**: Right-click `index.html` → Open with → Your browser
- **Option 3**: Use a local server (recommended for development):
  ```bash
  # Using Python
  python -m http.server 8000
  
  # Using Node.js
  npx http-server
  ```

## How to Play

1. **Enter Your Name**: Type your name and choose an avatar
2. **Select Difficulty**: Choose from Easy, Medium, Hard, or AI Challenge
3. **Pick a Game Mode**: Select your preferred game mode
4. **Solve Problems**: Answer math questions to earn points
5. **Use Hints**: Click the hint button for AI-powered help
6. **Earn Badges**: Unlock achievements by reaching milestones
7. **Track Progress**: View your statistics and leaderboard rankings

## Scoring System

- **Correct Answer**: 10 points
- **Streak Bonus**: +5 points (for consecutive correct answers)
- **Speed Bonus**: +5 points (answer within 5 seconds)
- **No Hint Bonus**: +3 points (solve without using hints)

## Browser Compatibility

Works best on modern browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Technologies Used

- **HTML5**: Semantic structure
- **CSS3**: Advanced animations, gradients, glassmorphism
- **JavaScript (ES6+)**: Game logic and API integration
- **Google Fonts**: Fredoka & Poppins
- **Gemini API**: AI-powered hints and word problems

## File Structure

```
ai-math-master/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling with animations
├── script.js           # Game logic and AI integration
└── README.md           # This file
```

## Features Breakdown

### Start Screen
- Player name input with validation
- 6 fun avatar options
- High scores display
- "How to Play" modal

### Game Screen
- Large, clear problem display
- Number pad for easy input
- Real-time score and streak tracking
- Progress bar
- Lives/hearts display
- Timer (for timed modes)

### AI Integration
- **Hints**: Contextual, step-by-step explanations
- **Word Problems**: Engaging stories with math challenges
- **Kid-Friendly**: Age-appropriate language and examples

### Visual Effects
- Confetti animation for correct answers
- Smooth screen transitions
- Animated mascot reactions
- Particle background effects
- Score pop animations
- Shake effect for wrong answers

### Sound Effects
- Background music (toggleable)
- Correct answer chime
- Wrong answer buzz
- Achievement unlock fanfare
- Countdown beeps

## Customization

### Adjust Difficulty Ranges
Edit the `CONFIG.DIFFICULTIES` object in `script.js`:

```javascript
DIFFICULTIES: {
    easy: { min: 1, max: 10, operations: ['+', '-'] },
    // Modify min/max values as needed
}
```

### Change Point Values
Edit the `CONFIG.POINTS` object in `script.js`:

```javascript
POINTS: {
    correct: 10,
    streakBonus: 5,
    // Adjust point values
}
```

### Add New Badges
Add to the `CONFIG.BADGES` array in `script.js`:

```javascript
{ 
    id: 'custom_badge', 
    name: 'Custom Badge', 
    icon: '🎯', 
    condition: (stats) => stats.totalScore >= 500 
}
```

## Troubleshooting

### API Key Issues
- Ensure your API key is correctly pasted in `script.js`
- Check that you've enabled the Gemini API in Google Cloud Console
- Verify your API key has no extra spaces or quotes

### Hints Not Working
- Check browser console for error messages
- Verify internet connection
- Ensure API key is valid and has quota remaining

### Game Not Loading
- Clear browser cache
- Check browser console for errors
- Ensure all files are in the same directory
- Try using a local server instead of opening directly

## Privacy & Data

- All game data is stored locally in browser localStorage
- No personal data is sent to external servers except AI API calls
- API calls only include math problems and requests for hints
- No tracking or analytics

## Credits

Created with ❤️ for young mathematicians everywhere!

## License

Free to use for educational purposes.

---

**Enjoy playing Math Master! 🧮✨**
