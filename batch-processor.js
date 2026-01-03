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

const fs = require("fs");
const https = require("https");
const path = require("path");

// Import scraping functions from scraper.js
function stripHtmlTags(html) {
  // Remove all HTML tags
  return html.replace(/<[^>]*>/g, '');
}

function extractSections(html, articleName) {
  const sections = [];
  const headings = [];

  // Extract all heading levels (H2 through H6)
  for (let level = 2; level <= 6; level++) {
    const regex = new RegExp(`<h${level}[^>]*>(.*?)</h${level}>`, 'gs');
    let match;

    while ((match = regex.exec(html)) !== null) {
      const rawTitle = match[1];
      const title = cleanTitle(stripHtmlTags(rawTitle));
      if (shouldIncludeSection(title)) {
        headings.push({ level, title, position: match.index });
      }
    }
  }

  // Sort by position in document
  headings.sort((a, b) => a.position - b.position);

  // Build hierarchical structure with dynamic depth
  const hierarchy = {}; // Track current parent at each level

  for (const heading of headings) {
    const level = heading.level;

    // Update hierarchy at current level
    hierarchy[level] = heading.title;

    // Clear deeper levels
    for (let i = level + 1; i <= 6; i++) {
      delete hierarchy[i];
    }

    // Build path from all parent levels
    const path = [];
    for (let i = 2; i <= level; i++) {
      if (hierarchy[i]) {
        path.push(hierarchy[i]);
      }
    }

    // Join with arrows
    sections.push(path.join(' → '));
  }

  return sections;
}

