/**
 * Articles database
 *
 * Add new articles to article-queue.txt and run:
 * node batch-processor.js
 */

const ARTICLES = [
  {
    date: "2026-01-04",
    answer: "Mao Zedong",
    sections: [
      "English romanisation of name",
      "Early life",
      "Early revolutionary activity",
      "Civil War",
      "Civil War → Nanchang and Autumn Harvest Uprisings: 1927",
      "World War II",
      "Leadership of China",
      "Leadership of China → Korean War",
      "Leadership of China → Social reform",
      "Leadership of China → Three-anti and Five-anti Campaigns",
      "Leadership of China → Five-year plans",
      "Leadership of China → Military projects",
      "Leadership of China → Great Leap Forward",
      "Leadership of China → Split from Soviet Union",
      "Leadership of China → Third Front",
      "Leadership of China → Cultural Revolution",
      "State visits",
      "Death and aftermath",
      "Legacy",
      "Legacy → Assessment in China",
      "Legacy → Assessment in Western world",
      "Legacy → Third World",
      "Legacy → Military strategy",
      "Legacy → Literature",
      "Legacy → Public image",
      "Personal life and family",
      "Personal life and family → Family",
      "Writings and calligraphy",
      "Writings and calligraphy → Literary works",
      "Portrayal in media",
      "Portrayal in media → General",
      "Portrayal in media → Commentary"
    ]
  }
];

// You can optionally encode the articles array to prevent casual spoilers
// Uncomment below to use encoded version:
/*
const ARTICLES_ENCODED = btoa(JSON.stringify(ARTICLES));
const ARTICLES = JSON.parse(atob(ARTICLES_ENCODED));
*/
