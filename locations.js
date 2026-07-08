// DRIFT location catalogue.
// zoom is the arrival zoom; tz is an IANA timezone for the local clock;
// wiki is the English Wikipedia article title used by the intel panel.
// Mystery entries carry a dossier: { file, claim, lore, truth }.

window.PLACES = [
  // ---------------- Natural wonders ----------------
  { id: "grand-canyon", name: "Grand Canyon", region: "Arizona, USA", lat: 36.0997, lng: -112.1124, zoom: 12.3, tz: "America/Phoenix", wiki: "Grand Canyon", category: "wonder",
    blurb: "Two billion years of Earth's crust laid open by the Colorado River — the canyon is so large it makes its own weather." },
  { id: "sossusvlei", name: "Sossusvlei", region: "Namib Desert, Namibia", lat: -24.75, lng: 15.30, zoom: 12.5, tz: "Africa/Windhoek", wiki: "Sossusvlei", category: "wonder",
    blurb: "Rust-red dunes up to 380 m tall surround a white clay pan dotted with 900-year-old dead trees." },
  { id: "bora-bora", name: "Bora Bora", region: "French Polynesia", lat: -16.5004, lng: -151.7415, zoom: 12.8, tz: "Pacific/Tahiti", wiki: "Bora Bora", category: "wonder",
    blurb: "A drowned volcano wearing a turquoise lagoon — the barrier reef traces the ghost of the old crater rim." },
  { id: "mount-fuji", name: "Mount Fuji", region: "Honshu, Japan", lat: 35.3606, lng: 138.7274, zoom: 12, tz: "Asia/Tokyo", wiki: "Mount Fuji", category: "wonder",
    blurb: "Japan's sacred stratovolcano, so symmetrical it looks computer-generated from above. Last erupted in 1707." },
  { id: "vatnajokull", name: "Vatnajökull Outlets", region: "Iceland", lat: 64.016, lng: -16.966, zoom: 11, tz: "Atlantic/Reykjavik", wiki: "Vatnaj%C3%B6kull", category: "wonder",
    blurb: "Europe's largest ice cap spills glacier tongues toward the sea, braiding black volcanic sand with meltwater." },
  { id: "sundarbans", name: "The Sundarbans", region: "Bangladesh / India", lat: 21.95, lng: 89.18, zoom: 10.5, tz: "Asia/Dhaka", wiki: "Sundarbans", category: "wonder",
    blurb: "The largest mangrove forest on Earth, a fractal maze of tidal channels patrolled by swimming tigers." },
  { id: "uluru", name: "Uluru", region: "Northern Territory, Australia", lat: -25.3444, lng: 131.0369, zoom: 13.3, tz: "Australia/Darwin", wiki: "Uluru", category: "wonder",
    blurb: "A single sandstone monolith rising from dead-flat desert — most of it continues underground for kilometres." },
  { id: "santorini", name: "Santorini Caldera", region: "Greece", lat: 36.40, lng: 25.40, zoom: 12.3, tz: "Europe/Athens", wiki: "Santorini", category: "wonder",
    blurb: "The flooded crater of the Bronze-Age eruption that may have birthed the Atlantis legend. White villages cling to the rim." },
  { id: "whitsundays", name: "Whitsunday Islands", region: "Queensland, Australia", lat: -20.26, lng: 149.02, zoom: 11.8, tz: "Australia/Brisbane", wiki: "Whitsunday_Islands", category: "wonder",
    blurb: "Silica sand so pure it squeaks, swirling into the sea at Hill Inlet on the edge of the Great Barrier Reef." },
  { id: "salar-uyuni", name: "Salar de Uyuni", region: "Bolivia", lat: -20.25, lng: -67.50, zoom: 10.2, tz: "America/La_Paz", wiki: "Salar_de_Uyuni", category: "wonder",
    blurb: "10,000 km² of salt so flat satellites use it to calibrate their altimeters. After rain it becomes the world's largest mirror." },
  { id: "victoria-falls", name: "Victoria Falls", region: "Zambia / Zimbabwe", lat: -17.9244, lng: 25.8567, zoom: 13.5, tz: "Africa/Harare", wiki: "Victoria_Falls", category: "wonder",
    blurb: "The Zambezi drops into a crack in the Earth. Locals call it Mosi-oa-Tunya — 'the smoke that thunders.'" },
  { id: "lake-natron", name: "Lake Natron", region: "Tanzania", lat: -2.416, lng: 36.045, zoom: 10.5, tz: "Africa/Dar_es_Salaam", wiki: "Lake_Natron", category: "wonder",
    blurb: "A caustic soda lake that runs blood-red with salt-loving microbes and calcifies anything that dies in it." },
  { id: "dallol", name: "Dallol", region: "Danakil Depression, Ethiopia", lat: 14.2417, lng: 40.30, zoom: 13, tz: "Africa/Addis_Ababa", wiki: "Dallol_(hydrothermal_system)", category: "wonder",
    blurb: "Acid pools in neon green and yellow, 125 m below sea level, in the hottest inhabited place on the planet." },
  { id: "grand-prismatic", name: "Grand Prismatic Spring", region: "Wyoming, USA", lat: 44.5251, lng: -110.8382, zoom: 14.5, tz: "America/Denver", wiki: "Grand_Prismatic_Spring", category: "wonder",
    blurb: "A rainbow-ringed hot spring bigger than a football field, sitting on top of a supervolcano." },
  { id: "ha-long", name: "Hạ Long Bay", region: "Vietnam", lat: 20.9101, lng: 107.1839, zoom: 11.5, tz: "Asia/Ho_Chi_Minh", wiki: "H%E1%BA%A1_Long_Bay", category: "wonder",
    blurb: "Nearly 2,000 limestone towers scattered across an emerald bay — legend says a dragon spat them out as jade." },
  { id: "amazon-meanders", name: "Purus River Meanders", region: "Amazonas, Brazil", lat: -5.5, lng: -64.0, zoom: 10, tz: "America/Manaus", wiki: "Purus_River", category: "wonder",
    blurb: "One of the crookedest rivers on Earth, doodling oxbow lakes across the rainforest for 3,000 km." },
  { id: "cappadocia", name: "Cappadocia", region: "Türkiye", lat: 38.6431, lng: 34.8289, zoom: 13.3, tz: "Europe/Istanbul", wiki: "Cappadocia", category: "wonder",
    blurb: "Volcanic rock eroded into fairy chimneys, honeycombed with cave churches and cities that burrow ten storeys down." },

  // ---------------- Human marks ----------------
  { id: "palm-jumeirah", name: "Palm Jumeirah", region: "Dubai, UAE", lat: 25.1124, lng: 55.1390, zoom: 13.2, tz: "Asia/Dubai", wiki: "Palm_Jumeirah", category: "human",
    blurb: "A palm tree the size of a city, sprayed into the Persian Gulf from 120 million cubic metres of dredged sand." },
  { id: "world-islands", name: "The World Islands", region: "Dubai, UAE", lat: 25.221, lng: 55.172, zoom: 13, tz: "Asia/Dubai", wiki: "The_World_(archipelago)", category: "human",
    blurb: "An artificial map of the world off the Dubai coast — mostly empty since 2008, and rumoured to be slowly sinking." },
  { id: "venice", name: "Venice", region: "Italy", lat: 45.438, lng: 12.3358, zoom: 13.8, tz: "Europe/Rome", wiki: "Venice", category: "human",
    blurb: "A fish-shaped city standing on ten million wooden piles driven into a lagoon fifteen centuries ago." },
  { id: "manhattan", name: "Manhattan & Central Park", region: "New York, USA", lat: 40.7812, lng: -73.9665, zoom: 13.3, tz: "America/New_York", wiki: "Central_Park", category: "human",
    blurb: "A perfect green rectangle carved out of the world's most expensive grid — visible from orbit as a hole in the city." },
  { id: "machu-picchu", name: "Machu Picchu", region: "Peru", lat: -13.1631, lng: -72.5450, zoom: 14.8, tz: "America/Lima", wiki: "Machu_Picchu", category: "human",
    blurb: "An Inca royal estate strung along a knife-edge ridge at 2,430 m, invisible from the valley below." },
  { id: "niagara", name: "Niagara Falls", region: "Canada / USA", lat: 43.0782, lng: -79.0758, zoom: 14.3, tz: "America/Toronto", wiki: "Niagara_Falls", category: "human",
    blurb: "Three waterfalls wrapped in two cities — at night, engineers quietly divert half the river into power tunnels." },
  { id: "bingham", name: "Bingham Canyon Mine", region: "Utah, USA", lat: 40.523, lng: -112.151, zoom: 13.2, tz: "America/Denver", wiki: "Bingham_Canyon_Mine", category: "human",
    blurb: "The deepest open-pit mine on Earth — a man-made crater 1.2 km deep that has been eating a mountain since 1906." },
  { id: "eixample", name: "The Eixample", region: "Barcelona, Spain", lat: 41.3915, lng: 2.1650, zoom: 14.3, tz: "Europe/Madrid", wiki: "Eixample", category: "human",
    blurb: "Ildefons Cerdà's 1859 grid of chamfered octagons, designed around sunlight and ventilation. Still hypnotic from above." },
  { id: "pivot-fields", name: "Desert Crop Circles", region: "Al Jawf, Saudi Arabia", lat: 30.32, lng: 38.45, zoom: 11, tz: "Asia/Riyadh", wiki: "Center-pivot_irrigation", category: "human",
    blurb: "Thousands of perfect green discs stamped onto the desert — centre-pivot irrigation mining fossil water from beneath the sand." },
  { id: "male", name: "Malé", region: "Maldives", lat: 4.1755, lng: 73.5093, zoom: 13.5, tz: "Indian/Maldives", wiki: "Mal%C3%A9", category: "human",
    blurb: "An entire capital city filled edge-to-edge on a coral island 2.4 km long, barely a metre above the sea." },
  { id: "yuanyang", name: "Honghe Rice Terraces", region: "Yunnan, China", lat: 23.09, lng: 102.75, zoom: 12.8, tz: "Asia/Shanghai", wiki: "Honghe_Hani_Rice_Terraces", category: "human",
    blurb: "1,300 years of hand-carved terraces cascading 2,000 m down the mountains, flooded into mirrors each winter." },
  { id: "mont-saint-michel", name: "Mont-Saint-Michel", region: "Normandy, France", lat: 48.6361, lng: -1.5115, zoom: 14.5, tz: "Europe/Paris", wiki: "Mont-Saint-Michel", category: "human",
    blurb: "An abbey-crowned tidal island where the sea rushes in 'at the speed of a galloping horse.'" },
  { id: "bagan", name: "Bagan", region: "Myanmar", lat: 21.1717, lng: 94.8585, zoom: 13.3, tz: "Asia/Yangon", wiki: "Bagan", category: "human",
    blurb: "Over 2,000 surviving temples scattered across a dusty plain — the skyline of an 11th-century superpower." },
  { id: "angkor", name: "Angkor Wat", region: "Cambodia", lat: 13.4125, lng: 103.867, zoom: 13.8, tz: "Asia/Phnom_Penh", wiki: "Angkor_Wat", category: "human",
    blurb: "The largest religious monument ever built, ringed by a moat that has kept its foundations wet — and standing — for 900 years." },
  { id: "rio", name: "Rio de Janeiro", region: "Brazil", lat: -22.96, lng: -43.17, zoom: 12.8, tz: "America/Sao_Paulo", wiki: "Rio_de_Janeiro", category: "human",
    blurb: "A city poured between granite domes and the Atlantic, where the forest still runs straight through downtown." },
  { id: "pripyat", name: "Pripyat", region: "Ukraine", lat: 51.4045, lng: 30.0542, zoom: 13.5, tz: "Europe/Kyiv", wiki: "Pripyat", category: "human",
    blurb: "A city of 49,000 abandoned in a single afternoon in 1986. The forest has been taking it back ever since." },
  { id: "shibuya", name: "Shibuya", region: "Tokyo, Japan", lat: 35.6595, lng: 139.7005, zoom: 14.8, tz: "Asia/Tokyo", wiki: "Shibuya", category: "human",
    blurb: "Home of the world's busiest pedestrian crossing — up to 3,000 people per green light, dissolving into ordered chaos." },
  { id: "palmanova", name: "Palmanova", region: "Italy", lat: 45.9054, lng: 13.3090, zoom: 14.3, tz: "Europe/Rome", wiki: "Palmanova", category: "human",
    blurb: "A perfect nine-pointed star fortress town, built by Venice in 1593 as a Renaissance utopia. Nobody wanted to live in it." },
  { id: "almeria", name: "The Sea of Plastic", region: "Almería, Spain", lat: 36.776, lng: -2.813, zoom: 12, tz: "Europe/Madrid", wiki: "El_Ejido", category: "human",
    blurb: "40,000 hectares of greenhouses so bright and white they measurably cool the local climate. Europe's winter vegetables come from here." },

  // ---------------- Mystery files ----------------
  { id: "area-51", name: "Area 51", region: "Nevada, USA", lat: 37.235, lng: -115.8111, zoom: 12.8, tz: "America/Los_Angeles", wiki: "Area_51", category: "mystery",
    blurb: "The most famous secret base on Earth.",
    dossier: {
      file: "CF-001",
      claim: "Crashed flying saucers from Roswell are stored and reverse-engineered here, in hangars dug into Papoose Mountain.",
      lore: "The CIA didn't acknowledge the base existed until 2013. Employees commute on unmarked 'Janet' flights from a private Las Vegas terminal. The airspace above is the most restricted in America, and physicist Bob Lazar's 1989 claims about 'Element 115' launched the modern UFO mythos.",
      truth: "Declassified documents show it was built to test the U-2 and A-12 spy planes — aircraft so unusual they generated many of the era's UFO reports themselves. Whatever flies here now is classified, which keeps the legend fed."
    } },
  { id: "richat", name: "Richat Structure", region: "Mauritania", lat: 21.124, lng: -11.401, zoom: 10.3, tz: "Africa/Nouakchott", wiki: "Richat_Structure", category: "mystery",
    blurb: "The Eye of the Sahara.",
    dossier: {
      file: "CF-002",
      claim: "This 40 km bullseye in the desert is the ruins of Atlantis — its concentric rings matching Plato's description of the city's circular harbours.",
      lore: "Astronauts have used the Eye as a landmark since the Gemini missions. Atlantis theorists point out Plato's dimensions for the city (23 stadia) roughly match the structure's diameter, and that it sits near ancient shorelines.",
      truth: "Geologists identify it as an eroded dome of layered rock — no artefacts, walls, or worked stone have ever been found. It's arguably stranger than Atlantis: a 100-million-year wound in the crust that never became a volcano."
    } },
  { id: "marree-man", name: "Marree Man", region: "South Australia", lat: -29.532, lng: 137.468, zoom: 12.5, tz: "Australia/Adelaide", wiki: "Marree_Man", category: "mystery",
    blurb: "A 2.7 km figure nobody admits to drawing.",
    dossier: {
      file: "CF-003",
      claim: "The largest geoglyph on Earth appeared overnight in 1998 — and no one has ever claimed it.",
      lore: "The figure of a hunter was discovered by a charter pilot in June 1998. Anonymous faxes tipped off hotels, a buried plaque referenced an American flag, and a satellite phone was found nearby. Theories name US airmen, local artists, even the artist Bardius Goldberg — who neither confirmed nor denied before his death.",
      truth: "Still officially unsolved. Whoever did it needed GPS, a tractor plough, and total secrecy across weeks of work — a conspiracy that actually happened, just probably a mundane one."
    } },
  { id: "nazca", name: "Nazca Lines", region: "Peru", lat: -14.739, lng: -75.13, zoom: 13.5, tz: "America/Lima", wiki: "Nazca_Lines", category: "mystery",
    blurb: "Drawings meant to be seen from above, made by people who couldn't fly.",
    dossier: {
      file: "CF-004",
      claim: "Runways and signals for ancient astronauts — Erich von Däniken's 'Chariots of the Gods' made these lines the founding text of alien-visitor theory.",
      lore: "Hundreds of figures — a hummingbird, a monkey, a 'spaceman' waving from a hillside — drawn between 500 BCE and 500 CE, some only fully visible from altitude. New figures are still being found by drone survey today.",
      truth: "The Nazca made them by removing dark surface stones to expose pale ground — a technique you can replicate with rope and stakes. Most likely processional paths and offerings to water gods. Still: they made art for a viewpoint they would never reach."
    } },
  { id: "bermuda-triangle", name: "Bermuda Triangle", region: "North Atlantic", lat: 25.0, lng: -71.0, zoom: 6.2, tz: "America/New_York", wiki: "Bermuda_Triangle", category: "mystery",
    blurb: "Half a million square miles of ocean with a reputation.",
    dossier: {
      file: "CF-005",
      claim: "Ships and aircraft vanish here without trace — Flight 19, the USS Cyclops, dozens more — taken by methane eruptions, magnetic anomalies, or something else.",
      lore: "The legend ignited in 1964 over Flight 19: five Navy bombers lost in 1945, followed by the rescue plane sent after them. The Cyclops disappeared in 1918 with 309 souls and no distress call — still the US Navy's largest non-combat loss of life.",
      truth: "Lloyd's of London and the US Coast Guard both find loss rates here statistically normal for such heavily trafficked, storm-prone water. The triangle's real power is that nobody can quite stop looking at it."
    } },
  { id: "dia", name: "Denver International Airport", region: "Colorado, USA", lat: 39.8617, lng: -104.6731, zoom: 13.2, tz: "America/Denver", wiki: "Denver_International_Airport", category: "mystery",
    blurb: "The airport that leans into it.",
    dossier: {
      file: "CF-006",
      claim: "A secret bunker complex beneath the terminals — HQ for the New World Order, marked by masonic plaques, apocalyptic murals, and a demonic blue horse.",
      lore: "It opened 16 months late and $2 billion over budget ('for the tunnels'). The dedication stone really is masonic. The murals really do depict a gas-masked figure with a sword. 'Blucifer,' the 32-foot demon horse, really did kill its own sculptor when a section fell on him.",
      truth: "The tunnels are a failed automated-baggage system; the murals are anti-war art. The airport now sells NWO-themed merchandise and puts up talking-gargoyle installations — the rare conspiracy subject that decided to become its own gift shop."
    } },
  { id: "north-sentinel", name: "North Sentinel Island", region: "Andaman Islands, India", lat: 11.5578, lng: 92.2411, zoom: 12.3, tz: "Asia/Kolkata", wiki: "North_Sentinel_Island", category: "mystery",
    blurb: "The island the modern world is forbidden to touch.",
    dossier: {
      file: "CF-007",
      claim: "Not a conspiracy — a genuine blank spot. The Sentinelese have refused all contact for thousands of years, and India enforces a 5-nautical-mile exclusion zone with patrol boats.",
      lore: "Arrows met National Geographic in 1974, helicopters after the 2004 tsunami, and a missionary in 2018. Almost nothing is known: not their language, their numbers, nor what they call themselves.",
      truth: "The exclusion zone exists to protect them — they have no immunity to modern pathogens. This satellite view is, legally and ethically, as close as anyone gets."
    } },
  { id: "sandy-island", name: "Sandy Island", region: "Coral Sea", lat: -19.2167, lng: 159.9333, zoom: 9.8, tz: "Pacific/Noumea", wiki: "Sandy_Island,_New_Caledonia", category: "mystery",
    blurb: "You are looking at an island that does not exist.",
    dossier: {
      file: "CF-008",
      claim: "A 24 km island charted here for over a century — on Admiralty charts, world atlases, and Google Maps — until a ship sailed to it in 2012 and found 1,400 m of open water.",
      lore: "Likely born from a whaling ship's 1876 sighting of a pumice raft, Sandy Island survived every audit for 136 years because each map quietly copied the last. Cartographers call these 'phantom islands' — and some may still be out there.",
      truth: "Officially 'undiscovered' by an Australian survey vessel in November 2012 and deleted from the databases. The ocean floor here is 1,400 m down. The map was never the territory."
    } },
  { id: "haarp", name: "HAARP", region: "Gakona, Alaska", lat: 62.39, lng: -145.15, zoom: 13.8, tz: "America/Anchorage", wiki: "High-frequency_Active_Auroral_Research_Program", category: "mystery",
    blurb: "180 antennas in the Alaskan wilderness.",
    dossier: {
      file: "CF-009",
      claim: "A weather-control weapon. Or an earthquake machine. Or a mind-control array. HAARP has been blamed for hurricanes, floods, and the hum in people's ears.",
      lore: "Built by the Air Force and DARPA to fire 3.6 megawatts of radio energy into the ionosphere, it can create artificial auroras — a genuinely sci-fi capability that made every theory feel plausible. A Russian military journal once accused it of being able to 'flip Earth's magnetic poles.'",
      truth: "It heats a patch of upper atmosphere the way a match heats a swimming pool — the beam's energy is billions of times weaker than a thunderstorm's. Now run by a university, it holds open-house days where you can walk among the antennas."
    } },
  { id: "steppe-geoglyphs", name: "Ushtogay Square", region: "Turgai, Kazakhstan", lat: 50.8319, lng: 65.3251, zoom: 13.8, tz: "Asia/Almaty", wiki: "Steppe_Geoglyphs", category: "mystery",
    blurb: "Earthworks visible only from space, found by a man browsing Google Earth.",
    dossier: {
      file: "CF-010",
      claim: "Dozens of giant geometric figures — squares, crosses, rings — mounded onto the Kazakh steppe by an unknown culture, possibly 8,000 years ago.",
      lore: "Amateur archaeologist Dmitriy Dey spotted them in 2007 while scanning satellite imagery at home. The Ushtogay Square is 101 mounds forming a shape bigger than the Great Pyramid's footprint. NASA photographed them from the ISS to help date them.",
      truth: "Genuinely under-explained. If the earliest dating holds, a supposedly nomadic culture organised massive coordinated labour millennia before it 'should' have been possible. This one is a real open case."
    } },
  { id: "badlands-guardian", name: "Badlands Guardian", region: "Alberta, Canada", lat: 50.0106, lng: -110.1130, zoom: 14.3, tz: "America/Edmonton", wiki: "Badlands_Guardian", category: "mystery",
    blurb: "The Earth wearing a face.",
    dossier: {
      file: "CF-011",
      claim: "A vast carved portrait of an Indigenous leader wearing a headdress — and, apparently, earbuds.",
      lore: "Found by a grandmother browsing Google Earth in 2006. The head is 255 m across and uncannily detailed; the 'earbud' cord runs perfectly to the ear.",
      truth: "Pure pareidolia, and better for it: the face is rain-eroded badland, and the earbud is a gas well and its access road. No one carved anything — your brain did all the work just now."
    } },
  { id: "kola", name: "Kola Superdeep Borehole", region: "Murmansk, Russia", lat: 69.3963, lng: 30.6094, zoom: 14.3, tz: "Europe/Moscow", wiki: "Kola_Superdeep_Borehole", category: "mystery",
    blurb: "The deepest hole humans ever dug, welded shut.",
    dossier: {
      file: "CF-012",
      claim: "The 'Well to Hell' — Soviet drillers at 12 km supposedly broke into a cavity and lowered a microphone that recorded the screams of the damned.",
      lore: "The screams tape has circulated since 1989 (it appears to be a looped horror-film soundtrack). The real hole is 12,262 m deep but only 23 cm wide, capped by a rusted plate you could step over without noticing.",
      truth: "What they actually found was weirder than hell: rock plasticised by heat that ate drill bits, water where none should exist, and microscopic plankton fossils from 2 billion years ago, two-thirds of the way to the mantle... and we still got less than 0.2% of the way to the centre."
    } },
  { id: "shasta", name: "Mount Shasta", region: "California, USA", lat: 41.4092, lng: -122.1949, zoom: 11.3, tz: "America/Los_Angeles", wiki: "Mount_Shasta", category: "mystery",
    blurb: "The volcano with a city inside, allegedly.",
    dossier: {
      file: "CF-013",
      claim: "Survivors of the lost continent of Lemuria live in a crystal city called Telos inside the mountain, emerging occasionally in white robes.",
      lore: "The legend began with an 1880s teenager's novel and an 1930s mining engineer who said a Lemurian invited him inside. The town below now hosts ascension retreats, and believers gather each year to await the 'Telosians.'",
      truth: "Geologically it's one of the Cascades' most dangerous stratovolcanoes, which erupts every 600-800 years. The 'mysterious lights' on its flanks are usually lenticular clouds — which, to be fair, do look exactly like cloaked motherships."
    } },
  { id: "skinwalker", name: "Skinwalker Ranch", region: "Utah, USA", lat: 40.258, lng: -109.888, zoom: 13.8, tz: "America/Denver", wiki: "Skinwalker_Ranch", category: "mystery",
    blurb: "The ranch the Pentagon actually studied.",
    dossier: {
      file: "CF-014",
      claim: "512 acres of UFOs, cattle mutilations, bulletproof wolves, and portals — cursed, per legend, by a Navajo skinwalker.",
      lore: "Aerospace billionaire Robert Bigelow bought the ranch in 1996 and stationed scientists on it. From 2008-2010, a real Pentagon program (AAWSAP) spent $22 million investigating reports here, out of a Las Vegas contractor.",
      truth: "The declassified paper trail is real even if the phenomena aren't: government money did fund paranormal research here. Skeptics note two decades of surveillance produced no verifiable evidence — but the ranch now stars in its own reality show, so the incentives have... evolved."
    } },
  { id: "mapimi", name: "Zone of Silence", region: "Durango, Mexico", lat: 26.691, lng: -103.745, zoom: 11, tz: "America/Mexico_City", wiki: "Mapim%C3%AD_Silent_Zone", category: "mystery",
    blurb: "The desert where radios allegedly die.",
    dossier: {
      file: "CF-015",
      claim: "A patch of Chihuahuan desert where radio signals fail, compasses spin, and meteorites fall with suspicious frequency — Mexico's Bermuda Triangle.",
      lore: "In 1970 a US Athena rocket carrying two small cobalt-57 canisters went off course from Utah and crashed here. The Air Force recovery operation — trucks, aircraft, a purpose-built rail spur in the desert — convinced locals something extraordinary had landed.",
      truth: "Radios work fine; researchers have tested repeatedly. But the crash was real, the cleanup was real, and the zone sits inside a genuine biosphere reserve full of endemic species — a true anomaly, just a biological one."
    } },
  { id: "diego-garcia", name: "Diego Garcia", region: "Chagos Archipelago", lat: -7.3195, lng: 72.4229, zoom: 11.8, tz: "Indian/Chagos", wiki: "Diego_Garcia", category: "mystery",
    blurb: "The atoll you cannot visit.",
    dossier: {
      file: "CF-016",
      claim: "A footprint-shaped atoll hosting one of the most secretive military bases on Earth — named in theories about renditions, black sites, and vanished airliners.",
      lore: "No journalists, no tourists, no civilian flights. US Senate reports later confirmed rendition flights did refuel here in the 2000s — one theory that turned out to have a kernel of truth.",
      truth: "The documented history needs no embellishment: between 1968 and 1973, the entire Chagossian population was deported to make way for the base — a fact Britain spent decades litigating and only recently began to unwind."
    } },
  { id: "bohemian-grove", name: "Bohemian Grove", region: "California, USA", lat: 38.4665, lng: -123.0053, zoom: 13.8, tz: "America/Los_Angeles", wiki: "Bohemian_Grove", category: "mystery",
    blurb: "The forest where the powerful go to camp.",
    dossier: {
      file: "CF-017",
      claim: "Every July, presidents, bankers, and CEOs gather under the redwoods for the 'Cremation of Care' — a robed ritual before a 40-foot stone owl — and, theorists say, to plan the world's next decade.",
      lore: "Real attendees have included every Republican president since Coolidge. The Manhattan Project was reportedly first sketched at a Grove gathering in 1942. Alex Jones infiltrated it with a hidden camera in 2000 and turned the footage into a founding text of modern conspiracism.",
      truth: "The ritual is real but by all sober accounts is theatre — a Victorian gentlemen's club burning an effigy of 'dull care' before two weeks of drinking. Which is either reassuring or worse, depending on your priors."
    } },
  { id: "giza", name: "Great Pyramids of Giza", region: "Egypt", lat: 29.9773, lng: 31.1325, zoom: 14.2, tz: "Africa/Cairo", wiki: "Giza_pyramid_complex", category: "mystery",
    blurb: "The last ancient wonder still standing.",
    dossier: {
      file: "CF-018",
      claim: "Too precise for the Bronze Age: aligned to true north within 0.05°, encoding pi and the speed of light, built by Atlanteans or visitors — take your pick.",
      lore: "In 2017, physicists using cosmic-ray muons found a genuine sealed void above the Grand Gallery, 30 m long, purpose unknown. It's still unopened. The precision engineering questions are real enough that Egyptology keeps having to answer them.",
      truth: "Workers' villages, bakeries, and payroll records (in beer) have all been excavated — built by paid Egyptian crews across ~20 years. The muon void is the honest mystery: we found a hidden room in the most studied building on Earth, this decade."
    } },
  { id: "coral-castle", name: "Coral Castle", region: "Florida, USA", lat: 25.5003, lng: -80.4444, zoom: 16.2, tz: "America/New_York", wiki: "Coral_Castle", category: "mystery",
    blurb: "1,100 tons of stone, moved by one man, alone, at night.",
    dossier: {
      file: "CF-019",
      claim: "Edward Leedskalnin, 5-foot-nothing and 100 pounds, quarried and set megalithic blocks single-handedly — using, he hinted, 'the secret of the pyramids.' Theorists say anti-gravity or magnetic resonance.",
      lore: "He worked only in darkness for 28 years and let no one watch. A 9-ton gate was balanced so perfectly a child could push it open with one finger. When teenagers claimed they saw blocks 'float like hydrogen balloons,' the legend was complete.",
      truth: "Photographs show tripods, winches, and block-and-tackle — Leedskalnin was a gifted mason applying leverage with fanatical patience. The 9-ton gate's secret was a truck bearing at its centre of mass; when it seized in 1986, it took a crane and six men to fix what one Latvian had built alone."
    } },
];
