/**
 * Articles database
 *
 * Add new articles to article-queue.txt and run:
 * node batch-processor.js
 */

const ARTICLES = [
  {
    date: "2026-01-04",
    answer: "Volcano",
    sections: [
      "Etymology and terminology",
      "Plate tectonics",
      "Plate tectonics → Divergent plate boundaries",
      "Plate tectonics → Convergent plate boundaries",
      "Plate tectonics → Hotspots",
      "Plate tectonics → Continental rifting",
      "Volcanic features",
      "Volcanic features → Fissure vents",
      "Volcanic features → Shield volcanoes",
      "Volcanic features → Lava domes",
      "Volcanic features → Cryptodomes",
      "Volcanic features → Cinder cones",
      "Volcanic features → Supervolcanoes",
      "Volcanic features → Submarine volcanoes",
      "Volcanic features → Subglacial volcanoes",
      "Volcanic features → Hydrothermal features",
      "Erupted material",
      "Erupted material → Volcanic gases",
      "Erupted material → Lava flows",
      "Erupted material → Tephra",
      "Erupted material → Dissection",
      "Volcanic eruptions",
      "Volcanic activity",
      "Volcanic activity → Erupting",
      "Volcanic activity → Active",
      "Volcanic activity → Dormant and reactivated",
      "Volcanic activity → Extinct",
      "Volcanic activity → Volcanic-alert level",
      "Decade volcanoes",
      "Volcanoes and humans",
      "Volcanoes and humans → Hazards",
      "Volcanoes and humans → Benefits",
      "Volcanoes and humans → Safety considerations",
      "Volcanoes on other celestial bodies",
      "History of volcano understanding"
    ]
  },
  {
    date: "2026-01-04",
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
      "Concert tours"
    ]
  },
  {
    date: "2026-01-04",
    answer: "Apple Inc.",
    sections: [
      "History",
      "Products",
      "Products → Mac",
      "Products → iPhone",
      "Products → iPad",
      "Products → Other products",
      "Products → Services",
      "Marketing",
      "Marketing → Branding",
      "Marketing → Advertising",
      "Marketing → Stores",
      "Marketing → Market power",
      "Marketing → Privacy",
      "Corporate affairs",
      "Corporate affairs → Business trends",
      "Corporate affairs → Leadership",
      "Corporate affairs → Ownership",
      "Corporate affairs → Corporate culture",
      "Corporate affairs → Offices",
      "Corporate affairs → Litigation",
      "Corporate affairs → Lobbying",
      "Finances",
      "Finances → Taxes",
      "Finances → Charity",
      "Environment",
      "Environment → Apple Energy",
      "Environment → Energy and resources",
      "Environment → Toxins",
      "Environment → Green bonds",
      "Supply chain",
      "Supply chain → Worker organizations",
      "Supply chain → Democratic Republic of the Congo",
      "Supply chain → Citations"
    ]
  },
  {
    date: "2026-01-04",
    answer: "Gold",
    sections: [
      "Etymology",
      "Characteristics",
      "Characteristics → Color",
      "Characteristics → Isotopes",
      "Chemistry",
      "Chemistry → Rare oxidation states",
      "Origin",
      "Origin → Gold production in the universe",
      "Origin → Asteroid origin theories",
      "Origin → Mantle return theories",
      "Occurrence",
      "Occurrence → Seawater",
      "History",
      "History → Culture",
      "Production",
      "Production → Mining and prospecting",
      "Production → Extraction and refining",
      "Production → Recycling",
      "Production → Consumption",
      "Production → Pollution",
      "Monetary use",
      "Monetary use → Price",
      "Other applications",
      "Other applications → Jewelry",
      "Other applications → Electronics",
      "Other applications → Medicine",
      "Other applications → Cuisine",
      "Other applications → Miscellanea",
      "Toxicity"
    ]
  }
];

// You can optionally encode the articles array to prevent casual spoilers
// Uncomment below to use encoded version:
/*
const ARTICLES_ENCODED = btoa(JSON.stringify(ARTICLES));
const ARTICLES = JSON.parse(atob(ARTICLES_ENCODED));
*/
