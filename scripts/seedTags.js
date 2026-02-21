require('dotenv').config({ path: '.env' });
const mongoose = require('mongoose');

const TopicSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  en: { type: String, required: true },
  fa: String,
  flashcard: String,
  votes: { type: Number, default: 0 },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  tags: { type: [String], default: [] }
});

const Topic = mongoose.models.Topic || mongoose.model('Topic', TopicSchema);

const newTopicsData = [
  { tags: ["game"], en: "The impact of open-world games on player immersion", flashcard: "Do open-world mechanics enhance or dilute the main narrative experience?" },
  { tags: ["game"], en: "Evolution of competitive gaming and eSports", flashcard: "Should eSports be considered Olympic disciplines alongside physical sports?" },
  { tags: ["game"], en: "The role of loot boxes and microtransactions", flashcard: "Are modern monetization strategies hurting the core integrity of game design?" },
  { tags: ["game"], en: "Virtual reality vs Augmented reality in gaming", flashcard: "Which technology has a higher potential to redefine how we play in 2030?" },
  { tags: ["game"], en: "Retro gaming: Why old games still matter", flashcard: "Is it nostalgia alone, or were games mechanically superior in the past?" },
  { tags: ["game"], en: "Storytelling in non-linear video games", flashcard: "How do player choices change the emotional weight of a fictional tragedy?" },
  { tags: ["game"], en: "The simulation theory and hyper-realistic graphics", flashcard: "At what point does realism in games become counter-productive to fun?" },
  { tags: ["game"], en: "Indie vs AAA: The battle for creativity", flashcard: "Where is the most innovation happening right now: big studios or lone devs?" },
  { tags: ["game"], en: "Gaming as a therapeutic tool for mental health", flashcard: "Can specifically designed games help treat anxiety or PTSD effectively?" },
  { tags: ["game"], en: "The ethics of AI in NPC behavior", flashcard: "How smart is too smart for an enemy AI before it feels unfair to players?" },
  { tags: ["game"], en: "Cloud gaming and the end of hardware cycles", flashcard: "Will physical consoles become obsolete in the next decade?" },
  { tags: ["game"], en: "Mobile gaming's dominance in the global market", flashcard: "Has the accessibility of mobile gaming improved the industry or filled it with junk?" },
  { tags: ["game"], en: "The psychological hooks of MMORPGs", flashcard: "What makes digital social progression so addictive for certain players?" },
  { tags: ["game"], en: "Remakes vs Remasters: Necessary or cash grabs?", flashcard: "When does a classic game actually deserve a complete ground-up remake?" },
  { tags: ["game"], en: "Co-op gaming vs Solo experiences", flashcard: "Are solo campaigns becoming a secondary priority for modern developers?" },
  { tags: ["game"], en: "Speedrunning culture and technical skill", flashcard: "How does breaking a game reveal more about its design than playing normally?" },
  { tags: ["game"], en: "World building in FromSoftware games", flashcard: "Is environmental storytelling superior to traditional cutscenes and dialogue?" },
  { tags: ["game"], en: "The future of cross-platform play", flashcard: "Should all competitive games have forced cross-play between consoles and PCs?" },
  { tags: ["game"], en: "Educational value of strategy games", flashcard: "Can games like Civilization actually teach history or resource management efficiently?" },
  { tags: ["game"], en: "Violence in games and its social impact", flashcard: "After 40 years of research, do we finally have a consensus on gaming and behavior?" },
  { tags: ["tech"], en: "Large Language Models: Progress vs Peril", flashcard: "Will LLMs eventually replace search engines or just provide more noise?" },
  { tags: ["tech"], en: "Privacy in the age of facial recognition", flashcard: "Is public anonymity a fundamental right or a thing of the past?" },
  { tags: ["tech"], en: "Quantum computing's threat to encryption", flashcard: "How prepared is our financial infrastructure for the post-quantum era?" },
  { tags: ["tech"], en: "The ethics of self-driving car algorithms", flashcard: "Who should be responsible for a machine's decision in a split-second accident?" },
  { tags: ["tech"], en: "Web3 and the future of the decentralized web", flashcard: "Does the average user actually care about owning their data on the blockchain?" },
  { tags: ["tech"], en: "Wearable tech and bio-hacking", flashcard: "Would you implant technology in your body to increase your productivity?" },
  { tags: ["tech"], en: "Smart cities and total surveillance", flashcard: "Do the benefits of efficient traffic and energy use outweigh the loss of privacy?" },
  { tags: ["tech"], en: "Social media algorithms and political polarization", flashcard: "Are tech giants responsible for the societal divisions caused by their feeds?" },
  { tags: ["tech"], en: "The replacement of white-collar jobs by AI", flashcard: "Which professions are truly safe from automation in the next 15 years?" },
  { tags: ["tech"], en: "Neuralink and brain-computer interfaces", flashcard: "What happens to human individuality when our thoughts are connected to the net?" },
  { tags: ["tech"], en: "Sustainable technology and green mining", flashcard: "Is the tech industry doing enough to recycle e-waste and precious metals?" },
  { tags: ["tech"], en: "Satellite internet and global connectivity", flashcard: "Will projects like Starlink bridge the digital divide or just clutter our orbit?" },
  { tags: ["tech"], en: "Digital twins and industrial efficiency", flashcard: "Can simulating an entire factory really save millions in the real world?" },
  { tags: ["tech"], en: "Biotechnology and the quest for immortality", flashcard: "Is death a biological error that technology can eventually solve?" },
  { tags: ["tech"], en: "The role of 5G / 6G in automated industry", flashcard: "Are we building infrastructure faster than we find actual use cases for it?" },
  { tags: ["tech"], en: "Edge computing vs Cloud dominance", flashcard: "Why is processing data locally becoming more important than the central cloud?" },
  { tags: ["tech"], en: "Deepfakes and the erosion of digital truth", flashcard: "Can we ever trust video evidence again in a world of perfect AI manipulation?" },
  { tags: ["tech"], en: "Open Source vs Proprietary software ethics", flashcard: "Should critical infrastructure only run on open-sourced code for safety?" },
  { tags: ["tech"], en: "Humanoid robots as domestic companions", flashcard: "Will we eventually treat advanced robots as legal entities or simple tools?" },
  { tags: ["tech"], en: "Cybersecurity as the 5th domain of warfare", flashcard: "Is a digital attack on power grids equivalent to a physical declaration of war?" },
  { tags: ["series"], en: "The Golden Age of Television: Is it over?", flashcard: "Are we currently in a plateau or a decline in scripted show quality?" },
  { tags: ["series"], en: "Binge-watching culture and narrative pacing", flashcard: "Does releasing a whole season at once hurt the long-term impact of a story?" },
  { tags: ["series"], en: "Anthology series vs Serialized drama", flashcard: "Which format is better at exploring complex philosophical concepts?" },
  { tags: ["series"], en: "The rise of international television (Non-English)", flashcard: "Has 'Squid Game' or 'Money Heist' permanently shifted Hollywood's ego?" },
  { tags: ["series"], en: "Streaming wars: Survival of the fittest", flashcard: "Will we merge back into a 'bundle' system similar to traditional cable?" },
  { tags: ["series"], en: "Adapting video games into TV series", flashcard: "Why did 'The Last of Us' succeed where decades of others failed?" },
  { tags: ["series"], en: "The cult of the Anti-Hero in modern series", flashcard: "Is our fascination with characters like Walter White or Tony Soprano healthy?" },
  { tags: ["series"], en: "Sitcoms in the 21st century: A dying breed?", flashcard: "Can a multi-cam sitcom still succeed in the era of high-concept drama?" },
  { tags: ["series"], en: "Documentary series and true crime fascination", flashcard: "Are true crime series exploiting victims or helping solve cold cases?" },
  { tags: ["series"], en: "Character arcs vs Long-running plotlines", flashcard: "When a show goes on too long, which one suffers first: plot or personality?" },
  { tags: ["series"], en: "The politics of representation in Netflix shows", flashcard: "Is 'inclusive casting' improving storytelling or fulfilling a checklist?" },
  { tags: ["series"], en: "Sci-Fi series and social commentary", flashcard: "How does 'Black Mirror' reflect our current technological anxieties?" },
  { tags: ["series"], en: "The revival of 90s series: Hit or miss?", flashcard: "Why are studios so afraid of new IP compared to safe reboots?" },
  { tags: ["series"], en: "Animated series for adults: Beyond comedy", flashcard: "Can animation express adult drama more effectively than live action?" },
  { tags: ["series"], en: "Fantasy series and world-building fatigue", flashcard: "Are we being overwhelmed by too many 'epic' fantasy worlds at once?" },
  { tags: ["series"], en: "Dialogue-heavy series vs Visual storytelling", flashcard: "Is Aaron Sorkin’s style still relevant in a visual-first medium?" },
  { tags: ["series"], en: "The impact of fan theories on writing", flashcard: "Should writers ignore the internet or lean into popular fan predictions?" },
  { tags: ["series"], en: "Limited series: The perfect storytelling length?", flashcard: "Why do 6-10 episode series often feel more complete than 5-season runs?" },
  { tags: ["series"], en: "The future of interactive series (Bandersnatch)", flashcard: "Is 'Choose your own adventure' the future of TV or a gimmick?" },
  { tags: ["series"], en: "Soundtrack and score in modern television", flashcard: "How much does the music of 'Succession' or 'GoT' define their success?" },
  { tags: ["holidays"], en: "Commercialization of traditional festivals", flashcard: "Has the true meaning of Christmas or Eid been lost to retail sales?" },
  { tags: ["holidays"], en: "Travel boom during holiday seasons", flashcard: "Is it better to stay at home or face the chaos of holiday travel?" },
  { tags: ["holidays"], en: "The psychology of gift-giving", flashcard: "Do we give gifts to make others happy or to fulfill a social obligation?" },
  { tags: ["holidays"], en: "New Year resolutions: Hope or delusion?", flashcard: "Why do most people fail their goals by February every year?" },
  { tags: ["holidays"], en: "Cultural exchange in globalized holidays", flashcard: "Is the worldwide adoption of Halloween a form of cultural imperialism?" },
  { tags: ["holidays"], en: "Sustainable holidays and eco-friendly choices", flashcard: "How can we celebrate without creating massive amounts of plastic waste?" },
  { tags: ["holidays"], en: "The role of food in holiday traditions", flashcard: "Why is a specific meal so central to the identity of a culture's celebration?" },
  { tags: ["holidays"], en: "Loneliness during peak festive seasons", flashcard: "How can societies support those who have no family during major holidays?" },
  { tags: ["holidays"], en: "Working on holidays: Necessity or sacrifice?", flashcard: "Should essential workers receive triple pay or mandatory time off later?" },
  { tags: ["holidays"], en: "History vs Modern practice of holidays", flashcard: "Do most people actually know the historical origin of the holiday they celebrate?" },
  { tags: ["holidays"], en: "Digital detox during vacation time", flashcard: "Is a holiday really a holiday if you are still checking your work emails?" },
  { tags: ["holidays"], en: "Winter holidays vs Summer vacations", flashcard: "Which season provides a more effective mental reset for workers?" },
  { tags: ["holidays"], en: "The economics of holiday spending", flashcard: "Can a bad holiday season actually trigger a local economic recession?" },
  { tags: ["holidays"], en: "Religious vs Secular celebrations", flashcard: "Can a holiday remain meaningful once its religious roots are stripped away?" },
  { tags: ["holidays"], en: "Traditions: Keeping them or evolving them?", flashcard: "When does a holiday tradition become an outdated burden rather than a joy?" },
  { tags: ["holidays"], en: "The 'Post-Holiday Blues' phenomenon", flashcard: "Why is the transition back to work so psychologically difficult?" },
  { tags: ["holidays"], en: "Unique holidays around the world", flashcard: "What can we learn from festivals like 'Holi' or 'Day of the Dead'?" },
  { tags: ["holidays"], en: "Family dynamics and holiday stress", flashcard: "Why do holidays often bring out the best and worst in family relationships?" },
  { tags: ["holidays"], en: "Gratitude as a practice during Thanksgiving", flashcard: "Should we have a dedicated day for gratitude, or is it a daily requirement?" },
  { tags: ["holidays"], en: "Planning the perfect holiday: Art or Science?", flashcard: "Does over-planning a vacation actually ruin the spontaneity of fun?" },
  { tags: ["geo"], en: "The future of Megacities (Tokyo, Lagos, Delhi)", flashcard: "Are we reaching the limit of how many humans can live in one spot?" },
  { tags: ["geo"], en: "Hidden gems vs Over-tourism", flashcard: "Should influencers stop tagging exact locations of pristine natural spots?" },
  { tags: ["geo"], en: "The impact of climate change on coastal cities", flashcard: "Will cities like Venice or Jakarta survive the next 50 years?" },
  { tags: ["geo"], en: "Remote work and the rise of digital nomads", flashcard: "How is the influx of tech workers changing the economy of Lisbon or Bali?" },
  { tags: ["geo"], en: "Architecture as a reflection of culture", flashcard: "Can you truly understand a nation by looking at its buildings?" },
  { tags: ["geo"], en: "The North-South divide in global economy", flashcard: "What will it take to permanently balance the global wealth distribution?" },
  { tags: ["geo"], en: "Island nations and the threat of sea levels", flashcard: "Where will the citizens of sinking islands migrate to in the future?" },
  { tags: ["geo"], en: "Preserving historical sites in modern zones", flashcard: "Should we prioritize a new metro line or a 2000-year-old ruin?" },
  { tags: ["geo"], en: "The Silk Road: Then and Now", flashcard: "How is the Belt and Road Initiative reshaping Eurasian geopolitics?" },
  { tags: ["geo"], en: "Desertification and the struggle for water", flashcard: "Will the next major global conflicts be fought over fresh water sources?" },
  { tags: ["geo"], en: "Living at high altitudes (Andes, Himalayas)", flashcard: "How does geography shape the physical and social evolution of a people?" },
  { tags: ["geo"], en: "National Parks: Conservation vs Access", flashcard: "Should we limit the number of visitors to protect the wilderness?" },
  { tags: ["geo"], en: "The unique geopolitics of the Arctic", flashcard: "Who owns the resources under the melting ice caps of the North Pole?" },
  { tags: ["geo"], en: "Rural-to-Urban migration and ghost towns", flashcard: "Can abandoned villages ever be revitalized in the digital age?" },
  { tags: ["geo"], en: "Border cultures and shared identities", flashcard: "Do people living on borders have more in common with each other than their capitals?" },
  { tags: ["geo"], en: "Volcanic zones: Risky civilizations", flashcard: "Why do people continue to build major cities at the foot of active volcanoes?" },
  { tags: ["geo"], en: "The role of geography in military history", flashcard: "Has technology finally overcome the strategic importance of terrain?" },
  { tags: ["geo"], en: "Urban farming and vertical cities", flashcard: "Can we effectively grow enough food inside city limits to be self-sufficient?" },
  { tags: ["geo"], en: "The Amazon Rainforest: Global lungs or local resource?", flashcard: "Is it fair for the world to tell Brazil how to manage its territory?" },
  { tags: ["geo"], en: "The psychology of place and 'Topophilia'", flashcard: "Why do we feel a deep emotional connection to certain landscapes?" }
];

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) throw new Error("MONGODB_URI is not defined");
    await mongoose.connect(mongoUri);
    const lastTopic = await Topic.findOne().sort({ id: -1 });
    let nextId = lastTopic ? (lastTopic.id + 1) : 1;
    const finalData = newTopicsData.map(t => ({ ...t, id: nextId++, status: 'approved', votes: Math.floor(Math.random() * 50) }));
    await Topic.insertMany(finalData);
    console.log("SUCCESS: Added 100 topics with tags.");
  } finally {
    process.exit();
  }
}
seed();
