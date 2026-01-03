/**
 * Articles database
 *
 * Add new articles to article-queue.txt and run:
 * node batch-processor.js
 */

const ARTICLES = [
  {
    date: "2026-01-03",
    answer: "Queen (band)",
    sections: [
      "History",
      "Music style and influences",
      "Media",
      "Media → Logo",
      "Media → Music videos",
      "Media → Musical theatre",
      "Media → Software and digital releases",
      "Media → Other films",
      "Media → Television",
      "Legacy",
      "Legacy → Influence",
      "Band members",
      "Band members → Current members",
      "Band members → Former members",
      "Band members → Current touring members",
      "Band members → Former touring members",
      "Band members → Early members",
      "Band members → Timeline",
      "Awards and nominations",
      "Discography",
      "Concert tours",
    ],
  },
];

// You can optionally encode the articles array to prevent casual spoilers
// Uncomment below to use encoded version:
/*
const ARTICLES_ENCODED = btoa(JSON.stringify(ARTICLES));
const ARTICLES = JSON.parse(atob(ARTICLES_ENCODED));
*/
