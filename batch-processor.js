#!/usr/bin/env node

/**
 * Batch Article Processor
 *
 * Reads article-queue.txt and automatically:
 * - Scrapes each Wikipedia article
 * - Assigns sequential dates
 * - Updates articles.js
 *
 * Usage: node batch-processor.js
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// Import scraping functions from scraper.js
function extractSections(html, articleName) {
    const sections = [];
    // Updated regex to match current Wikipedia HTML structure
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

    headings.sort((a, b) => a.position - b.position);
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
        'Sources'
    ];
    return !excludeList.includes(title);
}

function parseWikipediaInput(input) {
    // Check if input is a URL
    if (input.startsWith('http://') || input.startsWith('https://')) {
        // Extract article name from URL
        // e.g., https://en.wikipedia.org/wiki/Queen_(band) -> Queen_(band)
        const match = input.match(/\/wiki\/([^?#]+)/);
        if (match) {
            return decodeURIComponent(match[1]);
        }
    }
    // Otherwise, treat as article name
    return input;
}

function getArticleTitlePromise(urlName) {
    return new Promise((resolve, reject) => {
        const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(urlName)}`;

        const options = {
            headers: {
                'User-Agent': 'WikiGuess/1.0 (Educational project; Node.js batch processor)'
            }
        };

        https.get(url, options, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                try {
                    const json = JSON.parse(data);
                    if (json.title) {
                        resolve(json.title);
                    } else {
                        reject(new Error('No title found in response'));
                    }
                } catch (error) {
                    reject(error);
                }
            });
        }).on('error', reject);
    });
}

function scrapeWikipediaPromise(input) {
    return new Promise(async (resolve, reject) => {
        try {
            const urlName = parseWikipediaInput(input);

            console.log(`  Fetching: ${urlName}...`);

            // First get the proper article title
            const articleTitle = await getArticleTitlePromise(urlName);

            // Then fetch the HTML content
            const url = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(urlName)}`;

            const options = {
                headers: {
                    'User-Agent': 'WikiGuess/1.0 (Educational project; Node.js batch processor)'
                }
            };

            https.get(url, options, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    try {
                        const sections = extractSections(data, articleTitle);
                        if (sections.length === 0) {
                            reject(new Error(`No sections found for "${articleTitle}"`));
                        } else {
                            console.log(`  ✓ "${articleTitle}" - ${sections.length} sections`);
                            resolve({ answer: articleTitle, sections });
                        }
                    } catch (error) {
                        reject(error);
                    }
                });
            }).on('error', reject);
        } catch (error) {
            reject(error);
        }
    });
}

function getNextDate(lastDate) {
    let date;
    if (lastDate) {
        // Parse date string more reliably to avoid timezone issues
        const [year, month, day] = lastDate.split('-').map(Number);
        date = new Date(year, month - 1, day);
    } else {
        date = new Date();
    }
    date.setDate(date.getDate() + 1);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function readArticleQueue() {
    const queuePath = path.join(__dirname, 'article-queue.txt');
    const content = fs.readFileSync(queuePath, 'utf8');
    // Accepts both Wikipedia URLs and article names
    return content
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('#'));
}

function readExistingArticles() {
    const articlesPath = path.join(__dirname, 'articles.js');
    try {
        const content = fs.readFileSync(articlesPath, 'utf8');
        // Extract the ARTICLES array using regex
        const match = content.match(/const ARTICLES = (\[[\s\S]*?\]);/);
        if (match) {
            // Use eval in a controlled context (only for this specific case)
            const articles = eval(match[1]);
            return articles;
        }
    } catch (error) {
        console.log('No existing articles found, starting fresh');
    }
    return [];
}

function writeArticlesFile(articles) {
    const articlesPath = path.join(__dirname, 'articles.js');

    let content = `/**
 * Articles database
 *
 * Add new articles to article-queue.txt and run:
 * node batch-processor.js
 */

const ARTICLES = [\n`;

    articles.forEach((article, index) => {
        content += `  {\n`;
        content += `    date: "${article.date}",\n`;
        content += `    answer: "${article.answer}",\n`;
        content += `    sections: [\n`;
        article.sections.forEach((section, sIndex) => {
            const comma = sIndex < article.sections.length - 1 ? ',' : '';
            // Escape quotes in section names
            const escapedSection = section.replace(/"/g, '\\"');
            content += `      "${escapedSection}"${comma}\n`;
        });
        content += `    ]\n`;
        content += `  }${index < articles.length - 1 ? ',' : ''}\n`;
    });

    content += `];\n\n`;
    content += `// You can optionally encode the articles array to prevent casual spoilers\n`;
    content += `// Uncomment below to use encoded version:\n`;
    content += `/*\n`;
    content += `const ARTICLES_ENCODED = btoa(JSON.stringify(ARTICLES));\n`;
    content += `const ARTICLES = JSON.parse(atob(ARTICLES_ENCODED));\n`;
    content += `*/\n`;

    fs.writeFileSync(articlesPath, content);
}

async function processQueue() {
    console.log('WikiGuess Batch Processor\n');
    console.log('Reading article queue...');

    const queuedArticles = readArticleQueue();
    if (queuedArticles.length === 0) {
        console.log('No articles found in article-queue.txt');
        console.log('Add article names (one per line) and try again.');
        process.exit(0);
    }

    console.log(`Found ${queuedArticles.length} articles in queue\n`);

    const existingArticles = readExistingArticles();
    const lastDate = existingArticles.length > 0
        ? existingArticles[existingArticles.length - 1].date
        : null;

    console.log('Scraping articles...\n');

    const newArticles = [];
    let currentDate = lastDate;

    for (const articleName of queuedArticles) {
        try {
            const articleData = await scrapeWikipediaPromise(articleName);
            currentDate = getNextDate(currentDate);
            newArticles.push({
                date: currentDate,
                answer: articleData.answer,
                sections: articleData.sections
            });

            // Add small delay to be nice to Wikipedia's servers
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            console.error(`  ✗ Error scraping "${articleName}": ${error.message}`);
            console.log(`  Skipping "${articleName}"...\n`);
        }
    }

    if (newArticles.length === 0) {
        console.log('\nNo articles were successfully scraped.');
        process.exit(1);
    }

    console.log(`\n✓ Successfully scraped ${newArticles.length} articles`);
    console.log('Writing to articles.js...');

    const allArticles = [...existingArticles, ...newArticles];
    writeArticlesFile(allArticles);

    console.log('✓ Done!\n');
    console.log(`Date range: ${allArticles[0].date} to ${allArticles[allArticles.length - 1].date}`);
    console.log(`Total articles: ${allArticles.length}`);
    console.log('\nNext steps:');
    console.log('1. Review articles.js to verify the articles');
    console.log('2. Clear article-queue.txt or add more articles');
    console.log('3. Commit and push to deploy');
}

// Run the processor
processQueue().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
