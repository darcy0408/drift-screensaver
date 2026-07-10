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
  { id: "palmanova", name: "Palmanova", region: "Italy", lat: 45.9054, lng: 13.3090, zoom: 14.3, tz: "Europe/Rome", wiki: "Palmanova", category: "mystery",
    blurb: "A perfect nine-pointed star fortress town, built by Venice in 1593 as a Renaissance utopia. Nobody wanted to live in it.",
    dossier: {
      file: "CF-020",
      claim: "The poster child of 'Tartaria' theory: star cities this geometrically perfect weren't built by people with shovels — they're inherited infrastructure from an erased worldwide civilization.",
      lore: "Search any star fort online and you'll find the same question: why does this exact radial design appear on every continent? Theorists say the forts are 'energy machines' aligned to a lost grid, their true builders scrubbed from history in the 1800s.",
      truth: "The shape is just geometry doing its job: after cannons made high walls obsolete, low angled bastions let defenders cover every inch of wall with crossfire — and the design spread worldwide because the same European military engineers were hired everywhere. Venice's archives hold Palmanova's invoices. Utopia still needed paying."
    } },
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
  // ---------------- Star forts & the Tartaria file ----------------
  { id: "bourtange", name: "Fort Bourtange", region: "Groningen, Netherlands", lat: 53.0066, lng: 7.1927, zoom: 15.8, tz: "Europe/Amsterdam", wiki: "Fort_Bourtange", category: "mystery",
    blurb: "The most photogenic star fort on Earth, moats and all.",
    dossier: {
      file: "CF-021",
      claim: "A five-pointed 'energy node' too intricate for 1593 peat-bog engineering — restored, theorists note, a little too lovingly, as if someone wanted a working example kept on display.",
      lore: "Bourtange guards a sand ridge through an impassable swamp. Star-fort channels claim the water geometry is functional in ways cartography never explains — resonance, power, preservation.",
      truth: "It's a textbook bastion fort on the only dry road to Germany, besieged, obsolete by 1851, farmed over, then rebuilt to its 1742 drawings in the 1960s as an open-air museum. The restoration blueprints are the anti-mystery: every angle survives on paper."
    } },
  { id: "neuf-brisach", name: "Neuf-Brisach", region: "Alsace, France", lat: 48.0175, lng: 7.5278, zoom: 14.6, tz: "Europe/Paris", wiki: "Neuf-Brisach", category: "mystery",
    blurb: "Vauban's final masterpiece — a perfect octagonal star city.",
    dossier: {
      file: "CF-022",
      claim: "An eight-fold mandala stamped onto the Rhine plain, allegedly 'found, not founded' — Tartaria lore says towns like this predate the kings who claimed them.",
      lore: "It is uncannily perfect from above: an octagon within a star within a star. Believers ask why a 'primitive' age built with laser symmetry while our era builds cul-de-sacs.",
      truth: "Louis XIV lost Breisach across the river in 1697 and ordered his engineer Vauban to replace it; the plans, budget fights, and construction letters (1698-1703) all survive. The symmetry is siege mathematics — UNESCO lists it as the swan song of a documented, named, salaried genius."
    } },
  { id: "naarden", name: "Naarden", region: "Netherlands", lat: 52.2957, lng: 5.1614, zoom: 14.6, tz: "Europe/Amsterdam", wiki: "Naarden", category: "mystery",
    blurb: "A living town inside a double-moated six-pointed star.",
    dossier: {
      file: "CF-023",
      claim: "Twelve perfect points of land and water that theorists say no horse-and-cart society could survey, let alone dig.",
      lore: "Naarden is the internet's favorite 'impossible' aerial: two concentric star moats, still intact, still inhabited. The mudflood crowd points out the fortifications' lower levels sit half-buried — 'excavated, not built.'",
      truth: "Half-buried is the design: a bastion's earthen mass IS the armor, and Dutch engineers were the world's best at moving mud on purpose. Rebuilt after the Spanish massacre of 1572, it stayed a garrison town into the 1920s — the Dutch army's own archives map every shovelful."
    } },
  { id: "fort-jefferson", name: "Fort Jefferson", region: "Dry Tortugas, Florida, USA", lat: 24.6285, lng: -82.8732, zoom: 15.3, tz: "America/New_York", wiki: "Fort_Jefferson_(Florida)", category: "mystery",
    blurb: "Sixteen million bricks on a sandbar seventy miles from anywhere.",
    dossier: {
      file: "CF-024",
      claim: "The largest brick building in the Americas, on a waterless island in the open Gulf — theorists ask how, why, and whether anyone actually saw it built.",
      lore: "No fresh water, no stone, no timber, hurricane alley — and somebody stacked 16 million bricks into a perfect hexagon there. Star-fort channels call it the clearest case of 'inherited' architecture in North America.",
      truth: "Thirty years of construction records, supply-ship manifests, and prisoner-labor rolls say otherwise — Dr. Samuel Mudd, jailed for the Lincoln assassination, did his time here. It was obsolete before it was finished, which is somehow the most 19th-century-government detail of all."
    } },
  { id: "kastellet", name: "Kastellet", region: "Copenhagen, Denmark", lat: 55.6910, lng: 12.5939, zoom: 15.3, tz: "Europe/Copenhagen", wiki: "Kastellet,_Copenhagen", category: "mystery",
    blurb: "A pentagram citadel hiding in plain sight in a capital city.",
    dossier: {
      file: "CF-025",
      claim: "A five-pointed star at the heart of a European capital — occult geometry, say the theorists, guarding whatever Copenhagen's founders buried beneath it.",
      lore: "It's still a working military site, which keeps the lore warm: manicured, moated, and never explained to tourists beyond a plaque or two.",
      truth: "Built 1662-64 after Sweden besieged the city; the pentagon is, again, crossfire geometry. The most classified thing inside today is the Danish Defence Intelligence Service's office furniture."
    } },
  { id: "almeida", name: "Almeida", region: "Portugal", lat: 40.7260, lng: -6.9070, zoom: 14.8, tz: "Europe/Lisbon", wiki: "Almeida,_Portugal", category: "mystery",
    blurb: "A twelve-pointed star village on the Spanish frontier.",
    dossier: {
      file: "CF-026",
      claim: "Twelve points, twelve 'resonant chambers' — Iberian star forts feature heavily in maps of the supposed worldwide energy grid.",
      lore: "In 1810 the fort's cathedral — used as the powder magazine — detonated and erased half the town in one flash. Lore reads the crater as evidence of 'directed energy'; historians read it as 4,000 barrels of gunpowder and one French shell.",
      truth: "The explosion is among the best-documented disasters of the Peninsular War, witnessed by two armies. The star survives because the frontier moved on and nobody needed the land — Portugal's border bristles with sister forts nobody bothered to demolish."
    } },
  { id: "goryokaku", name: "Goryōkaku", region: "Hakodate, Japan", lat: 41.7967, lng: 140.7570, zoom: 15, tz: "Asia/Tokyo", wiki: "Gory%C5%8Dkaku", category: "mystery",
    blurb: "Japan's star fort, drawn in cherry blossoms every spring.",
    dossier: {
      file: "CF-027",
      claim: "The same five-pointed geometry as Europe's forts, on the opposite side of the planet, in a country that was closed to foreigners — Tartaria channels call it the smoking gun of a single global builder.",
      lore: "It even hosted the death of a nation: the breakaway Republic of Ezo made its last stand here in 1869, samurai defending a Renaissance star fort with rifles.",
      truth: "The 'closed country' hired the design: Japanese scholar Takeda Ayasaburō worked from smuggled Dutch military texts — Vauban's geometry arriving by book, not by empire. Same math, same answer; that's why the shapes rhyme worldwide."
    } },
  { id: "fort-mchenry", name: "Fort McHenry", region: "Baltimore, USA", lat: 39.2632, lng: -76.5797, zoom: 15.3, tz: "America/New_York", wiki: "Fort_McHenry", category: "mystery",
    blurb: "The star fort inside the American anthem.",
    dossier: {
      file: "CF-028",
      claim: "America's most famous star — and, per the lore, proof the young republic 'found' fortifications it could never have financed.",
      lore: "Its five points watched the 1814 British bombardment that produced The Star-Spangled Banner; theorists enjoy that the anthem literally celebrates a star fort surviving 'the rockets' red glare.'",
      truth: "Construction ledgers from 1798-1800 name the French engineer (Jean Foncin), the budget ($233,000), and the bricks. The star shape and the flag's stars are a poetic coincidence — the fort was named for a Secretary of War, not a constellation."
    } },
  { id: "seattle-underground", name: "Seattle Underground", region: "Washington, USA", lat: 47.6021, lng: -122.3341, zoom: 15.5, tz: "America/Los_Angeles", wiki: "Seattle_Underground", category: "mystery",
    blurb: "A city walking on the roofs of its former self.",
    dossier: {
      file: "CF-029",
      claim: "Exhibit A of the 'mudflood': entire ground floors buried under feet of soil worldwide, windows peeking from sidewalks — evidence, theorists say, of a cataclysm history forgot.",
      lore: "Under Pioneer Square the old storefronts genuinely exist — doorways, glass, signage — one storey down in the dark. Tours walk it daily. If one city is buried, the lore asks, how many others are?",
      truth: "Seattle burned in 1889 and the city used the rebuild to fix a sewage-flooding problem by raising street level a full storey; owners kept trading from their old ground floors while the new sidewalks were bridged overhead. Buried first floors elsewhere usually have the same boring parents: regrades, fires, and floods — one city at a time, all on record."
    } },
  { id: "palace-fine-arts", name: "Palace of Fine Arts", region: "San Francisco, USA", lat: 37.8029, lng: -122.4484, zoom: 15.5, tz: "America/Los_Angeles", wiki: "Palace_of_Fine_Arts", category: "mystery",
    blurb: "The survivor of a vanished white city.",
    dossier: {
      file: "CF-030",
      claim: "World's fairs are the heart of Tartaria theory: entire marble metropolises 'built' in months, photographed, then demolished — because, the claim goes, they were never built at all, only found and then destroyed to hide the evidence.",
      lore: "The 1915 Panama-Pacific Exposition covered 635 acres with domes and colonnades, then erased itself within a year. This rotunda is the lone survivor, and it does look older than the automobile.",
      truth: "The fairs were built fast because they were fake: plaster and burlap over wood frames, architectural stage sets never meant to survive a winter. This palace melted in the rain for decades until San Francisco recast it in concrete in the 1960s because people loved the ruin too much to lose it."
    } },
  { id: "jackson-park", name: "Jackson Park — the White City", region: "Chicago, USA", lat: 41.7827, lng: -87.5806, zoom: 13.8, tz: "America/Chicago", wiki: "World%27s_Columbian_Exposition", category: "mystery",
    blurb: "Six hundred acres where a dream city stood for six months.",
    dossier: {
      file: "CF-031",
      claim: "The 1893 White City: 200 palaces, canals, and golden domes on a swamp in three years — then gone. Tartaria's favorite 'demolition of the old world.'",
      lore: "Fourteen million more people visited it than lived in the entire city hosting it. Photos show an imperial capital; today there's parkland and one building. The lore writes itself.",
      truth: "Staff plaster again — 'staff' is literally the material's name — sprayed white over timber sheds by 40,000 documented workers. Most of it burned or was scrapped within three years, as planned. The one building made of real stone is still there: it's the Museum of Science and Industry."
    } },
  { id: "derinkuyu", name: "Derinkuyu", region: "Cappadocia, Türkiye", lat: 38.3735, lng: 34.7351, zoom: 15, tz: "Europe/Istanbul", wiki: "Derinkuyu_underground_city", category: "mystery",
    blurb: "An eighteen-storey city, straight down.",
    dossier: {
      file: "CF-032",
      claim: "A city for 20,000 people carved 85 metres underground — with ventilation, wineries, and half-ton rolling stone doors — by people history says had iron picks and oil lamps. Ancient-astronaut lore says otherwise.",
      lore: "A homeowner found it in 1963 by knocking down a basement wall. Tunnels connect it to other underground cities kilometres away, and nobody knows how many remain unfound.",
      truth: "The soft volcanic tuff carves like hard cheese and self-hardens in air — locals cut new rooms within living memory. Built up in layers from Phrygian times through Byzantine sieges, it's astonishing, but it's astonishing human patience: the region has 200+ smaller versions, a whole culture of digging."
    } },
  { id: "sacsayhuaman", name: "Sacsayhuamán", region: "Cusco, Peru", lat: -13.5078, lng: -71.9822, zoom: 15.8, tz: "America/Lima", wiki: "Sacsayhuam%C3%A1n", category: "mystery",
    blurb: "Hundred-ton stones fitted like soft clay.",
    dossier: {
      file: "CF-033",
      claim: "Zigzag walls of 100-tonne boulders interlocked so tightly a credit card won't fit the joints, no mortar, no two stones alike — 'melted into place,' say the theorists, by a technology the Inca inherited.",
      lore: "Even the conquistadors didn't believe it: chronicler Cieza de León wrote that no one who saw the walls would think men had made them. Modern lore proposes geopolymer casting, acid-softening plants, and sound levitation.",
      truth: "Experimental archaeology has quarried, dragged, and fitted such stones with Inca-era tools — ramps, log rollers, thousands of workers, and patient pecking with harder hammerstones; unfinished blocks still lie on the drag roads with their scars showing. The real wonder is organizational: an empire that could feed 20,000 builders for decades without money or writing."
    } },
  { id: "baalbek", name: "Baalbek", region: "Beqaa Valley, Lebanon", lat: 34.0069, lng: 36.2039, zoom: 15.5, tz: "Asia/Beirut", wiki: "Baalbek", category: "mystery",
    blurb: "Home of the heaviest worked stones on the planet.",
    dossier: {
      file: "CF-034",
      claim: "The Trilithon: three ~800-tonne blocks sitting in a wall, with a 1,650-tonne cousin still in the quarry — far beyond, the claim goes, anything Rome could lift, so the temple must stand on a older, greater foundation.",
      lore: "The 'Stone of the Pregnant Woman' has become a pilgrimage site for alternative historians; even mainstream engineers admit moving it today would be a serious project.",
      truth: "The quarry is 800 metres away and slightly uphill — the Romans moved the blocks a short, engineered slide, and the biggest ones stayed put precisely because even Rome had limits. Roman crane technology and lifting bosses are visible on the stones. Still: standing under the Trilithon, the ancient-alien impulse is at least emotionally understandable."
    } },
  { id: "teotihuacan", name: "Teotihuacan", region: "Mexico", lat: 19.6925, lng: -98.8438, zoom: 14.5, tz: "America/Mexico_City", wiki: "Teotihuacan", category: "mystery",
    blurb: "The city whose builders' name is lost.",
    dossier: {
      file: "CF-035",
      claim: "Sheets of mica — an electrical insulator mined 3,000 miles away in Brazil — found layered inside the pyramids: the 'power plant' theory's favorite exhibit.",
      lore: "Even the Aztecs found it abandoned and named it 'the place where the gods were created.' Nobody knows what its builders called themselves, what language they spoke, or why 125,000 people walked away.",
      truth: "The mica is real (though its sourcing is debated) — mica was ritually prized across Mesoamerica, and no wiring, generators, or scorch marks accompany it. The genuine mystery needs no aliens: one of the largest cities on Earth in 500 CE, and its name, kings, and collapse are simply... gone."
    } },
  { id: "gobekli-tepe", name: "Göbekli Tepe", region: "Şanlıurfa, Türkiye", lat: 37.2231, lng: 38.9224, zoom: 15.5, tz: "Europe/Istanbul", wiki: "G%C3%B6bekli_Tepe", category: "mystery",
    blurb: "The temple that broke the timeline.",
    dossier: {
      file: "CF-036",
      claim: "Carved twenty-ton pillars raised 11,600 years ago — before farming, pottery, or the wheel — then deliberately buried. Alternative historians call it proof of a lost civilization; Graham Hancock built a career on it.",
      lore: "It genuinely rewrote textbooks: monumental religion apparently came BEFORE agriculture, not after. And someone did backfill the whole complex by hand, entombing it for ten millennia — archaeology's politest 'why?'",
      truth: "The revolution is real but human: hunter-gatherers organizing feasts and labor, no lost technology required — quarry, ramps, rope. The burial reads as ritual decommissioning. The unsettling part isn't aliens; it's how little we knew about our own species' opening act."
    } },
  { id: "svalbard-vault", name: "Svalbard Global Seed Vault", region: "Spitsbergen, Norway", lat: 78.2358, lng: 15.4913, zoom: 14, tz: "Arctic/Longyearbyen", wiki: "Svalbard_Global_Seed_Vault", category: "mystery",
    blurb: "A concrete fin in a frozen mountainside, 1,300 km past the Arctic Circle.",
    dossier: {
      file: "CF-037",
      claim: "The 'Doomsday Vault': theorists say the elite built it because they know what's coming — and that the real inventory isn't seeds.",
      lore: "Buried 120 metres in permafrost, engineered to survive nuclear war and sea-level rise, funded by governments and the Gates Foundation alike. It made its first emergency withdrawal in 2015 — for Syria's destroyed seed bank, which is either reassuring or exactly what they'd say.",
      truth: "It's a backup drive for agriculture: 1.3 million seed samples deposited by nearly every country, doors opened a few times a year, tours refused because it's a freezer, not a bunker. The apocalypse it guards against is the boring one — budget cuts and wars wrecking local seed banks, which happens constantly."
    } },
  { id: "guidestones", name: "Georgia Guidestones site", region: "Elberton, Georgia, USA", lat: 34.2320, lng: -82.8944, zoom: 15.8, tz: "America/New_York", wiki: "Georgia_Guidestones", category: "mystery",
    blurb: "The empty pedestal of America's stone commandments.",
    dossier: {
      file: "CF-038",
      claim: "Granite slabs commissioned in 1979 by a pseudonymous 'R.C. Christian,' inscribed in eight languages with rules for a post-apocalyptic humanity — including keeping the population under 500 million. NWO scripture, said half the internet.",
      lore: "The banker who handled the money took the client's identity to his grave. In July 2022 someone bombed the stones at 4 a.m., and the state demolished the remains the same day — which, of course, only fed the theories.",
      truth: "The bombing is real and unsolved; the monument was real granite from local quarries with a documented fabrication order. Whoever R.C. Christian was, he paid cash, left a sealed identity with instructions never to open it, and got exactly the legend he designed."
    } },
  { id: "rushmore", name: "Mount Rushmore", region: "South Dakota, USA", lat: 43.8791, lng: -103.4591, zoom: 15, tz: "America/Denver", wiki: "Mount_Rushmore", category: "mystery",
    blurb: "Four presidents and one sealed room.",
    dossier: {
      file: "CF-039",
      claim: "A hidden chamber behind Lincoln's head — the 'Hall of Records' — holding, depending on your source, the real Constitution, national secrets, or nothing the public will ever see.",
      lore: "The chamber exists. Sculptor Gutzon Borglum blasted a 21-metre tunnel for a grand archive before Congress cut the money in 1939, and the National Park Service quietly finished a version of it in 1998.",
      truth: "In 1998 sixteen porcelain panels describing the monument and American history were sealed in a titanium vault in the tunnel floor — an archive for whoever finds it in some far future. No public access, which keeps the lore alive; the inventory, though, is published."
    } },
  { id: "bimini-road", name: "Bimini Road", region: "Bahamas", lat: 25.7643, lng: -79.2780, zoom: 14.8, tz: "America/New_York", wiki: "Bimini_Road", category: "mystery",
    blurb: "A half-mile line of stones under six metres of gin-clear water.",
    dossier: {
      file: "CF-040",
      claim: "In 1938 the psychic Edgar Cayce prophesied Atlantis would rise near Bimini in 1968 or 1969. In September 1968, divers found this — a paved 'road' of huge rectangular blocks, right on schedule.",
      lore: "The timing remains the best coincidence in fringe archaeology. Expeditions still dive it every year, and side-scan sonar keeps finding 'more structure' that never quite resolves.",
      truth: "Geologists core-drilled the blocks: it's beachrock — shoreline sediment that naturally cements and cracks into rectangular slabs, radiocarbon-dated to ~3,000 years ago and lying exactly where the ancient beach was. Nature builds in straight lines more often than we're comfortable with."
    } },
  { id: "great-zimbabwe", name: "Great Zimbabwe", region: "Zimbabwe", lat: -20.2675, lng: 30.9333, zoom: 15.3, tz: "Africa/Harare", wiki: "Great_Zimbabwe", category: "mystery",
    blurb: "Africa's stone city — and the conspiracy that was official policy.",
    dossier: {
      file: "CF-041",
      claim: "Eleven-metre granite walls, no mortar, housing 18,000 people — attributed by a century of Europeans to Phoenicians, Arabs, the Queen of Sheba: anyone, in fact, except Africans.",
      lore: "Here the cover-up was real and ran the other way: Rhodesia's government censored archaeologists and museum displays into the 1970s to deny the city's African origin, because the truth undermined the colony's founding story.",
      truth: "Excavation settled it long ago: built by ancestors of the Shona from the 11th century, hub of a gold trade reaching China (Ming porcelain in the ruins). The independent nation took its name from the monument in 1980 — the rare case file where the conspiracy theory was the official history."
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