function cleanTitle(title) {
  return title
    .replace(/\[edit\]/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function shouldIncludeSection(title) {
  const excludeList = [
    "See also",
    "References",
    "External links",
    "Further reading",
    "Notes",
    "Bibliography",
    "Sources",
  ];
  return !excludeList.includes(title);
}

function parseWikipediaInput(input) {
  // Check if input is a URL
  if (input.startsWith("http://") || input.startsWith("https://")) {
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
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
      urlName
    )}`;

    const options = {
      headers: {
        "User-Agent":
          "WikiGuess/1.0 (Educational project; Node.js batch processor)",
      },
    };

    https
      .get(url, options, (res) => {
        console.log(`\n  [Summary API] Status: ${res.statusCode}`);
        console.log(
          `  [Summary API] Last-Modified: ${res.headers["last-modified"] || "N/A"}`
        );
        console.log(`  [Summary API] ETag: ${res.headers["etag"] || "N/A"}`);

        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const json = JSON.parse(data);
            console.log(
              `  [Summary API] Full Response:\n${JSON.stringify(json, null, 2)}`
            );
            if (json.title) {
              resolve({
                title: json.title,
                thumbnail: json.thumbnail?.source || null,
                extract: json.extract || null
              });
            } else {
              reject(new Error("No title found in response"));
            }
          } catch (error) {
            reject(error);
          }
        });
      })
      .on("error", reject);
  });
}

function scrapeWikipediaPromise(input) {
  return new Promise(async (resolve, reject) => {
    try {
      const urlName = parseWikipediaInput(input);

      console.log(`  Fetching: ${urlName}...`);

      // First get the proper article title and metadata
      const articleMetadata = await getArticleTitlePromise(urlName);
      const articleTitle = articleMetadata.title;

      // Then fetch the HTML content
      const url = `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(
        urlName
      )}`;

      const options = {
        headers: {
          "User-Agent":
            "WikiGuess/1.0 (Educational project; Node.js batch processor)",
        },
      };

      https
        .get(url, options, (res) => {
          console.log(`\n  [HTML API] Status: ${res.statusCode}`);
          console.log(
            `  [HTML API] Last-Modified: ${res.headers["last-modified"] || "N/A"}`
          );
          console.log(`  [HTML API] ETag: ${res.headers["etag"] || "N/A"}`);
          console.log(
            `  [HTML API] Content-Type: ${res.headers["content-type"] || "N/A"}`
          );

          let data = "";
          res.on("data", (chunk) => {
            data += chunk;
          });
          res.on("end", () => {
            try {
              console.log(
                `\n  [HTML API] Response length: ${data.length} chars`
              );
              console.log(
                `  [HTML API] First 1000 chars:\n${data.substring(0, 1000)}`
              );
              console.log(
                `  [HTML API] Last 500 chars:\n${data.substring(data.length - 500)}`
              );

              const sections = extractSections(data, articleTitle);
              console.log(`\n  [Extracted] Total sections: ${sections.length}`);
              sections.forEach((section, i) => {
                console.log(`    ${i + 1}. ${section}`);
              });

              if (sections.length === 0) {
                reject(new Error(`No sections found for "${articleTitle}"`));
              } else {
                console.log(
                  `\n  ✓ "${articleTitle}" - ${sections.length} sections`
                );
                resolve({
                  answer: articleTitle,
                  sections,
                  thumbnail: articleMetadata.thumbnail,
                  extract: articleMetadata.extract
                });
              }
            } catch (error) {
              reject(error);
            }
          });
        })
        .on("error", reject);
    } catch (error) {
      reject(error);
    }
  });
}

function getNextDate(lastDate) {
  const date = lastDate ? new Date(lastDate + 'T00:00:00Z') : new Date();
  date.setUTCDate(date.getUTCDate() + 1);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function readArticleQueue() {
  const queuePath = path.join(__dirname, "article-queue.txt");
  const content = fs.readFileSync(queuePath, "utf8");
  // Accepts both Wikipedia URLs and article names
  return content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
}

function readExistingArticles() {
  const articlesPath = path.join(__dirname, "articles.js");
  try {
    const content = fs.readFileSync(articlesPath, "utf8");
    // Extract the ARTICLES array using regex
    const match = content.match(/const ARTICLES = (\[[\s\S]*?\]);/);
    if (match) {
      // Use eval in a controlled context (only for this specific case)
      const articles = eval(match[1]);
      return articles;
    }
  } catch (error) {
    console.log("No existing articles found, starting fresh");
  }
  return [];
}

function writeArticlesFile(articles) {
  const articlesPath = path.join(__dirname, "articles.js");

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
    if (article.thumbnail) {
      content += `    thumbnail: "${article.thumbnail}",\n`;
    }
    if (article.extract) {
      // Escape quotes and newlines in extract
      const escapedExtract = article.extract.replace(/"/g, '\\"').replace(/\n/g, ' ');
      content += `    extract: "${escapedExtract}",\n`;
    }
    content += `    sections: [\n`;
    article.sections.forEach((section, sIndex) => {
      const comma = sIndex < article.sections.length - 1 ? "," : "";
      // Escape quotes in section names
      const escapedSection = section.replace(/"/g, '\\"');
      content += `      "${escapedSection}"${comma}\n`;
    });
    content += `    ]\n`;
    content += `  }${index < articles.length - 1 ? "," : ""}\n`;
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
  console.log("WikiGuess Batch Processor\n");
  console.log("Reading article queue...");

  const queuedArticles = readArticleQueue();
  if (queuedArticles.length === 0) {
    console.log("No articles found in article-queue.txt");
    console.log("Add article names (one per line) and try again.");
    process.exit(0);
  }

  console.log(`Found ${queuedArticles.length} articles in queue\n`);

  const existingArticles = readExistingArticles();
  const lastDate =
    existingArticles.length > 0
      ? existingArticles[existingArticles.length - 1].date
      : null;

  console.log("Scraping articles...\n");

  const newArticles = [];
  let currentDate = lastDate;

  for (const articleName of queuedArticles) {
    try {
      const articleData = await scrapeWikipediaPromise(articleName);
      currentDate = getNextDate(currentDate);
      newArticles.push({
        date: currentDate,
        answer: articleData.answer,
        sections: articleData.sections,
        thumbnail: articleData.thumbnail,
        extract: articleData.extract
      });

      // Add small delay to be nice to Wikipedia's servers
      await new Promise((resolve) => setTimeout(resolve, 500));
    } catch (error) {
      console.error(`  ✗ Error scraping "${articleName}": ${error.message}`);
      console.log(`  Skipping "${articleName}"...\n`);
    }
  }

  if (newArticles.length === 0) {
    console.log("\nNo articles were successfully scraped.");
    process.exit(1);
  }

  console.log(`\n✓ Successfully scraped ${newArticles.length} articles`);
  console.log("Writing to articles.js...");

  const allArticles = [...existingArticles, ...newArticles];
  writeArticlesFile(allArticles);

  console.log("✓ Done!\n");
  console.log(
    `Date range: ${allArticles[0].date} to ${
      allArticles[allArticles.length - 1].date
    }`
  );
  console.log(`Total articles: ${allArticles.length}`);
  console.log("\nNext steps:");
  console.log("1. Review articles.js to verify the articles");
  console.log("2. Clear article-queue.txt or add more articles");
  console.log("3. Commit and push to deploy");
}

// Run the processor
processQueue().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});
