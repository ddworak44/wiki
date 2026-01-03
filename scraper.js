#!/usr/bin/env node

/**
 * Wikipedia TOC Scraper
 *
 * Usage: node scraper.js "Article Name" [date]
 * Example: node scraper.js "LeBron James" "2026-01-15"
 *
 * This tool fetches a Wikipedia article and extracts its table of contents,
 * handling nested sections properly.
 */

const https = require('https');

function scrapeWikipedia(articleName, date) {
    // Convert article name to Wikipedia URL format
    const urlName = articleName.replace(/ /g, '_');
    const url = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(urlName)}`;

    console.log(`Fetching: ${url}\n`);

    https.get(url, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                const sections = extractSections(data, articleName);

                if (sections.length === 0) {
                    console.error('No sections found. The article might not exist or has no TOC.');
                    process.exit(1);
                }

                outputArticleData(articleName, sections, date);
            } catch (error) {
                console.error('Error parsing data:', error.message);
                process.exit(1);
            }
        });
    }).on('error', (err) => {
        console.error('Error fetching Wikipedia:', err.message);
        process.exit(1);
    });
}

function extractSections(html, articleName) {
    const sections = [];

    // Match h2 and h3 headings (main sections and subsections)
    // Updated regex to match current Wikipedia HTML structure
    const h2Regex = /<h2[^>]*id="([^"]+)"[^>]*>([^<]+)</g;
    const h3Regex = /<h3[^>]*id="([^"]+)"[^>]*>([^<]+)</g;

    // Extract all headings with their positions
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

    // Sort by position in document
    headings.sort((a, b) => a.position - b.position);

    // Build hierarchical structure
    let currentH2 = null;

    for (const heading of headings) {
        if (heading.level === 2) {
            sections.push(heading.title);
            currentH2 = heading.title;
        } else if (heading.level === 3 && currentH2) {
            // Nested section
            sections.push(`${currentH2} → ${heading.title}`);
        }
    }

    return sections;
}

function cleanTitle(title) {
    // Remove [edit] links and clean up
    return title
        .replace(/\[edit\]/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .trim();
}

function shouldIncludeSection(title) {
    // Filter out common non-content sections
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

function outputArticleData(articleName, sections, date) {
    // Use provided date or default to tomorrow
    const dateStr = date || getTomorrowDate();

    const articleData = {
        date: dateStr,
        answer: articleName,
        sections: sections
    };

    console.log('Copy this into your articles.js file:\n');
    console.log('  {');
    console.log(`    date: "${articleData.date}",`);
    console.log(`    answer: "${articleData.answer}",`);
    console.log('    sections: [');
    articleData.sections.forEach((section, index) => {
        const comma = index < articleData.sections.length - 1 ? ',' : '';
        console.log(`      "${section}"${comma}`);
    });
    console.log('    ]');
    console.log('  },');
    console.log('');
    console.log(`Total sections: ${sections.length}`);
}

function getTomorrowDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 1) {
    console.log('Usage: node scraper.js "Article Name" [date]');
    console.log('Example: node scraper.js "LeBron James" "2026-01-15"');
    console.log('');
    console.log('If date is not provided, tomorrow\'s date will be used.');
    process.exit(1);
}

const articleName = args[0];
const date = args[1];

scrapeWikipedia(articleName, date);
