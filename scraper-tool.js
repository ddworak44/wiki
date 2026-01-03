// Scraper Tool JavaScript

const urlInput = document.getElementById('url-input');
const scrapeButton = document.getElementById('scrape-button');
const loading = document.getElementById('loading');
const errorOutput = document.getElementById('error-output');
const outputSection = document.getElementById('output');
const metadataDiv = document.getElementById('metadata');
const sectionsList = document.getElementById('sections-list');
const sectionCount = document.getElementById('section-count');
const codeOutput = document.getElementById('code-output');
const copyButton = document.getElementById('copy-button');

let currentArticleData = null;

scrapeButton.addEventListener('click', handleScrape);
urlInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    handleScrape();
  }
});

copyButton.addEventListener('click', () => {
  const code = codeOutput.textContent;
  navigator.clipboard.writeText(code).then(() => {
    const originalText = copyButton.textContent;
    copyButton.textContent = '✓ Copied!';
    setTimeout(() => {
      copyButton.textContent = originalText;
    }, 2000);
  });
});

async function handleScrape() {
  const url = urlInput.value.trim();

  if (!url) {
    showError('Please enter a Wikipedia URL');
    return;
  }

  // Parse the article name from URL
  const articleName = parseWikipediaUrl(url);
  if (!articleName) {
    showError('Invalid Wikipedia URL. Expected format: https://en.wikipedia.org/wiki/Article_Name');
    return;
  }

  // Show loading, hide previous results
  loading.style.display = 'block';
  outputSection.classList.remove('visible');
  errorOutput.innerHTML = '';
  scrapeButton.disabled = true;

  try {
    const articleData = await scrapeWikipediaArticle(articleName);
    displayResults(articleData);
    showSuccess('✓ Article scraped successfully!');
  } catch (error) {
    showError(`Error: ${error.message}`);
  } finally {
    loading.style.display = 'none';
    scrapeButton.disabled = false;
  }
}

function parseWikipediaUrl(url) {
  // Handle both full URLs and article names
  if (url.startsWith('http://') || url.startsWith('https://')) {
    const match = url.match(/\/wiki\/([^?#]+)/);
    if (match) {
      return decodeURIComponent(match[1]);
    }
    return null;
  }
  // If not a URL, treat as article name
  return url;
}

async function scrapeWikipediaArticle(articleName) {
  const urlName = articleName.replace(/ /g, '_');

  // Step 1: Get article metadata (title, thumbnail, extract)
  const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(urlName)}`;
  const summaryResponse = await fetch(summaryUrl);

  if (!summaryResponse.ok) {
    throw new Error(`Failed to fetch article summary (${summaryResponse.status})`);
  }

  const summaryData = await summaryResponse.json();

  // Step 2: Get article HTML to extract sections
  const htmlUrl = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(urlName)}`;
  const htmlResponse = await fetch(htmlUrl);

  if (!htmlResponse.ok) {
    throw new Error(`Failed to fetch article HTML (${htmlResponse.status})`);
  }

  const htmlText = await htmlResponse.text();

  // Extract sections from HTML
  const sections = extractSections(htmlText);

  return {
    answer: summaryData.title,
    thumbnail: summaryData.thumbnail?.source || null,
    extract: summaryData.extract || null,
    sections: sections
  };
}

function extractSections(html) {
  const sections = [];

  // Match h2 and h3 headings
  const h2Regex = /<h2[^>]*id="([^"]+)"[^>]*>([^<]+)</g;
  const h3Regex = /<h3[^>]*id="([^"]+)"[^>]*>([^<]+)</g;

  const headings = [];
  let match;

  while ((match = h2Regex.exec(html)) !== null) {
    const title = cleanTitle(match[2]);
    if (shouldIncludeSection(title)) {
      headings.push({ level: 2, title, position: match.index });
    }
  }

  while ((match = h3Regex.exec(html)) !== null) {
    const title = cleanTitle(match[2]);
    if (shouldIncludeSection(title)) {
      headings.push({ level: 3, title, position: match.index });
    }
  }

  // Sort by position
  headings.sort((a, b) => a.position - b.position);

  // Build hierarchical structure
  let currentH2 = null;

  for (const heading of headings) {
    if (heading.level === 2) {
      sections.push(heading.title);
      currentH2 = heading.title;
    } else if (heading.level === 3 && currentH2) {
      sections.push(`${currentH2} → ${heading.title}`);
    }
  }

  return sections;
}

function cleanTitle(title) {
  return title
    .replace(/\[edit\]/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

function shouldIncludeSection(title) {
  const excludeList = [
    'See also',
    'References',
    'External links',
    'Further reading',
    'Notes',
    'Bibliography',
    'Sources',
  ];
  return !excludeList.includes(title);
}

function displayResults(articleData) {
  currentArticleData = articleData;

  // Display metadata
  let metadataHTML = `<h3>${articleData.answer}</h3>`;

  if (articleData.thumbnail) {
    metadataHTML += `<img src="${articleData.thumbnail}" alt="${articleData.answer}">`;
  }

  if (articleData.extract) {
    metadataHTML += `<p><strong>Description:</strong> ${articleData.extract}</p>`;
  }

  metadataDiv.innerHTML = metadataHTML;

  // Display sections
  sectionCount.textContent = articleData.sections.length;
  sectionsList.innerHTML = '';

  articleData.sections.forEach((section) => {
    const li = document.createElement('li');
    li.textContent = section;
    if (section.includes('→')) {
      li.classList.add('nested');
    }
    sectionsList.appendChild(li);
  });

  // Generate code output
  const code = generateCodeOutput(articleData);
  codeOutput.textContent = code;

  // Show output
  outputSection.classList.add('visible');
}

function generateCodeOutput(articleData) {
  let code = '  {\n';
  code += `    date: "YYYY-MM-DD",  // Set the date\n`;
  code += `    answer: "${articleData.answer}",\n`;

  if (articleData.thumbnail) {
    code += `    thumbnail: "${articleData.thumbnail}",\n`;
  }

  if (articleData.extract) {
    const escapedExtract = articleData.extract.replace(/"/g, '\\"');
    code += `    extract: "${escapedExtract}",\n`;
  }

  code += `    sections: [\n`;
  articleData.sections.forEach((section, index) => {
    const comma = index < articleData.sections.length - 1 ? ',' : '';
    const escapedSection = section.replace(/"/g, '\\"');
    code += `      "${escapedSection}"${comma}\n`;
  });
  code += `    ]\n`;
  code += `  },\n`;

  return code;
}

function showError(message) {
  errorOutput.innerHTML = `<div class="error-message">${message}</div>`;
}

function showSuccess(message) {
  errorOutput.innerHTML = `<div class="success-message">${message}</div>`;
}
