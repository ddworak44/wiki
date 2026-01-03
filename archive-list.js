// Generate archive list on page load
document.addEventListener('DOMContentLoaded', () => {
  generateArchiveList();
});

function generateArchiveList() {
  const archiveList = document.getElementById('archive-list');

  if (!ARTICLES || ARTICLES.length === 0) {
    archiveList.innerHTML = '<p>No puzzles available yet.</p>';
    return;
  }

  // Sort articles by date (oldest first)
  const sortedArticles = [...ARTICLES].sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  const listHTML = sortedArticles.map((article, index) => {
    const puzzleNum = index + 1;
    const formattedDate = formatDate(article.date);

    return `
      <div class="archive-item">
        <a href="index.html?date=${article.date}">
          <span class="archive-puzzle-num">Puzzle #${puzzleNum}</span>
          <span class="archive-date">${formattedDate}</span>
          <span class="archive-answer">${article.answer}</span>
        </a>
      </div>
    `;
  }).join('');

  archiveList.innerHTML = listHTML;
}

function formatDate(dateString) {
  const date = new Date(dateString + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });
}
