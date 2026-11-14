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

export const PAGE_SLUG = {
  "Agatha": "Agatha_of_Sicily",
  "Agnes": "Agnes_of_Rome",
  "Albert the Great": "Albertus_Magnus",
  "All Saints": "All_Saints'_Day",
  "All Souls": "All_Souls'_Day",
  "Andrew Dung-Lac and Companions": "Vietnamese_Martyrs",
  "Andrew Kim, Paul Chong and Companions": "Korean_Martyrs",
  "Annunciation of the Lord": "Annunciation",
  "Anselm": "Anselm_of_Canterbury",
  "Anthony of Egypt": "Anthony_the_Great",
  "Apollinaris": "Apollinaris_of_Ravenna",
  "Ascension of the Lord": "Feast_of_the_Ascension",
  "Augustine Zhao Rong and Companions": "Chinese_Martyrs",
  "Baptism of the Lord": "Feast_of_the_Baptism_of_the_Lord",
  "Basil the Great and Gregory Nazianzen": "Basil_of_Caesarea",
  "Benedict": "Benedict_of_Nursia",
  "Bernardine of Siena": "Bernardino_of_Siena",
  "Blaise and Ansgar": "Saint_Blaise",
  "Bruno": "Bruno_of_Cologne",
  "Callistus I": "Pope_Callixtus_I",
  "Cecilia": "Saint_Cecilia",
  "Charles Lwanga and Companions": "Charles_Lwanga",
  "Christ the King": "Feast_of_Christ_the_King",
  "Clare": "Clare_of_Assisi",
  "Clement I": "Clement_of_Rome",
  "Columban": "Columbanus",
  "Conversion of Saint Paul": "Conversion_of_Paul_the_Apostle",
  "Cornelius and Cyprian": "Cyprian",
  "Corpus Christi": "Feast_of_Corpus_Christi",
  "Dedication of Saint Mary Major": "Santa_Maria_Maggiore",
  "Dedication of the Basilicas of Peter and Paul": "St._Peter's_Basilica",
  "Dedication of the Lateran Basilica": "Archbasilica_of_Saint_John_Lateran",
  "Easter Sunday": "Easter",
  "Epiphany of the Lord": "Epiphany_(holiday)",
  "Exaltation of the Holy Cross": "Feast_of_the_Cross",
  "Fabian and Sebastian": "Pope_Fabian",
  "First Martyrs of Rome": "First_Martyrs_of_the_Church_of_Rome",
  "George": "Saint_George",
  "Gregory VII": "Pope_Gregory_VII",
  "Guardian Angels": "Guardian_angel",
  "Hedwig": "Hedwig_of_Silesia",
  "Henry": "Henry_II,_Holy_Roman_Emperor",
  "Holy Family of Jesus, Mary and Joseph": "Holy_Family",
  "Holy Innocents": "Massacre_of_the_Innocents",
  "Holy Thursday": "Maundy_Thursday",
  "Immaculate Conception of Mary": "Immaculate_Conception",
  "James": "James_the_Great",
  "Jerome Emiliani": "Gerolamo_Emiliani",
  "Joachim and Anne": "Saint_Anne",
  "John Baptist de la Salle": "Jean-Baptiste_de_La_Salle",
  "John Damascene": "John_of_Damascus",
  "John Fisher and Thomas More": "Thomas_More",
  "John I": "Pope_John_I",
  "John Paul II": "Pope_John_Paul_II",
  "John XXIII": "Pope_John_XXIII",
  "John de Brébeuf and Isaac Jogues and Companions": "Canadian_Martyrs",
  "John of Kanty": "John_Cantius",
  "John, Apostle and Evangelist": "John_the_Apostle",
  "Josaphat": "Josaphat_Kuntsevych",
  "Lawrence": "Saint_Lawrence",
  "Lawrence Ruiz and Companions": "Lorenzo_Ruiz",
  "Louis of France": "Louis_IX_of_France",
  "Luke": "Luke_the_Evangelist",
  "Margaret of Scotland": "Saint_Margaret_of_Scotland",
  "Mark": "Mark_the_Evangelist",
  "Martha, Mary and Lazarus": "Martha",
  "Martin I": "Pope_Martin_I",
  "Mary, the Holy Mother of God": "Mary,_mother_of_Jesus",
  "Matthew": "Matthew_the_Apostle",
  "Michael, Gabriel and Raphael, Archangels": "Michael_(archangel)",
  "Monica": "Saint_Monica",
  "Most Holy Trinity": "Trinity_Sunday",
  "Most Sacred Heart of Jesus": "Sacred_Heart",
  "Nativity of Saint John the Baptist": "John_the_Baptist",
  "Our Lady of Fatima": "Our_Lady_of_Fátima",
  "Pancras": "Pancras_of_Rome",
  "Passion of Saint John the Baptist": "Beheading_of_John_the_Baptist",
  "Patrick": "Saint_Patrick",
  "Paul Miki and Companions": "Paul_Miki",
  "Philip and James": "Philip_the_Apostle",
  "Pius of Pietrelcina": "Padre_Pio",
  "Pontian and Hippolytus": "Pope_Pontian",
  "Presentation of the Lord": "Candlemas",
  "Raymond of Penyafort": "Raymond_of_Peñafort",
  "Saint Joseph, Spouse of Mary": "Joseph",
  "Saints Peter and Paul": "Feast_of_Saints_Peter_and_Paul",
  "Seven Founders of the Servites": "Seven_Holy_Founders_of_the_Servite_Order",
  "Sharbel Makhluf": "Charbel_Makhlouf",
  "Simon and Jude": "Simon_the_Zealot",
  "Sixtus II and Companions": "Pope_Sixtus_II",
  "Stanislaus": "Stanislaus_of_Szczepanów",
  "Teresa Benedicta of the Cross": "Edith_Stein",
  "Teresa of Calcutta": "Mother_Teresa",
  "Thomas": "Thomas_the_Apostle",
  "Timothy and Titus": "Saint_Timothy",
  "Transfiguration of the Lord": "Transfiguration_of_Jesus",
  "Visitation of Mary": "Visitation_(Christianity)",
};

export const GROK_SLUG = {};

// Grokipedia has no page for these; the search URL is the one that resolves.
const GROK_SEARCH = new Set(["Adalbert","Athanasius","Bartholomew","Bede the Venerable","Boniface","Cajetan","Cosmas and Damian","Damasus I","Ephrem","George","Gregory the Great","Holy Name of Mary","John Leonardi","Joseph the Worker","Leo the Great","Louis Grignion de Montfort","Paul VI","Pius V","Pius X","Queenship of Mary","Raymond of Penyafort","Stephen of Hungary","Sylvester I","Teresa of Avila"]);

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
  // A stored page slug, otherwise the Wikipedia slug when a page exists.
  // Names in GROK_SEARCH have no page; search is the URL that resolves.
  const grokSlug = GROK_SEARCH.has(feast.name) ? "" : (GROK_SLUG[feast.name] || slug);
  const grokipedia = grokSlug
    ? articleUrl("https://grokipedia.com/page/", grokSlug)
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
