/**
 * Articles database
 *
 * Add new articles here. Use scraper.js to generate article data:
 * node scraper.js "Article Name" "YYYY-MM-DD"
 */

const ARTICLES = [
  {
    date: "2026-01-03",
    answer: "LeBron James",
    sections: [
      "Early life",
      "High school career",
      "High school career → St. Vincent–St. Mary",
      "High school career → USA Basketball",
      "Professional career",
      "Professional career → Cleveland Cavaliers (2003–2010)",
      "Professional career → Miami Heat (2010–2014)",
      "Professional career → Cleveland Cavaliers (2014–2018)",
      "Professional career → Los Angeles Lakers (2018–present)",
      "National team career",
      "Player profile",
      "Legacy",
      "Personal life",
      "Business ventures",
      "Media figure and activism",
      "Endorsements"
    ]
  },
  {
    date: "2026-01-04",
    answer: "World War II",
    sections: [
      "Background",
      "Background → Aftermath of World War I",
      "Background → League of Nations",
      "Chronology",
      "European Theatre",
      "European Theatre → Outbreak of war",
      "European Theatre → Western Europe",
      "European Theatre → Eastern Europe",
      "European Theatre → Mediterranean",
      "Pacific Theatre",
      "Pacific Theatre → Pacific War",
      "Pacific Theatre → Allies gain momentum",
      "Atomic bombings",
      "Aftermath",
      "Impact",
      "Casualties and war crimes",
      "Holocaust",
      "Occupation"
    ]
  },
  {
    date: "2026-01-05",
    answer: "Python (programming language)",
    sections: [
      "History",
      "Design philosophy and features",
      "Syntax and semantics",
      "Syntax and semantics → Indentation",
      "Syntax and semantics → Statements and control flow",
      "Syntax and semantics → Expressions",
      "Syntax and semantics → Methods",
      "Programming examples",
      "Libraries",
      "Development environment",
      "Implementations",
      "Development",
      "Naming",
      "Popularity",
      "Uses"
    ]
  }
];

// You can optionally encode the articles array to prevent casual spoilers
// Uncomment below to use encoded version:
/*
const ARTICLES_ENCODED = btoa(JSON.stringify(ARTICLES));
const ARTICLES = JSON.parse(atob(ARTICLES_ENCODED));
*/
