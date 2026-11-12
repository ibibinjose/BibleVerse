// Catholic liturgical calendar: fixed feasts of the General Roman Calendar,
// movable feasts from the Easter computus, and liturgical seasons.
// Plain data + pure functions — runs in the browser and under node --test.
//
// Rank badges shown in the UI: Solemnity, Feast, Memorial, Optional,
// Sunday, Observance. "O" flag = Holy Day of Obligation (United States).
// [month, day, name, rank, about, flags?]

// ---------- date helpers (local noon avoids DST edges) ----------
export function toDate(y, m, d) { return new Date(y, m - 1, d, 12, 0, 0); }
export function parts(dt) { return { y: dt.getFullYear(), m: dt.getMonth() + 1, d: dt.getDate() }; }
export function key(y, m, d) { return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`; }
export function addDays(dt, n) { const c = new Date(dt); c.setDate(c.getDate() + n); return c; }
function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

// ---------- Easter computus (Gregorian, valid 1583+) ----------
export function easterSunday(year) {
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return toDate(year, month, day);
}

function firstSundayOnOrAfter(dt) { const c = new Date(dt); while (c.getDay() !== 0) c.setDate(c.getDate() + 1); return c; }

// First Sunday of Advent = the Sunday between Nov 27 and Dec 3.
export function adventSunday(year) { return firstSundayOnOrAfter(toDate(year, 11, 27)); }
// Christ the King = last Sunday of the liturgical year, a week before Advent.
export function christTheKing(year) { return addDays(adventSunday(year), -7); }
// Epiphany is celebrated the Sunday between Jan 2 and Jan 8 (traditionally Jan 6).
export function epiphanySunday(year) {
  for (let d = 2; d <= 8; d++) { const c = toDate(year, 1, d); if (c.getDay() === 0) return c; }
  return toDate(year, 1, 6);
}
// Baptism of the Lord: Sunday after Epiphany, or Monday Jan 8/9 when
// Epiphany itself is celebrated Sunday Jan 7/8.
export function baptismOfLord(year) {
  const eph = epiphanySunday(year);
  return eph.getDate() >= 7 ? addDays(eph, 1) : addDays(eph, 7);
}
// Holy Family: Sunday within the Octave of Christmas (Dec 30 when Christmas is Sunday).
export function holyFamily(year) {
  const xmas = toDate(year, 12, 25);
  return xmas.getDay() === 0 ? toDate(year, 12, 30) : firstSundayOnOrAfter(addDays(xmas, 1));
}

// ---------- movable feasts for a year ----------
export function movableFeasts(year) {
  const E = easterSunday(year);
  const at = (n) => parts(addDays(E, n));
  const F = (dt, name, rank, about) => ({ ...parts(dt), name, rank, about, movable: true });
  return [
    F(epiphanySunday(year), "Epiphany of the Lord", "Solemnity", "The Magi adore the Christ child; traditionally kept Jan 6, celebrated Sunday in many dioceses."),
    F(baptismOfLord(year), "Baptism of the Lord", "Feast", "Jesus is baptized by John; the Christmas season closes."),
    { ...at(-46), name: "Ash Wednesday", rank: "Observance", about: "Lent begins. A day of fast and abstinence; ashes mark a call to repentance.", movable: true },
    { ...at(-7), name: "Palm Sunday", rank: "Sunday", about: "Jesus enters Jerusalem; Holy Week begins.", movable: true },
    { ...at(-3), name: "Holy Thursday", rank: "Observance", about: "Evening Mass of the Lord's Supper; the altar is stripped.", movable: true },
    { ...at(-2), name: "Good Friday", rank: "Observance", about: "Celebration of the Lord's Passion. A day of fast and abstinence.", movable: true },
    { ...at(-1), name: "Holy Saturday", rank: "Observance", about: "The Church waits at the tomb; the Easter Vigil kindles the new fire.", movable: true },
    F(E, "Easter Sunday", "Solemnity", "The Resurrection of the Lord — the queen of feasts."),
    F(addDays(E, 7), "Divine Mercy Sunday", "Feast", "Second Sunday of Easter; trust in Christ's mercy."),
    { ...at(39), name: "Ascension of the Lord", rank: "Solemnity", about: "Christ ascends to the Father; many dioceses keep it the following Sunday.", obligation: true, movable: true },
    F(addDays(E, 49), "Pentecost", "Solemnity", "The Holy Spirit descends; the birthday of the Church."),
    F(addDays(E, 56), "Most Holy Trinity", "Solemnity", "Glory to the Father, the Son, and the Holy Spirit."),
    F(addDays(E, 60), "Corpus Christi", "Solemnity", "The Body and Blood of Christ; many dioceses keep it the following Sunday."),
    F(addDays(E, 68), "Most Sacred Heart of Jesus", "Solemnity", "Friday after Corpus Christi; the pierced Heart that loves us."),
    F(holyFamily(year), "Holy Family of Jesus, Mary and Joseph", "Feast", "Sunday within the Octave of Christmas."),
    F(christTheKing(year), "Christ the King", "Solemnity", "Last Sunday of the year: Christ reigns over all."),
  ];
}

// ---------- liturgical season ----------
export function seasonOf(input) {
  const { y, m, d } = parts(input);
  const dt = toDate(y, m, d);
  const E = easterSunday(y), ash = addDays(E, -46), pent = addDays(E, 49);
  const adv = adventSunday(y), xmas = toDate(y, 12, 25), bap = baptismOfLord(y);
  const t = dt.getTime();
  if (t >= adv.getTime() && t < xmas.getTime()) return { name: "Advent", color: "#6d28d9" };
  if ((t >= xmas.getTime()) || (t <= bap.getTime() && dt.getMonth() === 0)) {
    if (dt.getMonth() === 11 || (dt.getMonth() === 0 && t <= bap.getTime())) return { name: "Christmas", color: "#b45309" };
  }
  if (t >= ash.getTime() && t < addDays(E, -3).getTime()) return { name: "Lent", color: "#6d28d9" };
  if (t >= addDays(E, -3).getTime() && t < E.getTime()) return { name: "Triduum", color: "#b91c1c" };
  if (t >= E.getTime() && t <= pent.getTime()) return { name: "Easter", color: "#b45309" };
  return { name: "Ordinary Time", color: "#166534" };
}

// ---------- fixed feasts: [month, day, name, rank, about, flags?] ----------
const RAW = [
  [1,1,"Mary, the Holy Mother of God","Solemnity","The Church opens the year honoring Mary as Mother of God.","O"],
  [1,2,"Basil the Great and Gregory Nazianzen","Memorial","Fourth-century bishops and Doctors of the Church."],
  [1,7,"Raymond of Penyafort","Optional","Dominican priest, patron of canon lawyers."],
  [1,13,"Hilary of Poitiers","Optional","Bishop and Doctor; defender of the faith against Arianism."],
  [1,17,"Anthony of Egypt","Memorial","Third-century hermit, father of monasticism."],
  [1,20,"Fabian and Sebastian","Optional","Pope and martyr; Roman soldier and martyr."],
  [1,21,"Agnes","Memorial","Young Roman virgin and martyr of the early Church."],
  [1,22,"Vincent of Saragossa","Optional","Deacon and martyr of Spain."],
  [1,24,"Francis de Sales","Memorial","Bishop of Geneva, patron of writers and journalists."],
  [1,25,"Conversion of Saint Paul","Feast","Saul becomes Paul on the road to Damascus."],
  [1,26,"Timothy and Titus","Memorial","Paul's companions, entrusted with the first churches."],
  [1,27,"Angela Merici","Optional","Founder of the Ursulines, educator of girls."],
  [1,28,"Thomas Aquinas","Memorial","Dominican friar and Doctor of the Church."],
  [1,31,"John Bosco","Memorial","Founder of the Salesians, friend of youth."],
  [2,2,"Presentation of the Lord","Feast","Mary and Joseph present Jesus in the Temple. Candlemas."],
  [2,3,"Blaise and Ansgar","Optional","Bishop and martyr; apostle of Scandinavia."],
  [2,5,"Agatha","Memorial","Virgin and martyr of Sicily."],
  [2,6,"Paul Miki and Companions","Memorial","Martyrs of Nagasaki, Japan."],
  [2,8,"Jerome Emiliani","Optional","Founder of orphanages for abandoned children."],
  [2,8,"Josephine Bakhita","Optional","Sudanese former slave turned Canossian sister."],
  [2,10,"Scholastica","Memorial","Twin sister of Saint Benedict."],
  [2,11,"Our Lady of Lourdes","Optional","Mary appears to Bernadette, 1858; world day of the sick."],
  [2,14,"Cyril and Methodius","Memorial","Brothers, apostles to the Slavs."],
  [2,17,"Seven Founders of the Servites","Optional","Merchants of Florence who founded the Servite Order."],
  [2,21,"Peter Damian","Optional","Reforming cardinal and Doctor of the Church."],
  [2,22,"Chair of Saint Peter","Feast","The teaching authority of Peter and his successors."],
  [2,23,"Polycarp","Memorial","Bishop of Smyrna, disciple of John the Apostle."],
  [3,4,"Casimir","Optional","Prince of Poland, known for chastity and charity."],
  [3,7,"Perpetua and Felicity","Memorial","Martyrs of Carthage."],
  [3,8,"John of God","Optional","Founder of the Brothers Hospitallers."],
  [3,9,"Frances of Rome","Optional","Mystic and founder of the Oblates."],
  [3,17,"Patrick","Optional","Apostle of Ireland; a solemnity in Ireland."],
  [3,18,"Cyril of Jerusalem","Optional","Bishop and Doctor, great catechist."],
  [3,19,"Saint Joseph, Spouse of Mary","Solemnity","Guardian of Jesus and patron of the universal Church."],
  [3,23,"Turibius of Mogrovejo","Optional","Reforming Archbishop of Lima."],
  [3,25,"Annunciation of the Lord","Solemnity","Gabriel announces to Mary: the Word becomes flesh."],
  [4,2,"Francis of Paola","Optional","Hermit, founder of the Minims."],
  [4,4,"Isidore of Seville","Optional","Bishop, scholar, and Doctor of the Church."],
  [4,5,"Vincent Ferrer","Optional","Dominican preacher of repentance."],
  [4,7,"John Baptist de la Salle","Memorial","Founder of the Christian Brothers, patron of teachers."],
  [4,11,"Stanislaus","Memorial","Bishop and martyr, patron of Poland."],
  [4,13,"Martin I","Optional","Pope and martyr."],
  [4,16,"Bernadette Soubirous","Optional","Visionary of Lourdes."],
  [4,21,"Anselm","Optional","Archbishop of Canterbury and Doctor."],
  [4,23,"George","Optional","Martyr, patron of England."],
  [4,23,"Adalbert","Optional","Bishop-martyr of Prague."],
  [4,24,"Fidelis of Sigmaringen","Optional","Capuchin friar and martyr."],
  [4,25,"Mark","Feast","Evangelist, author of the second Gospel."],
  [4,28,"Peter Chanel","Optional","First martyr of Oceania."],
  [4,28,"Louis Grignion de Montfort","Optional","Apostle of true devotion to Mary."],
  [4,29,"Catherine of Siena","Memorial","Dominican mystic and Doctor of the Church."],
  [4,30,"Pius V","Optional","Pope who renewed the liturgy after Trent."],
  [5,1,"Joseph the Worker","Optional","The hidden labor of Nazareth."],
  [5,2,"Athanasius","Memorial","Defender of Christ's divinity at Nicaea; Doctor."],
  [5,3,"Philip and James","Feast","Apostles of the Lord."],
  [5,12,"Nereus and Achilleus","Optional","Roman martyrs."],
  [5,12,"Pancras","Optional","Young martyr of Rome."],
  [5,13,"Our Lady of Fatima","Optional","Mary appears to three shepherd children, 1917."],
  [5,14,"Matthias","Feast","Chosen to take the place of Judas."],
  [5,18,"John I","Optional","Pope and martyr."],
  [5,20,"Bernardine of Siena","Optional","Franciscan preacher of the Holy Name."],
  [5,22,"Rita of Cascia","Optional","Wife, mother, widow, then Augustinian nun."],
  [5,25,"Bede the Venerable","Optional","Monk of Jarrow, scholar and Doctor."],
  [5,25,"Gregory VII","Optional","Reforming pope of the eleventh century."],
  [5,25,"Mary Magdalene de' Pazzi","Optional","Carmelite mystic of Florence."],
  [5,26,"Philip Neri","Memorial","Founder of the Oratory; the joyful saint."],
  [5,27,"Augustine of Canterbury","Optional","Apostle of England."],
  [5,29,"Paul VI","Optional","Pope who brought Vatican II to completion."],
  [5,31,"Visitation of Mary","Feast","Mary hastens to her cousin Elizabeth."],
  [6,1,"Justin Martyr","Memorial","Philosopher and first great apologist."],
  [6,2,"Marcellinus and Peter","Optional","Martyrs under Diocletian."],
  [6,3,"Charles Lwanga and Companions","Memorial","Martyrs of Uganda."],
  [6,5,"Boniface","Memorial","Apostle of Germany, martyred in Frisia."],
  [6,6,"Norbert","Optional","Founder of the Premonstratensians."],
  [6,9,"Ephrem","Optional","Deacon of Edessa, Doctor, Harp of the Spirit."],
  [6,11,"Barnabas","Memorial","Apostle, companion of Paul."],
  [6,13,"Anthony of Padua","Memorial","Franciscan preacher and Doctor."],
  [6,19,"Romuald","Optional","Hermit, founder of the Camaldolese."],
  [6,21,"Aloysius Gonzaga","Memorial","Young Jesuit, patron of youth."],
  [6,22,"Paulinus of Nola","Optional","Bishop who gave everything to the poor."],
  [6,22,"John Fisher and Thomas More","Optional","Cardinal and chancellor, martyrs for conscience."],
  [6,24,"Nativity of Saint John the Baptist","Solemnity","The birth of the Forerunner."],
  [6,27,"Cyril of Alexandria","Optional","Defender of Mary as Mother of God; Doctor."],
  [6,28,"Irenaeus","Memorial","Bishop of Lyons, scourge of heresies."],
  [6,29,"Saints Peter and Paul","Solemnity","The two pillars of the Church."],
  [6,30,"First Martyrs of Rome","Optional","The earliest harvest under Nero."],
  [7,3,"Thomas","Feast","The apostle who touched the wounds of Christ."],
  [7,5,"Anthony Zaccaria","Optional","Founder of the Barnabites."],
  [7,5,"Elizabeth of Portugal","Optional","Queen who served the poor."],
  [7,6,"Maria Goretti","Optional","Young martyr of purity."],
  [7,9,"Augustine Zhao Rong and Companions","Optional","Martyrs of China."],
  [7,11,"Benedict","Memorial","Father of Western monasticism; his Rule still guides."],
  [7,13,"Henry","Optional","Holy Roman Emperor, friend of monks."],
  [7,14,"Kateri Tekakwitha","Memorial","Lily of the Mohawks."],
  [7,15,"Bonaventure","Memorial","Franciscan cardinal and Doctor."],
  [7,16,"Our Lady of Mount Carmel","Optional","Patroness of the Carmelite family."],
  [7,20,"Apollinaris","Optional","Bishop of Ravenna and martyr."],
  [7,21,"Lawrence of Brindisi","Optional","Capuchin preacher and Doctor."],
  [7,22,"Mary Magdalene","Feast","Apostle to the Apostles, first witness of the risen Lord."],
  [7,23,"Bridget of Sweden","Optional","Mystic and founder of the Bridgettines."],
  [7,24,"Sharbel Makhluf","Optional","Lebanese Maronite hermit and wonderworker."],
  [7,25,"James","Feast","Apostle, patron of pilgrims; Santiago."],
  [7,26,"Joachim and Anne","Memorial","Parents of the Blessed Virgin Mary."],
  [7,29,"Martha, Mary and Lazarus","Memorial","The family of Bethany who welcomed Jesus."],
  [7,30,"Peter Chrysologus","Optional","Archbishop of Ravenna, golden-worded Doctor."],
  [7,31,"Ignatius of Loyola","Memorial","Founder of the Jesuits."],
  [8,1,"Alphonsus Liguori","Memorial","Founder of the Redemptorists; Doctor."],
  [8,2,"Eusebius of Vercelli","Optional","First bishop to live in community with his clergy."],
  [8,2,"Peter Julian Eymard","Optional","Apostle of Eucharistic adoration."],
  [8,4,"John Vianney","Memorial","The Curé of Ars, patron of parish priests."],
  [8,5,"Dedication of Saint Mary Major","Optional","The oldest Marian basilica in the West."],
  [8,6,"Transfiguration of the Lord","Feast","Christ revealed in glory on the mountain."],
  [8,7,"Sixtus II and Companions","Optional","Pope and deacons, martyred together."],
  [8,7,"Cajetan","Optional","Founder of the Theatines."],
  [8,8,"Dominic","Memorial","Founder of the Order of Preachers."],
  [8,9,"Teresa Benedicta of the Cross","Optional","Edith Stein: philosopher, Carmelite, martyr of Auschwitz."],
  [8,10,"Lawrence","Feast","Deacon and martyr of Rome."],
  [8,11,"Clare","Memorial","First Franciscan sister."],
  [8,13,"Pontian and Hippolytus","Optional","Pope and priest, reconciled martyrs."],
  [8,14,"Maximilian Kolbe","Memorial","Franciscan who gave his life for a fellow prisoner at Auschwitz."],
  [8,15,"Assumption of Mary","Solemnity","Mary taken up body and soul into heaven.","O"],
  [8,16,"Stephen of Hungary","Optional","King who gave his realm to Mary."],
  [8,19,"John Eudes","Optional","Apostle of devotion to the Sacred Heart."],
  [8,20,"Bernard","Memorial","Cistercian abbot and Doctor."],
  [8,21,"Pius X","Memorial","Pope of the Eucharist."],
  [8,22,"Queenship of Mary","Memorial","Mary crowned Queen of heaven and earth."],
  [8,23,"Rose of Lima","Optional","First canonized saint of the Americas."],
  [8,24,"Bartholomew","Feast","Apostle."],
  [8,25,"Louis of France","Optional","Crusader king and servant of the poor."],
  [8,25,"Joseph Calasanz","Optional","Founder of free schools for poor children."],
  [8,27,"Monica","Memorial","Mother of Augustine; her tears won his conversion."],
  [8,28,"Augustine of Hippo","Memorial","Bishop and Doctor, author of the Confessions."],
  [8,29,"Passion of Saint John the Baptist","Memorial","His martyrdom under Herod."],
  [9,3,"Gregory the Great","Memorial","Pope and Doctor; Gregorian chant bears his name."],
  [9,5,"Teresa of Calcutta","Optional","Missionary of Charity to the poorest of the poor."],
  [9,8,"Nativity of Mary","Feast","The birthday of the Blessed Virgin."],
  [9,9,"Peter Claver","Optional","Apostle to enslaved Africans in Cartagena."],
  [9,12,"Holy Name of Mary","Optional","The sweet name that puts demons to flight."],
  [9,13,"John Chrysostom","Memorial","Golden-mouthed preacher; Doctor."],
  [9,14,"Exaltation of the Holy Cross","Feast","Triumph of the Cross over sin and death."],
  [9,15,"Our Lady of Sorrows","Memorial","Mary's seven sorrows at the foot of the Cross."],
  [9,16,"Cornelius and Cyprian","Memorial","Pope and bishop, martyred together."],
  [9,17,"Robert Bellarmine","Optional","Jesuit cardinal and Doctor."],
  [9,17,"Hildegard of Bingen","Optional","Abbess, mystic, composer, Doctor."],
  [9,19,"Januarius","Optional","Bishop-martyr of Naples; the miracle of his blood."],
  [9,20,"Andrew Kim, Paul Chong and Companions","Memorial","Martyrs of Korea."],
  [9,21,"Matthew","Feast","Apostle and Evangelist, the tax collector called by Christ."],
  [9,23,"Pius of Pietrelcina","Memorial","Padre Pio, Capuchin stigmatist."],
  [9,26,"Cosmas and Damian","Optional","Twin physicians, martyrs."],
  [9,27,"Vincent de Paul","Memorial","Apostle of charity to the poor."],
  [9,28,"Wenceslaus","Optional","Duke and martyr of Bohemia."],
  [9,28,"Lawrence Ruiz and Companions","Optional","Martyrs of Japan."],
  [9,29,"Michael, Gabriel and Raphael, Archangels","Feast","The heavenly messengers and protectors."],
  [9,30,"Jerome","Memorial","Translator of the Vulgate; Doctor."],
  [10,1,"Thérèse of Lisieux","Memorial","The Little Flower; her little way of love."],
  [10,2,"Guardian Angels","Memorial","He has given his angels charge over you."],
  [10,4,"Francis of Assisi","Memorial","The poor man of Assisi."],
  [10,6,"Bruno","Optional","Hermit, founder of the Carthusians."],
  [10,7,"Our Lady of the Rosary","Memorial","Victory of Lepanto, 1571."],
  [10,9,"John Henry Newman","Optional","Cardinal, convert, Doctor of the Church."],
  [10,9,"John Leonardi","Optional","Founder of the Clerks Regular of the Mother of God."],
  [10,11,"John XXIII","Optional","The good pope who convened Vatican II."],
  [10,14,"Callistus I","Optional","Pope and martyr."],
  [10,15,"Teresa of Avila","Memorial","Carmelite reformer; first woman Doctor."],
  [10,16,"Margaret Mary Alacoque","Optional","Visionary of the Sacred Heart."],
  [10,16,"Hedwig","Optional","Duchess of Silesia, servant of the poor."],
  [10,17,"Ignatius of Antioch","Memorial","Bishop-martyr, devoured by lions in Rome."],
  [10,18,"Luke","Feast","Evangelist and companion of Paul."],
  [10,19,"John de Brébeuf and Isaac Jogues and Companions","Memorial","The North American Martyrs."],
  [10,19,"Paul of the Cross","Optional","Founder of the Passionists."],
  [10,22,"John Paul II","Optional","Pope for twenty-six years; be not afraid."],
  [10,23,"John of Capistrano","Optional","Franciscan preacher and crusader."],
  [10,24,"Anthony Mary Claret","Optional","Archbishop, founder, missionary."],
  [10,28,"Simon and Jude","Feast","Apostles."],
  [11,1,"All Saints","Solemnity","Every saint in heaven, known and unknown.","O"],
  [11,2,"All Souls","Observance","The Commemoration of All the Faithful Departed."],
  [11,3,"Martin de Porres","Optional","Dominican brother of Lima."],
  [11,4,"Charles Borromeo","Memorial","Reforming Archbishop of Milan."],
  [11,9,"Dedication of the Lateran Basilica","Feast","The Pope's cathedral, mother of all churches."],
  [11,10,"Leo the Great","Memorial","Pope and Doctor who faced down Attila."],
  [11,11,"Martin of Tours","Memorial","Soldier-bishop who shared his cloak."],
  [11,12,"Josaphat","Memorial","Eastern bishop, martyr for unity."],
  [11,13,"Frances Xavier Cabrini","Optional","First US citizen canonized; patron of immigrants."],
  [11,15,"Albert the Great","Optional","Dominican Doctor, teacher of Aquinas."],
  [11,16,"Margaret of Scotland","Optional","Queen renowned for charity."],
  [11,16,"Gertrude the Great","Optional","Benedictine mystic of the Sacred Heart."],
  [11,17,"Elizabeth of Hungary","Memorial","Princess who served the poor."],
  [11,18,"Dedication of the Basilicas of Peter and Paul","Optional","The two great churches of Rome."],
  [11,21,"Presentation of Mary","Memorial","Mary consecrated in the Temple."],
  [11,22,"Cecilia","Memorial","Virgin, martyr, patroness of musicians."],
  [11,23,"Clement I","Optional","Pope and martyr."],
  [11,23,"Columban","Optional","Irish missionary abbot."],
  [11,24,"Andrew Dung-Lac and Companions","Memorial","Martyrs of Vietnam."],
  [11,25,"Catherine of Alexandria","Optional","Virgin and martyr."],
  [11,30,"Andrew","Feast","The first-called apostle."],
  [12,3,"Francis Xavier","Memorial","Jesuit missionary to Asia."],
  [12,4,"John Damascene","Optional","Defender of icons; Doctor."],
  [12,6,"Nicholas","Optional","Bishop of Myra; the real Saint Nick."],
  [12,7,"Ambrose","Memorial","Bishop of Milan who baptized Augustine."],
  [12,8,"Immaculate Conception of Mary","Solemnity","Mary conceived without sin; patroness of the United States.","O"],
  [12,9,"Juan Diego","Optional","Visionary of Guadalupe."],
  [12,11,"Damasus I","Optional","Pope who commissioned the Vulgate."],
  [12,12,"Our Lady of Guadalupe","Feast","Empress of the Americas; a feast in the Americas."],
  [12,13,"Lucy","Memorial","Virgin and martyr of Syracuse."],
  [12,14,"John of the Cross","Memorial","Mystic and Doctor; the Dark Night."],
  [12,21,"Peter Canisius","Optional","Second apostle of Germany; Doctor."],
  [12,23,"John of Kanty","Optional","Polish priest and professor."],
  [12,25,"Christmas","Solemnity","The Nativity of the Lord.","O"],
  [12,26,"Stephen","Feast","The first martyr."],
  [12,27,"John, Apostle and Evangelist","Feast","The beloved disciple."],
  [12,28,"Holy Innocents","Feast","The children of Bethlehem."],
  [12,29,"Thomas Becket","Optional","Archbishop martyred at Canterbury."],
  [12,31,"Sylvester I","Optional","Pope under Constantine."],
];

// ---------- lookups ----------
const RANK_WEIGHT = { Solemnity: 0, Sunday: 1, Feast: 2, Observance: 2, Memorial: 3, Optional: 4 };
export const FIXED = RAW.map(([m, d, name, rank, about, flags]) => ({ m, d, name, rank, about, obligation: flags === "O" }));

export function feastsOn(dt) {
  const { y, m, d } = parts(dt);
  const fixed = FIXED.filter((f) => f.m === m && f.d === d).map((f) => ({ ...f, y, movable: false }));
  const moved = movableFeasts(y).filter((f) => f.m === m && f.d === d);
  const all = [...fixed, ...moved];
  all.sort((a, b) => (RANK_WEIGHT[a.rank] ?? 5) - (RANK_WEIGHT[b.rank] ?? 5) || a.name.localeCompare(b.name));
  return all;
}

// Next `days` feast-days strictly after `dt` (today's own feasts are "today").
export function upcomingFeasts(dt, days = 10) {
  const out = [];
  const cursor = addDays(toDate(dt.getFullYear(), dt.getMonth() + 1, dt.getDate()), 1);
  for (let i = 0; i < 400 && out.length < days; i++) {
    const c = addDays(cursor, i);
    const items = feastsOn(c);
    if (items.length) {
      const p = parts(c);
      out.push({ ...p, inDays: i + 1, items });
    }
  }
  return out;
}

export const RANK_DOT = { Solemnity: "#b45309", Sunday: "#b45309", Feast: "#0095f6", Observance: "#8b5cf6", Memorial: "#16a34a", Optional: "#9ca3af" };



