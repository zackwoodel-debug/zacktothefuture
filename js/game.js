/* ============================================================
   game.js — XP, levels, achievements, and the resistor game.
   Progress persists in localStorage across visits.
   ============================================================ */

const Game = {
  SAVE_KEY: "zackos-save-v1",

  state: {
    xp: 0,
    discovered: [],   // command names run at least once
    achievements: [], // unlocked achievement ids
    bearMsgs: 0,
    bestStreak: 0,
  },

  levels: [
    { xp: 0,   name: "Visitor" },
    { xp: 60,  name: "Lab Guest" },
    { xp: 150, name: "Research Colleague" },
    { xp: 300, name: "Friend of the Bear" },
  ],

  // commands that count toward "explored %"
  coreCommands: ["help", "whoami", "research", "experience", "skills", "news", "contact", "linkedin", "github", "resume", "bear", "play", "stats"],

  achievementDefs: {
    "first-cmd":    { name: "Hello, World",          desc: "Ran your first command" },
    "identity":     { name: "Identity Verified",     desc: "Found out who Zack is" },
    "deep-dive":    { name: "Deep Dive",             desc: "Viewed research, experience AND skills" },
    "in-the-loop":  { name: "In the Loop",           desc: "Checked the news feed" },
    "networker":    { name: "Networker",             desc: "Looked up how to reach Zack" },
    "bear-whisperer": { name: "Bear Whisperer",      desc: "Had a real conversation with Volt" },
    "root-denied":  { name: "Root Denied",           desc: "Tried to sudo. Bold move." },
    "electrician":  { name: "Certified Electrician", desc: "5-streak in the resistor challenge" },
    "off-the-map":  { name: "Off the Map",           desc: "Discovered a secret command" },
    "completionist":{ name: "Completionist",         desc: "Explored 100% of the powerfolio" },
  },

  /* ---------------- persistence ---------------- */

  load() {
    try {
      const raw = localStorage.getItem(this.SAVE_KEY);
      if (raw) Object.assign(this.state, JSON.parse(raw));
    } catch (e) { /* private browsing etc. — play sessionless */ }
    this.updateBadge();
  },

  save() {
    try { localStorage.setItem(this.SAVE_KEY, JSON.stringify(this.state)); } catch (e) {}
  },

  /* ---------------- xp & levels ---------------- */

  levelFor(xp) {
    let lvl = this.levels[0];
    for (const l of this.levels) if (xp >= l.xp) lvl = l;
    return lvl;
  },

  nextLevel(xp) {
    return this.levels.find(l => l.xp > xp) || null;
  },

  addXP(n, quiet) {
    const before = this.levelFor(this.state.xp).name;
    this.state.xp += n;
    const after = this.levelFor(this.state.xp);
    this.save();
    this.updateBadge(true);
    if (after.name !== before) {
      Game.toast("Level up", after.name, "Explorer rank increased");
      if (!quiet && typeof Bear !== "undefined") Bear.say(`Level up — you're now a ${after.name}. ${after.name === "Friend of the Bear" ? "Welcome to the inner circle." : "Keep going."}`, "excited");
    }
  },

  updateBadge(bump) {
    const el = document.getElementById("xpBadge");
    if (!el) return;
    const lvl = this.levelFor(this.state.xp);
    el.textContent = `${lvl.name} · ${this.state.xp} XP`;
    if (bump) {
      el.classList.remove("bump");
      void el.offsetWidth; // restart animation
      el.classList.add("bump");
    }
  },

  exploredPct() {
    const found = this.coreCommands.filter(c => this.state.discovered.includes(c)).length;
    return Math.round((found / this.coreCommands.length) * 100);
  },

  /* ---------------- achievements ---------------- */

  unlock(id) {
    if (this.state.achievements.includes(id)) return;
    const def = this.achievementDefs[id];
    if (!def) return;
    this.state.achievements.push(id);
    this.save();
    this.toast("Achievement unlocked", def.name, `${def.desc} · +20 XP`);
    this.addXP(20, true);
  },

  toast(eyebrow, title, body) {
    const box = document.getElementById("toasts");
    if (!box) return;
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<div class="t-eyebrow"></div><div class="t-title"></div><div class="t-body"></div>`;
    t.querySelector(".t-eyebrow").textContent = eyebrow;
    t.querySelector(".t-title").textContent = title;
    t.querySelector(".t-body").textContent = body;
    box.appendChild(t);
    setTimeout(() => {
      t.classList.add("leaving");
      setTimeout(() => t.remove(), 350);
    }, 4200);
  },

  /* called by the terminal every time a command runs */
  onCommand(name, isSecret) {
    const first = !this.state.discovered.includes(name);
    if (first) {
      this.state.discovered.push(name);
      this.addXP(isSecret ? 15 : 10);
    }
    this.save();

    if (this.state.discovered.length === 1) this.unlock("first-cmd");
    if (name === "whoami") this.unlock("identity");
    if (name === "news") this.unlock("in-the-loop");
    if (name === "contact" || name === "linkedin") this.unlock("networker");
    if (name === "sudo") this.unlock("root-denied");
    if (isSecret) this.unlock("off-the-map");
    if (["research", "experience", "skills"].every(c => this.state.discovered.includes(c))) this.unlock("deep-dive");
    if (this.coreCommands.every(c => this.state.discovered.includes(c))) this.unlock("completionist");
    return first;
  },

  onBearMessage() {
    this.state.bearMsgs++;
    this.save();
    if (this.state.bearMsgs >= 3) this.unlock("bear-whisperer");
  },

  /* ---------------- resistor color-code game ---------------- */

  resistor: {
    colors: [
      { name: "black",  hex: "#1a1a1a", fg: "#eee" },
      { name: "brown",  hex: "#7b4a12", fg: "#fff" },
      { name: "red",    hex: "#e0312d", fg: "#fff" },
      { name: "orange", hex: "#f77f00", fg: "#fff" },
      { name: "yellow", hex: "#ffd500", fg: "#222" },
      { name: "green",  hex: "#2fa84f", fg: "#fff" },
      { name: "blue",   hex: "#2e6fe0", fg: "#fff" },
      { name: "violet", hex: "#8e44ad", fg: "#fff" },
      { name: "grey",   hex: "#9aa0a6", fg: "#222" },
      { name: "white",  hex: "#f5f5f5", fg: "#222" },
    ],
    streak: 0,
    current: null, // { value, options:[...], correctIdx }
  },

  fmtOhms(v) {
    if (v >= 1e6) return (v / 1e6).toFixed(v % 1e6 ? 1 : 0).replace(/\.0$/, "") + " MΩ";
    if (v >= 1e3) return (v / 1e3).toFixed(v % 1e3 ? 1 : 0).replace(/\.0$/, "") + " kΩ";
    return v + " Ω";
  },

  newResistorQuestion() {
    const R = this.resistor;
    const d1 = 1 + Math.floor(Math.random() * 9); // first band never black
    const d2 = Math.floor(Math.random() * 10);
    const mult = Math.floor(Math.random() * 5);   // ×1 to ×10k
    const value = (d1 * 10 + d2) * Math.pow(10, mult);

    // distractors: digit swap and multiplier slip — classic mistakes
    const wrong1 = (d2 * 10 + d1) * Math.pow(10, mult);
    const wrong2 = (d1 * 10 + d2) * Math.pow(10, mult + (mult === 0 ? 1 : -1));
    let options = [value, wrong1, wrong2];
    // dedupe (e.g. palindromic digits) by nudging
    options = [...new Set(options)];
    while (options.length < 3) options.push(options[options.length - 1] * 10);
    options.sort(() => Math.random() - 0.5);

    R.current = {
      bands: [d1, d2, mult],
      value,
      options,
      correctIdx: options.indexOf(value),
    };
    return R.current;
  },

  answerResistor(idx) {
    const R = this.resistor;
    if (!R.current) return null;
    const correct = idx === R.current.correctIdx;
    if (correct) {
      R.streak++;
      this.addXP(5, true);
      this.updateBadge(true);
      if (R.streak > this.state.bestStreak) {
        this.state.bestStreak = R.streak;
        this.save();
      }
      if (R.streak >= 5) this.unlock("electrician");
    } else {
      R.streak = 0;
    }
    const answer = this.fmtOhms(R.current.value);
    R.current = null;
    return { correct, answer, streak: R.streak };
  },
};
