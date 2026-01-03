// Game state
let currentArticle = null;
let revealedSections = [];
let attempts = 0;
let gameOver = false;

// DOM elements
const sectionsList = document.getElementById('sections-list');
const guessInput = document.getElementById('guess-input');
const submitButton = document.getElementById('submit-guess');
const feedback = document.getElementById('feedback');
const gameOverDiv = document.getElementById('game-over');
const resultMessage = document.getElementById('result-message');
const articleLink = document.getElementById('article-link');
const scoreDisplay = document.getElementById('score-display');
const shareButton = document.getElementById('share-button');
const attemptCount = document.getElementById('attempt-count');
const totalSections = document.getElementById('total-sections');
const countdown = document.getElementById('countdown');

// Initialize game on load
document.addEventListener('DOMContentLoaded', () => {
    initGame();
    setupEventListeners();
    updateCountdown();
    setInterval(updateCountdown, 1000);
});

function initGame() {
    const todayArticle = getTodaysArticle();

    if (!todayArticle) {
        feedback.textContent = 'No article available for today. Check back tomorrow!';
        feedback.className = 'incorrect';
        submitButton.disabled = true;
        return;
    }

    currentArticle = todayArticle;
    totalSections.textContent = currentArticle.sections.length;

    // Check localStorage for saved progress
    const savedState = loadGameState();

    if (savedState && savedState.date === getDateString()) {
        // Resume saved game
        revealedSections = savedState.revealedSections;
        attempts = savedState.attempts;
        gameOver = savedState.gameOver;

        if (gameOver) {
            showGameOver(savedState.won);
        } else {
            renderSections();
        }
    } else {
        // New game - reveal first section
        revealedSections.push(currentArticle.sections[0]);
        renderSections();
        saveGameState();
    }
}

function setupEventListeners() {
    submitButton.addEventListener('click', handleGuess);
    guessInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleGuess();
        }
    });
    shareButton.addEventListener('click', shareResult);
}

function handleGuess() {
    if (gameOver) return;

    const guess = guessInput.value.trim();

    if (!guess) {
        feedback.textContent = 'Please enter a guess.';
        feedback.className = 'incorrect';
        return;
    }

    attempts++;
    attemptCount.textContent = attempts;

    if (checkAnswer(guess, currentArticle.answer)) {
        // Correct!
        feedback.textContent = 'Correct!';
        feedback.className = 'correct';
        gameOver = true;
        saveGameState(true);
        setTimeout(() => showGameOver(true), 500);
    } else {
        // Wrong - reveal next section
        feedback.textContent = 'Incorrect. Revealing next section...';
        feedback.className = 'incorrect';

        if (revealedSections.length < currentArticle.sections.length) {
            revealedSections.push(currentArticle.sections[revealedSections.length]);
            renderSections();
            saveGameState();
        } else {
            // Out of sections
            gameOver = true;
            saveGameState(false);
            setTimeout(() => showGameOver(false), 500);
        }
    }

    guessInput.value = '';
}

function checkAnswer(guess, answer) {
    // Normalize both strings: lowercase, remove extra spaces
    const normalizedGuess = guess.toLowerCase().replace(/\s+/g, ' ').trim();
    const normalizedAnswer = answer.toLowerCase().replace(/\s+/g, ' ').trim();

    // Check if guess matches answer or is contained in answer
    return normalizedAnswer.includes(normalizedGuess) ||
           normalizedGuess.includes(normalizedAnswer);
}

function renderSections() {
    sectionsList.innerHTML = '';

    // Only render revealed sections (not all sections)
    revealedSections.forEach((section, index) => {
        const li = document.createElement('li');
        li.textContent = section;
        li.className = 'revealed';

        // Check if it's a nested section (contains →)
        if (section.includes('→')) {
            li.classList.add('nested');
        }

        sectionsList.appendChild(li);
    });
}

function showGameOver(won) {
    gameOver = true;
    guessInput.disabled = true;
    submitButton.disabled = true;
    feedback.style.display = 'none';
    gameOverDiv.style.display = 'block';

    if (won) {
        resultMessage.textContent = `You got it in ${attempts} ${attempts === 1 ? 'guess' : 'guesses'}!`;
        resultMessage.style.color = '#008000';
    } else {
        resultMessage.textContent = `Better luck tomorrow!`;
        resultMessage.style.color = '#cc0000';
    }

    // Show article link
    const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(currentArticle.answer.replace(/ /g, '_'))}`;
    articleLink.innerHTML = `The answer was: <a href="${wikiUrl}" target="_blank">${currentArticle.answer}</a>`;

    // Generate score visualization
    const score = generateScoreSquares();
    scoreDisplay.textContent = score;
}

function generateScoreSquares() {
    const revealed = revealedSections.length;
    const remaining = currentArticle.sections.length - revealed;

    // Purple for revealed (used), blue for remaining (unused/better score)
    const purpleSquares = '🟪'.repeat(revealed);
    const blueSquares = '🟦'.repeat(remaining);

    return blueSquares + purpleSquares;
}

function shareResult() {
    const revealed = revealedSections.length;
    const total = currentArticle.sections.length;
    const score = generateScoreSquares();

    const text = `WikiGuess ${getDateString()}\n${revealed}/${total} sections\n${score}\n\n${window.location.href}`;

    // Try to use native share API, fallback to clipboard
    if (navigator.share) {
        navigator.share({
            text: text
        }).catch(() => copyToClipboard(text));
    } else {
        copyToClipboard(text);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const originalText = shareButton.textContent;
        shareButton.textContent = 'Copied!';
        setTimeout(() => {
            shareButton.textContent = originalText;
        }, 2000);
    }).catch(() => {
        alert('Unable to copy. Please copy manually:\n\n' + text);
    });
}

// Date and article selection
function getDateString() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getTodaysArticle() {
    const today = getDateString();
    return ARTICLES.find(article => article.date === today);
}

function updateCountdown() {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const diff = tomorrow - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    countdown.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// LocalStorage management
function saveGameState(won = null) {
    const state = {
        date: getDateString(),
        revealedSections: revealedSections,
        attempts: attempts,
        gameOver: gameOver,
        won: won
    };
    localStorage.setItem('wikiguess-state', JSON.stringify(state));
}

function loadGameState() {
    const saved = localStorage.getItem('wikiguess-state');
    return saved ? JSON.parse(saved) : null;
}
