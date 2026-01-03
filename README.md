# WikiGuess

A daily Wikipedia guessing game. Guess the article from its table of contents sections, revealed one at a time.

## How to Play

- Each day features a new Wikipedia article
- Sections from the table of contents are revealed progressively
- Make a guess after each reveal
- Try to guess with as few sections revealed as possible
- Share your results with friends

## Deploying to GitHub Pages

### 1. Create a GitHub Repository

```bash
cd /Users/dolandworak/Desktop/git/wiki
git init
git add .
git commit -m "Initial commit: WikiGuess game"
```

### 2. Create a new repository on GitHub

- Go to https://github.com/new
- Name it `wikiguess` (or any name you like)
- Don't initialize with README (you already have one)
- Create repository

### 3. Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/wikiguess.git
git branch -M main
git push -u origin main
```

### 4. Enable GitHub Pages

- Go to your repository on GitHub
- Click **Settings** → **Pages** (in the sidebar)
- Under "Source", select **main** branch
- Click **Save**
- Your site will be live at: `https://YOUR_USERNAME.github.io/wikiguess/`

Wait a few minutes for deployment to complete, then visit your URL!

## Adding New Articles

### Option 1: Use the Scraper (Recommended)

The scraper automatically extracts the table of contents from Wikipedia:

```bash
node scraper.js "Article Name" "2026-01-10"
```

Example:
```bash
node scraper.js "Albert Einstein" "2026-01-06"
```

This will output formatted JSON that you can copy directly into `articles.js`.

### Option 2: Manual Entry

Edit `articles.js` and add a new article object:

```javascript
{
  date: "2026-01-06",
  answer: "Article Name",
  sections: [
    "Section 1",
    "Section 2",
    "Section 2 → Subsection A",
    "Section 2 → Subsection B",
    "Section 3"
  ]
}
```

**Important:** Use the `→` character for nested sections (not hyphen or arrow).

### Deploying Updates

After adding articles:

```bash
git add articles.js
git commit -m "Add new articles"
git push
```

GitHub Pages will automatically redeploy (takes 1-2 minutes).

## Project Structure

```
wiki/
├── index.html          # Main game page
├── style.css           # Early web aesthetic styling
├── game.js             # Game logic
├── articles.js         # Article database
├── scraper.js          # Wikipedia TOC scraper utility
└── README.md           # This file
```

## Tips for Article Selection

- Choose recognizable topics (famous people, historical events, popular concepts)
- Aim for 10-20 sections for good gameplay
- Mix difficulty levels
- Avoid articles with too few or too many sections
- Test the article yourself before scheduling

## Browser Compatibility

Works in all modern browsers. Requires JavaScript enabled.

## License

Free to use and modify.
