/* ============================================================
   ZackOS content file — THIS IS THE ONLY FILE YOU EDIT.
   Update your bio, research, news, and links here; the rest
   of the site picks it up automatically.
   ============================================================ */

const DATA = {
  name: "Zack Woodel",
  headline: "Quantum Materials & Semiconductor Research | Electrical Engineering",
  school: "Texas Tech University — Whitacre College of Engineering",
  location: "Spring / Lubbock, Texas",
  email: "zwoodel1@icloud.com",

  links: {
    linkedin: "https://www.linkedin.com/in/zackwoodel",
    github: "",   // TODO: add your GitHub profile URL, e.g. "https://github.com/zackwoodel"
    scholar: "",  // TODO: add Google Scholar profile when you have one
    resume: "",   // TODO: drop a PDF in assets/ and put "assets/resume.pdf" here
  },

  bear: {
    name: "Volt",
    version: "2.1.0",
  },

  whoami: [
    "Hey — I'm Zack.",
    "",
    "I'm an Electrical Engineering student at Texas Tech University working at",
    "the intersection of Power Systems, Machine Learning, and Advanced",
    "Semiconductors. My work is about optimizing industrial efficiency in",
    "high-stakes environments like the energy sector.",
    "",
    "I leverage data-driven controls and emerging technologies — epitaxial",
    "growth, nanostructured devices — for reliable infrastructure and",
    "predictive maintenance. Currently a Research Intern at Oak Ridge",
    "National Laboratory.",
    "",
    "I'm actively seeking roles where my research in power electronics and",
    "data analytics can directly reduce operational costs and enhance",
    "system reliability.",
  ],

  research: [
    {
      title: "Advanced Semiconductors & Power Electronics",
      sub: "DOD-funded · TTU Whitacre College of Engineering",
      desc: "High-reliability power electronics and nanostructured sensing devices for critical infrastructure and extreme environments. Engineering predictive synthesis systems and performing advanced electrical characterization of wide-bandgap semiconductors, with applications in solar energy systems and large-scale process control.",
      tags: ["wide-bandgap", "epitaxy", "power electronics", "characterization"],
    },
    {
      title: "Quantum Materials & Superconductivity",
      sub: "Condensed Matter Research Group · TTU",
      desc: "Growth, characterization, and testing of superconducting materials to study quantum phases and correlated electron behavior — probing the mechanisms behind unconventional superconductivity through experimental and analytical research.",
      tags: ["superconductivity", "quantum phases", "materials growth"],
    },
    {
      title: "Biophysics & Neuromorphic Memory",
      sub: "Soft Condensed Matter & Biophysics Lab · TTU",
      desc: "Lipid membranes as memory-bearing systems at the intersection of biophysics, soft matter, and neuroscience. Using X-ray/neutron scattering, spectroscopy, electrophysiology, and simulations to study membrane dynamics and synaptic plasticity — toward bioinspired neuromorphic materials.",
      tags: ["soft matter", "neuromorphic", "scattering", "electrophysiology"],
    },
  ],

  experience: [
    {
      role: "Research Intern",
      org: "Oak Ridge National Laboratory",
      dates: "Jun 2026 — Present",
      desc: "National-lab research internship (details coming soon — ask me!).",
    },
    {
      role: "Advanced Semiconductor & Power Systems Research Assistant",
      org: "Texas Tech University",
      dates: "Sep 2025 — Present",
      desc: "DOD-funded research on high-reliability power electronics and nanostructured sensing devices for critical infrastructure and extreme environments.",
    },
    {
      role: "Soft Condensed Matter & Biophysics Research Assistant",
      org: "Texas Tech University",
      dates: "Oct 2025 — Present",
      desc: "Researching lipid membranes as memory-bearing systems — X-ray/neutron scattering, spectroscopy, electrophysiology, and simulation.",
    },
    {
      role: "Condensed Matter & Quantum Materials Research Assistant",
      org: "Texas Tech University",
      dates: "Aug 2025 — May 2026",
      desc: "Growth, characterization, and testing of superconducting materials to study quantum phases and correlated electron behavior.",
    },
    {
      role: "Summer Intern",
      org: "Special Angels of the Woodlands",
      dates: "Jun 2024 — Jul 2024",
      desc: "Repaired electronics (consoles, TVs, low-voltage lighting), built and maintained the organization's website, and led online client activities.",
    },
  ],

  skills: {
    "Industrial & Controls": ["SCADA", "PLC", "Predictive Maintenance", "Process Control"],
    "Data & ML": ["MATLAB", "Machine Learning", "Synthetic Data Generation", "Data Exchange Pipelines"],
    "Lab & Materials": ["Electrical Characterization", "Epitaxial Growth", "X-ray/Neutron Scattering", "Spectroscopy", "Electrophysiology"],
    "Certifications": ["MATLAB Onramp", "Machine Learning Onramp", "Data Exchange Pipelines", "Synthetic Data for Computer Vision"],
  },

  /* Newest first. Add a line here whenever something happens —
     this is how people keep up with you. */
  news: [
    { date: "2026-08", text: "Launched Zack to the Future v1.0 — this very website. Explore the terminal, earn XP." },
    { date: "2026-06", text: "Started as a Research Intern at Oak Ridge National Laboratory" },
    { date: "2025-10", text: "Joined the Soft Condensed Matter & Biophysics lab at TTU — lipid membranes as memory devices" },
    { date: "2025-09", text: "Joined the DOD-funded Advanced Semiconductor & Power Systems research group" },
    { date: "2025-08", text: "Began Condensed Matter & Quantum Materials research — superconductivity!" },
  ],

  /* -------- Volt's brain: keyword → reply. --------
     First matching intent wins; more keyword hits = better match.
     {name} → visitor-facing bear name, commands in [[double brackets]]
     become clickable. */
  bearBrain: [
    {
      intents: ["hi", "hello", "hey", "howdy", "sup", "yo", "hola"],
      mood: "happy",
      reply: "Howdy. I'm {name}, Zack's assistant bear. Ask me anything — his research, how to reach him, what he's good at... or ask me about secrets.",
    },
    {
      intents: ["research", "quantum", "semiconductor", "superconduct", "materials", "membrane", "biophysics", "neuromorphic", "lab", "science", "study", "studying"],
      mood: "excited",
      reply: "Zack runs THREE research tracks: wide-bandgap semiconductors & power electronics (DOD-funded!), superconducting quantum materials, and lipid membranes as brain-like memory devices. Type [[research]] for the full rundown!",
    },
    {
      intents: ["ornl", "oak", "ridge", "intern", "internship", "job", "work", "experience", "career", "hire", "hiring", "recruit"],
      mood: "cool",
      reply: "Zack is currently a Research Intern at Oak Ridge National Laboratory, on top of his TTU lab work. Full timeline: [[experience]]. Recruiting? He's actively looking — [[contact]] him!",
    },
    {
      intents: ["contact", "email", "reach", "message", "talk", "connect", "linkedin"],
      mood: "happy",
      reply: "Easiest ways: email zwoodel1@icloud.com or LinkedIn. Type [[contact]] and I'll lay out all the options.",
    },
    {
      intents: ["school", "texas", "tech", "ttu", "college", "university", "class", "student", "degree", "major"],
      mood: "happy",
      reply: "Zack is doing his B.S. in Electrical Engineering at Texas Tech University (Whitacre College of Engineering) in Lubbock, TX. He somehow juggles that with three research groups. I nap more than he sleeps.",
    },
    {
      intents: ["skill", "skills", "matlab", "scada", "plc", "code", "coding", "programming", "tools", "good at"],
      mood: "cool",
      reply: "SCADA, PLCs, predictive maintenance, MATLAB, machine learning, epitaxial growth, neutron scattering... the toolbox is deep. Type [[skills]] for the whole spread.",
    },
    {
      intents: ["resume", "cv", "pdf", "hire him"],
      mood: "happy",
      reply: "Type [[resume]] for that! (And [[linkedin]] has the full profile.)",
    },
    {
      intents: ["news", "update", "updates", "latest", "recent", "follow", "keeping up"],
      mood: "excited",
      reply: "Type [[news]] for the latest — that's the feed to watch if you want to keep up with Zack's journey.",
    },
    {
      intents: ["secret", "secrets", "easter", "egg", "hidden", "cheat"],
      mood: "sneaky",
      reply: "You didn't hear this from me... try [[sudo]], [[ohm]], [[coffee]], [[neofetch]], or [[matrix]].",
    },
    {
      intents: ["you", "volt", "bear", "who are you", "what are you"],
      mood: "happy",
      reply: "I'm {name} — a bear Zack keeps around the lab as his assistant. I run on honey and stray electrons. My job: making sure you leave knowing how cool his research is.",
    },
    {
      intents: ["game", "play", "fun", "bored"],
      mood: "excited",
      reply: "Type [[play]] — I'll quiz you on resistor color codes. Get a 5-streak and you earn the Certified Electrician achievement.",
    },
    {
      intents: ["thanks", "thank", "thx", "cool", "awesome", "nice"],
      mood: "love",
      reply: "You're welcome. Don't forget to [[contact]] Zack if you want to work together.",
    },
    {
      intents: ["bye", "goodbye", "exit", "quit", "leave", "cya"],
      mood: "sleepy",
      reply: "Heading out of chat mode? Just type exit. Come back any time with bear!",
    },
  ],

  bearFallbacks: [
    "That's above my pay grade (I'm paid in honey). Try asking about his research, experience, skills, or contact — or ask me about secrets.",
    "My neural net is 90% bear, 10% net — didn't catch that. Ask me about Zack's research, how to reach him, or type help to see everything.",
    "Not sure about that one. Topics I'm good at: research, experience, skills, contact... and secrets.",
  ],
};
