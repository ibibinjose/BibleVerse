// Source links for a feast. Titles that would 404 under a naive slug are listed here.
// Vatican saint-of-the-day pages are dated; feasts of the Lord that move use Vatican News search.

export const RANK_EXPLAIN = {
  Solemnity: "The highest rank. These celebrate the central mysteries of Christ, Mary, or a saint of special importance.",
  Feast: "A joyful celebration of the Lord, Mary, the apostles, or the evangelists, below a solemnity.",
  Memorial: "A required remembrance of a saint. The prayers of the day can be those of the saint.",
  Optional: "An optional memorial. The Church may keep the weekday or remember this saint.",
  Sunday: "The Lord's Day, the weekly celebration of the Resurrection, and the original feast.",
  Observance: "A marked day in the Church's year, such as Ash Wednesday, that is not a saint's feast.",
};

const PAGE_SLUG = {
  "Francis of Assisi": "Francis_of_Assisi",
  "Paul Miki and Companions": "Paul_Miki",
  "Timothy and Titus": "Saint_Timothy",
  "Basil the Great and Gregory Nazianzen": "Basil_of_Caesarea",
  "Mary, the Holy Mother of God": "Mary,_mother_of_Jesus",
  "Saint Joseph, Spouse of Mary": "Joseph",
  "Annunciation of the Lord": "Annunciation",
  "John Fisher and Thomas More": "Thomas_More",
  "Augustine Zhao Rong and Companions": "Chinese_Martyrs",
  "Martha, Mary and Lazarus": "Martha",
  "Michael, Gabriel and Raphael, Archangels": "Michael_(archangel)",
  "John de Brébeuf and Isaac Jogues and Companions": "Canadian_Martyrs",
  "Simon and Jude": "Simon_the_Zealot",
  "Dedication of the Basilicas of Peter and Paul": "St._Peter's_Basilica",
  "Andrew Dung-Lac and Companions": "Vietnamese_Martyrs",
  "John, Apostle and Evangelist": "John_the_Apostle",
  "Epiphany of the Lord": "Epiphany_(holiday)",
  "Holy Family of Jesus, Mary and Joseph": "Holy_Family",
  "All Saints": "All_Saints'_Day",
  "All Souls": "All_Souls'_Day",
  "Christmas": "Christmas",
  "Easter Sunday": "Easter",
  "Corpus Christi": "Feast_of_Corpus_Christi",
  "Christ the King": "Feast_of_Christ_the_King",
  "Most Sacred Heart of Jesus": "Sacred_Heart",
  "Pentecost": "Pentecost",
  "Guardian Angels": "Guardian_angel",
  "Holy Innocents": "Massacre_of_the_Innocents",
  "Our Lady of Guadalupe": "Our_Lady_of_Guadalupe",
  "Thérèse of Lisieux": "Thérèse_of_Lisieux",
  "Sharbel Makhluf": "Charbel_Makhlouf",
  "Teresa Benedicta of the Cross": "Edith_Stein",
  "John XXIII": "Pope_John_XXIII",
  "John Paul II": "Pope_John_Paul_II",
  "Presentation of the Lord": "Candlemas",
  "Conversion of Saint Paul": "Conversion_of_Paul_the_Apostle",
  "Nativity of Saint John the Baptist": "John_the_Baptist",
  "Saints Peter and Paul": "Feast_of_Saints_Peter_and_Paul",
  "Dedication of Saint Mary Major": "Santa_Maria_Maggiore",
  "Dedication of the Lateran Basilica": "Archbasilica_of_Saint_John_Lateran",
  "Transfiguration of the Lord": "Transfiguration_of_Jesus",
  "Exaltation of the Holy Cross": "Feast_of_the_Cross",
  "Immaculate Conception of Mary": "Immaculate_Conception",
  "Assumption of Mary": "Assumption_of_Mary",
  "Visitation of Mary": "Visitation_(Christianity)",
  "Our Lady of Fatima": "Our_Lady_of_Fátima",
  "Ascension of the Lord": "Feast_of_the_Ascension",
  "Most Holy Trinity": "Trinity_Sunday",
  "Baptism of the Lord": "Feast_of_the_Baptism_of_the_Lord",
  "Divine Mercy Sunday": "Divine_Mercy_Sunday",
  "Ash Wednesday": "Ash_Wednesday",
  "Palm Sunday": "Palm_Sunday",
  "Holy Thursday": "Maundy_Thursday",
  "Good Friday": "Good_Friday",
  "Holy Saturday": "Holy_Saturday",
  "Stanislaus": "Stanislaus_of_Szczepanów",
  "Bernardine of Siena": "Bernardino_of_Siena",
  "Monica": "Saint_Monica",
  "Clement I": "Clement_of_Rome",
};

// Grokipedia has no page for these; the search URL is the one that resolves.
const GROK_SEARCH = new Set(["John Leonardi"]);

const VATICAN = {
  "All Saints": "https://www.vaticannews.va/en/liturgical-holidays/solemnity-of-all-saints.html",
  "All Souls": "https://www.vaticannews.va/en/liturgical-holidays/commemoration-of-all-the-faithful-departed--all-souls-day-.html",
  Pentecost: "https://www.vaticannews.va/en/liturgical-holidays/pentecost.html",
  "Christ the King": "https://www.vaticannews.va/en/liturgical-holidays/our-lord-jesus-christ--king-of-the-universe.html",
};

export function rankLabel(rank) {
  return rank === "Optional" ? "Optional Memorial" : rank;
}

export function rankExplanation(rank) {
  return RANK_EXPLAIN[rank] || "A celebration on the General Roman Calendar.";
}

function articleUrl(host, slug) {
  return host + encodeURI(slug).replaceAll("'", "%27");
}

export function pageSlug(name) {
  return PAGE_SLUG[name] || name.replaceAll(" ", "_");
}

export function feastSources(feast) {
  const slug = pageSlug(feast.name);
  const wikipedia = articleUrl("https://en.wikipedia.org/wiki/", slug);
  // A page URL only when that slug was checked. Otherwise search, which resolves.
  const grokipedia = PAGE_SLUG[feast.name] && !GROK_SEARCH.has(feast.name)
    ? articleUrl("https://grokipedia.com/page/", slug)
    : "https://grokipedia.com/search?q=" + encodeURIComponent(feast.name);
  let vatican = VATICAN[feast.name];
  if (!vatican && feast.movable) {
    vatican = "https://www.vaticannews.va/en/search.html?q=" + encodeURIComponent(feast.name);
  }
  if (!vatican && feast.m && feast.d) {
    const mm = String(feast.m).padStart(2, "0");
    const dd = String(feast.d).padStart(2, "0");
    vatican = `https://www.vaticannews.va/en/saints/${mm}/${dd}.html`;
  }
  if (!vatican) vatican = "https://www.vaticannews.va/en/search.html?q=" + encodeURIComponent(feast.name);
  return { vatican, wikipedia, grokipedia };
}
