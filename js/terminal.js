/* ============================================================
   terminal.js — the ZackOS shell.
   Boot sequence, command engine, history, autocomplete,
   chips, easter eggs. Content comes from data.js.
   ============================================================ */

const Term = {
  out: null,
  input: null,
  inputRow: null,
  promptLabel: null,
  screen: null,
  mode: "shell", // shell | bear | game
  history: [],
  hIdx: -1,
  busy: false,
  booted: false,
  skipBoot: false,
  skipType: false,
  lastActivity: Date.now(),
  reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,

  PROMPT: "guest@zackwoodel:~$",

  /* ---------------- utilities ---------------- */

  esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  },

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  },

  scrollToBottom() {
    this.screen.scrollTop = this.screen.scrollHeight;
  },

  line(html, cls) {
    const div = document.createElement("div");
    div.className = "line" + (cls ? " " + cls : "");
    div.innerHTML = html;
    this.out.appendChild(div);
    this.scrollToBottom();
    return div;
  },

  /* Print an array of {html, cls} (or strings) line by line.
     Paced by wall clock, not per-line sleeps, so browser timer
     throttling can't slow it below real time; any keypress
     fast-forwards (skipType). */
  async printLines(lines, delay) {
    const d = this.reducedMotion ? 0 : (delay === undefined ? 12 : delay);
    this.busy = true;
    this.skipType = false;
    const render = (l) => {
      if (typeof l === "string") this.line(this.esc(l));
      else this.line(l.html !== undefined ? l.html : this.esc(l.text), l.cls);
    };
    if (d === 0) {
      lines.forEach(render);
    } else {
      const t0 = performance.now();
      let i = 0;
      while (i < lines.length) {
        const due = this.skipType
          ? lines.length
          : Math.min(lines.length, Math.floor((performance.now() - t0) / d) + 1);
        while (i < due) render(lines[i++]);
        if (i < lines.length) await this.sleep(d);
      }
    }
    this.busy = false;
  },

  echo(text) {
    this.line(
      `<span class="prompt">${this.esc(this.promptLabel.textContent)}</span> <span class="typed">${this.esc(text)}</span>`,
      "echo"
    );
  },

  setMode(mode) {
    this.mode = mode;
    this.promptLabel.classList.remove("bear-mode", "game-mode");
    if (mode === "shell") {
      this.promptLabel.textContent = this.PROMPT;
    } else if (mode === "bear") {
      this.promptLabel.textContent = "you → " + DATA.bear.name.toLowerCase() + " ❯";
      this.promptLabel.classList.add("bear-mode");
    } else if (mode === "game") {
      this.promptLabel.textContent = "answer ❯";
      this.promptLabel.classList.add("game-mode");
    }
  },

  cmdLink(name) {
    return `<span class="cmd" data-cmd="${name}">${name}</span>`;
  },

  tagPills(tags) {
    return tags.map(t => `<span class="tag">${this.esc(t)}</span>`).join("");
  },

  /* ============================================================
     COMMANDS
     ============================================================ */

  commands: {
    help: {
      desc: "list all commands",
      async run() {
        const c = n => Term.cmdLink(n);
        await Term.printLines([
          { html: `<span class="h">PORTFOLIO</span>` },
          { html: `  ${c("whoami")}       <span class="dim">who is this guy?</span>` },
          { html: `  ${c("research")}     <span class="dim">current research areas</span>` },
          { html: `  ${c("experience")}   <span class="dim">labs & internships timeline</span>` },
          { html: `  ${c("skills")}       <span class="dim">the technical toolbox</span>` },
          { html: `  ${c("news")}         <span class="dim">latest updates — follow along</span>` },
          { html: `  ${c("contact")}      <span class="dim">get in touch</span>` },
          { html: `  ${c("resume")}       <span class="dim">view resume</span>` },
          { html: `  ${c("linkedin")}     <span class="dim">open LinkedIn profile</span>` },
          { html: `  ${c("github")}       <span class="dim">open GitHub</span>` },
          { html: `<span class="h">INTERACTIVE</span>` },
          { html: `  ${c("bear")}         <span class="dim">chat with ${Term.esc(DATA.bear.name)}, the AI assistant bear</span>` },
          { html: `  ${c("play")}         <span class="dim">resistor color-code challenge (earn XP)</span>` },
          { html: `  ${c("stats")}        <span class="dim">your XP, level & achievements</span>` },
          { html: `  ${c("clear")}        <span class="dim">clear the screen</span>` },
          { html: `<span class="dim">  ↑/↓ history · Tab autocomplete · a few undocumented commands exist — ${Term.esc(DATA.bear.name)} knows them all</span>` },
        ]);
      },
    },

    whoami: {
      desc: "about Zack",
      async run() {
        const lines = DATA.whoami.map(t => ({ html: Term.esc(t) }));
        lines.push({ html: "" });
        lines.push({ html: `<span class="dim">→ dig deeper: ${Term.cmdLink("research")} · ${Term.cmdLink("experience")} · ${Term.cmdLink("contact")}</span>` });
        await Term.printLines(lines);
      },
    },

    research: {
      desc: "research areas",
      async run() {
        const lines = [{ html: `<span class="h">RESEARCH — ${Term.esc(DATA.school)}</span>` }];
        for (const r of DATA.research) {
          lines.push({
            html:
              `<div class="card">` +
              `<div class="card-title">▸ ${Term.esc(r.title)}</div>` +
              `<div class="card-sub">${Term.esc(r.sub)}</div>` +
              `<div class="card-desc">${Term.esc(r.desc)}</div>` +
              `<div>${Term.tagPills(r.tags)}</div>` +
              `</div>`,
          });
        }
        lines.push({ html: `<span class="dim">→ want the story behind these? ask the ${Term.cmdLink("bear")}</span>` });
        await Term.printLines(lines, 40);
      },
    },

    experience: {
      desc: "timeline",
      async run() {
        const lines = [{ html: `<span class="h">EXPERIENCE</span>` }];
        for (const e of DATA.experience) {
          lines.push({
            html:
              `<div class="card">` +
              `<div class="card-title">▸ ${Term.esc(e.role)}</div>` +
              `<div class="card-sub">${Term.esc(e.org)} · ${Term.esc(e.dates)}</div>` +
              `<div class="card-desc">${Term.esc(e.desc)}</div>` +
              `</div>`,
          });
        }
        await Term.printLines(lines, 40);
      },
    },

    skills: {
      desc: "toolbox",
      async run() {
        const lines = [{ html: `<span class="h">SKILLS</span>` }];
        for (const [cat, items] of Object.entries(DATA.skills)) {
          lines.push({ html: `<span class="acc2 bold">${Term.esc(cat)}</span>` });
          lines.push({ html: `  ${Term.tagPills(items)}` });
        }
        await Term.printLines(lines, 30);
      },
    },

    news: {
      desc: "updates feed",
      async run() {
        const lines = [
          { html: `<span class="h">NEWS — what Zack is up to</span>` },
          { html: `<span class="dim">(check back here to keep up with the journey)</span>` },
        ];
        for (const n of DATA.news) {
          lines.push({ html: `<div class="news-item"><span class="news-date">[${Term.esc(n.date)}]</span> ${Term.esc(n.text)}</div>` });
        }
        await Term.printLines(lines, 40);
      },
    },

    contact: {
      desc: "get in touch",
      async run() {
        const L = DATA.links;
        const lines = [
          { html: `<span class="h">CONTACT</span>` },
          { html: `  email     <a href="mailto:${Term.esc(DATA.email)}">${Term.esc(DATA.email)}</a>` },
          { html: `  linkedin  <a href="${Term.esc(L.linkedin)}" target="_blank" rel="noopener">${Term.esc(L.linkedin.replace("https://www.", ""))}</a>` },
        ];
        if (L.github) lines.push({ html: `  github    <a href="${Term.esc(L.github)}" target="_blank" rel="noopener">${Term.esc(L.github.replace("https://", ""))}</a>` });
        if (L.scholar) lines.push({ html: `  scholar   <a href="${Term.esc(L.scholar)}" target="_blank" rel="noopener">google scholar</a>` });
        lines.push({ html: `` });
        lines.push({ html: `<span class="dim">Zack is actively seeking research & engineering roles — say hi!</span>` });
        await Term.printLines(lines);
      },
    },

    linkedin: {
      desc: "open LinkedIn",
      async run() {
        await Term.printLines([{ html: `<span class="ok">→ opening LinkedIn...</span> <a href="${Term.esc(DATA.links.linkedin)}" target="_blank" rel="noopener">${Term.esc(DATA.links.linkedin)}</a>` }]);
        window.open(DATA.links.linkedin, "_blank", "noopener");
      },
    },

    github: {
      desc: "open GitHub",
      async run() {
        if (DATA.links.github) {
          await Term.printLines([{ html: `<span class="ok">→ opening GitHub...</span> <a href="${Term.esc(DATA.links.github)}" target="_blank" rel="noopener">${Term.esc(DATA.links.github)}</a>` }]);
          window.open(DATA.links.github, "_blank", "noopener");
        } else {
          await Bear.say("Zack hasn't wired up his GitHub link yet — I keep telling him. Meanwhile, [[linkedin]] has everything!", "grumpy");
        }
      },
    },

    resume: {
      desc: "view resume",
      async run() {
        if (DATA.links.resume) {
          await Term.printLines([{ html: `<span class="ok">→ opening resume...</span> <a href="${Term.esc(DATA.links.resume)}" target="_blank" rel="noopener">resume.pdf</a>` }]);
          window.open(DATA.links.resume, "_blank", "noopener");
        } else {
          await Bear.say("The PDF is still warm from the printer — not uploaded yet. The full profile lives on [[linkedin]] in the meantime!", "sleepy");
        }
      },
    },

    bear: {
      desc: "chat with the bear",
      async run() {
        Term.setMode("bear");
        await Bear.enterChat();
      },
    },

    play: {
      desc: "resistor challenge",
      async run() {
        Term.setMode("game");
        Game.resistor.streak = 0;
        await Term.printLines([
          { html: `<span class="h">RESISTOR COLOR-CODE CHALLENGE</span>` },
          { html: `<span class="dim">Read the color bands, pick the resistance. 4-band resistors, gold tolerance.</span>` },
          { html: `<span class="dim">Answer with <span class="bold">1</span>, <span class="bold">2</span> or <span class="bold">3</span> · +5 XP per correct · 5-streak = achievement · type <span class="bold">exit</span> to quit</span>` },
        ]);
        await Term.askResistor();
      },
    },

    stats: {
      desc: "XP & achievements",
      async run() {
        const s = Game.state;
        const lvl = Game.levelFor(s.xp);
        const next = Game.nextLevel(s.xp);
        const span = next ? next.xp - lvl.xp : 1;
        const into = next ? s.xp - lvl.xp : 1;
        const filled = Math.round((into / span) * 20);
        const bar = "█".repeat(Math.min(filled, 20)) + "░".repeat(Math.max(20 - filled, 0));
        const lines = [
          { html: `<span class="h">YOUR STATS</span>` },
          { html: `  level     <span class="acc bold">${Term.esc(lvl.name)}</span>` },
          { html: `  xp        <span class="bar">[${bar}]</span> ${s.xp}${next ? " / " + next.xp + " → " + Term.esc(next.name) : " · MAX"}` },
          { html: `  explored  ${Game.exploredPct()}% of the powerfolio` },
          { html: `  streak    best resistor streak: ${s.bestStreak}` },
          { html: `<span class="h">ACHIEVEMENTS</span>` },
        ];
        for (const [id, def] of Object.entries(Game.achievementDefs)) {
          const got = s.achievements.includes(id);
          lines.push({
            html: got
              ? `  <span class="ok">✓</span> <span class="bold">${Term.esc(def.name)}</span> <span class="dim">— ${Term.esc(def.desc)}</span>`
              : `  <span class="dim">· locked — keep exploring</span>`,
          });
        }
        await Term.printLines(lines, 20);
      },
    },

    clear: {
      desc: "clear screen",
      async run() {
        Term.out.innerHTML = "";
      },
    },

    exit: {
      desc: "",
      hidden: true,
      async run() {
        await Bear.say("There's no escape from ZackOS. This is your life now. (Okay fine, you can close the tab. But the XP stays with me.)", "sneaky");
      },
    },

    /* ------------- secret commands ------------- */

    sudo: {
      secret: true,
      async run(args) {
        await Term.printLines([
          { html: `<span class="err">guest is not in the sudoers file. This incident will be reported.</span>` },
        ]);
        await Term.sleep(Term.reducedMotion ? 0 : 500);
        await Bear.say("...reported to ME. I saw everything. Nice try though — here's some XP for the ambition.", "grumpy");
      },
    },

    ohm: {
      secret: true,
      async run() {
        const wisdom = [
          "V = I × R. Resistance is NOT futile — it's exactly V/I.",
          "Ohm my god, you found this command.",
          "A resistor's favorite dance? The watt-usi. (I'll see myself out.)",
          "Fun fact: Zack characterizes wide-bandgap semiconductors — materials that laugh in the face of ordinary resistance.",
        ];
        await Bear.say(wisdom[Math.floor(Math.random() * wisdom.length)], "cool");
      },
    },

    coffee: {
      secret: true,
      async run() {
        await Term.printLines([
          { html: `<span class="amber">      ( (</span>` },
          { html: `<span class="amber">       ) )</span>` },
          { html: `<span class="amber">    ........</span>` },
          { html: `<span class="amber">    |      |]</span>` },
          { html: `<span class="amber">    \\      /</span>` },
          { html: `<span class="amber">     '----'</span>` },
          { html: `<span class="dim">brewing......... done.</span>` },
        ], 90);
        await Bear.say("Lab rule #1: the electron microscope waits for no one, but everyone waits for the coffee.", "sleepy");
      },
    },

    neofetch: {
      secret: true,
      async run() {
        const lvl = Game.levelFor(Game.state.xp).name;
        await Term.printLines([
          { html: `<span class="amber bold">        ʕ •ᴥ• ʔ</span>   <span class="acc bold">guest@zackwoodel</span>` },
          { html: `<span class="dim">   ─────────────────────────────────</span>` },
          { html: `   <span class="acc2">OS</span>        ZackOS 1.0 LTS (Powerfolio)` },
          { html: `   <span class="acc2">Host</span>      ${Term.esc(DATA.school)}` },
          { html: `   <span class="acc2">Kernel</span>    EE-student 5.0 · quantum-materials build` },
          { html: `   <span class="acc2">Shell</span>     bear.sh v${Term.esc(DATA.bear.version)}` },
          { html: `   <span class="acc2">Location</span>  ${Term.esc(DATA.location)}` },
          { html: `   <span class="acc2">Labs</span>      3 active research groups + ORNL` },
          { html: `   <span class="acc2">Uptime</span>    powered by coffee since 2024` },
          { html: `   <span class="acc2">You</span>       ${Term.esc(lvl)} · ${Game.state.xp} XP` },
        ], 40);
      },
    },

    matrix: {
      secret: true,
      async run() {
        await Term.printLines([{ html: `<span class="ok">wake up, neo... (click anywhere or press ESC to exit)</span>` }]);
        Term.startMatrix();
      },
    },
  },

  aliases: {
    about: "whoami", who: "whoami", bio: "whoami",
    work: "experience", jobs: "experience", labs: "experience",
    projects: "research", papers: "research",
    email: "contact", socials: "contact", social: "contact",
    updates: "news", blog: "news",
    cv: "resume",
    volt: "bear", chat: "bear",
    game: "play",
    achievements: "stats", xp: "stats", level: "stats",
    cls: "clear",
    ls: "help", "?": "help",
  },

  /* ============================================================
     command dispatch
     ============================================================ */

  async runCommand(raw) {
    const text = raw.trim();
    if (!text) return;

    const [name0, ...rest] = text.toLowerCase().split(/\s+/);
    const name = this.aliases[name0] || name0;
    const cmd = this.commands[name];

    if (cmd) {
      if (!cmd.hidden) Game.onCommand(name, !!cmd.secret);
      await cmd.run(rest.join(" "));
    } else {
      // near-miss suggestion: prefix match against known commands
      const known = Object.keys(this.commands).filter(c => !this.commands[c].secret && !this.commands[c].hidden);
      const guess = known.find(c => c.startsWith(name.slice(0, 3)));
      await this.printLines([
        { html: `<span class="err">command not found:</span> ${this.esc(name0)}` },
        { html: `<span class="dim">${guess ? `did you mean ${this.cmdLink(guess)}? · ` : ""}type ${this.cmdLink("help")} to see what I've got</span>` },
      ]);
    }
  },

  async submit(raw) {
    if (this.busy) {
      // fast-forward the current animation, then submit normally
      this.skipType = true;
      await this.sleep(60);
      if (this.busy) return;
    }
    const text = raw.trim();
    this.echo(raw);
    this.input.value = "";
    if (!text) return;

    this.history.push(text);
    this.hIdx = this.history.length;

    if (this.mode === "bear") {
      const low = text.toLowerCase();
      if (["exit", "quit", "bye", "goodbye", "q"].includes(low)) {
        this.setMode("shell");
        await Bear.say("Later. Type [[bear]] whenever you want me back.", "happy");
      } else {
        await Bear.chat(text);
      }
      return;
    }

    if (this.mode === "game") {
      await this.handleGameInput(text);
      return;
    }

    await this.runCommand(text);
  },

  /* ============================================================
     resistor game I/O
     ============================================================ */

  async askResistor() {
    const q = Game.newResistorQuestion();
    const colors = Game.resistor.colors;
    const [d1, d2, m] = q.bands;
    const bandHtml = [d1, d2, m].map(i => {
      const c = colors[i];
      return `<span class="band" style="background:${c.hex}"></span>`;
    }).join("");
    const nameHtml = [d1, d2, m].map(i => {
      const c = colors[i];
      return `<span class="band-name" style="background:${c.hex};color:${c.fg}">${c.name}</span>`;
    }).join("");

    const opts = q.options.map((v, i) => `  <span class="bold">${i + 1}</span>) ${Game.fmtOhms(v)}`).join("\n");

    await this.printLines([
      { html: `` },
      { html: `<span class="resistor"><span class="lead">────</span><span class="body">${bandHtml}<span class="band" style="background:#d4af37"></span></span><span class="lead">────</span></span>` },
      { html: `bands: ${nameHtml} <span class="band-name" style="background:#d4af37;color:#222">gold</span>` },
      { html: this.esc("what's the resistance?") },
      { html: opts.split("\n").map(o => o).join("<br>") },
    ], 0);
  },

  async handleGameInput(text) {
    const low = text.toLowerCase();
    if (["exit", "quit", "q", "stop"].includes(low)) {
      this.setMode("shell");
      const best = Game.state.bestStreak;
      await Bear.say(`Good session. Best streak: ${best}. ${best >= 5 ? "Certified Electrician — Zack would be proud." : "Come back for that 5-streak — Certified Electrician awaits."}`, "cool");
      return;
    }
    const n = parseInt(low, 10);
    if (!(n >= 1 && n <= 3)) {
      await this.printLines([{ html: `<span class="dim">answer with 1, 2 or 3 — or type exit</span>` }]);
      return;
    }
    const res = Game.answerResistor(n - 1);
    if (!res) return;
    if (res.correct) {
      await this.printLines([{ html: `<span class="ok">✓ correct! ${this.esc(res.answer)} · +5 XP · streak: ${res.streak}</span>` }]);
      if (res.streak === 5) await Bear.say("Five in a row. You've officially out-resistored most freshmen.", "excited");
    } else {
      await this.printLines([{ html: `<span class="err">✗ nope — it was ${this.esc(res.answer)}. streak reset.</span>` }]);
    }
    await this.askResistor();
  },

  /* ============================================================
     matrix easter egg
     ============================================================ */

  matrixTimer: null,

  startMatrix() {
    const canvas = document.getElementById("matrixCanvas");
    const ctx = canvas.getContext("2d");
    canvas.classList.remove("hidden");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = "アイウエオカキクケコサシスセソ0101ZACKWOODELΩ";
    const size = 16;
    const cols = Math.floor(canvas.width / size);
    const drops = Array(cols).fill(1);

    this.matrixTimer = setInterval(() => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#4af0b0";
      ctx.font = size + "px monospace";
      for (let i = 0; i < drops.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * size, drops[i] * size);
        if (drops[i] * size > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }, 50);

    const stop = () => {
      clearInterval(this.matrixTimer);
      canvas.classList.add("hidden");
      canvas.removeEventListener("click", stop);
      document.removeEventListener("keydown", escStop);
      this.input.focus();
    };
    const escStop = (e) => { if (e.key === "Escape") stop(); };
    canvas.addEventListener("click", stop);
    document.addEventListener("keydown", escStop);
  },

  /* ============================================================
     boot sequence
     ============================================================ */

  bannerZack: [
    "███████╗ █████╗  ██████╗██╗  ██╗",
    "╚══███╔╝██╔══██╗██╔════╝██║ ██╔╝",
    "  ███╔╝ ███████║██║     █████╔╝ ",
    " ███╔╝  ██╔══██║██║     ██╔═██╗ ",
    "███████╗██║  ██║╚██████╗██║  ██╗",
    "╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝",
  ],
  bannerWoodel: [
    "██╗    ██╗ ██████╗  ██████╗ ██████╗ ███████╗██╗     ",
    "██║    ██║██╔═══██╗██╔═══██╗██╔══██╗██╔════╝██║     ",
    "██║ █╗ ██║██║   ██║██║   ██║██║  ██║█████╗  ██║     ",
    "██║███╗██║██║   ██║██║   ██║██║  ██║██╔══╝  ██║     ",
    "╚███╔███╔╝╚██████╔╝╚██████╔╝██████╔╝███████╗███████╗",
    " ╚══╝╚══╝  ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚══════╝",
  ],

  bootLines: [
    { text: "ZackOS BIOS v1.0 — Whitacre Engineering Build", cls: "dim", d: 300 },
    { text: "Memory check: 640K ought to be enough .......... OK", cls: "dim", d: 250 },
    { text: "Detecting quantum materials .................... FOUND", cls: "dim", d: 250 },
    { text: "Calibrating oscilloscope ....................... OK", cls: "dim", d: 200 },
    { text: "Spinning up wide-bandgap devices ............... OK", cls: "dim", d: 250 },
    { text: "Loading bear.sys ............................... ʕ •ᴥ• ʔ OK", cls: "amber", d: 400 },
    { text: "Mounting /research ............................. OK", cls: "dim", d: 200 },
    { text: "Starting powerfolio service .................... done", cls: "ok", d: 350 },
    { text: "", d: 150 },
  ],

  async boot() {
    const returning = Game.state.discovered.length > 0;

    // any key/click skips the boot animation
    const skip = () => { this.skipBoot = true; };
    document.addEventListener("keydown", skip, { once: true });
    document.addEventListener("pointerdown", skip, { once: true });

    if (!this.reducedMotion && !returning) {
      // wall-clock schedule: throttled timers catch up instead of stalling
      let acc = 0;
      const due = this.bootLines.map(b => (acc += b.d, acc - b.d));
      const t0 = performance.now();
      let i = 0;
      while (i < this.bootLines.length) {
        if (this.skipBoot) {
          while (i < this.bootLines.length) { const b = this.bootLines[i++]; this.line(this.esc(b.text), b.cls); }
          break;
        }
        const elapsed = performance.now() - t0;
        while (i < this.bootLines.length && due[i] <= elapsed) {
          const b = this.bootLines[i++];
          this.line(this.esc(b.text), b.cls);
        }
        if (i < this.bootLines.length) await this.sleep(60);
      }
    }
    document.removeEventListener("keydown", skip);
    document.removeEventListener("pointerdown", skip);

    // banner + tagline
    this.line(this.esc(this.bannerZack.join("\n")), "banner");
    this.line(this.esc(this.bannerWoodel.join("\n")), "banner");
    this.line(`<span class="acc2 bold">${this.esc(DATA.headline)}</span>`);
    this.line(`<span class="dim">${this.esc(DATA.school)} · ${this.esc(DATA.location)}</span>`);
    this.line(`<span class="dim">${"─".repeat(52)}</span>`);

    // input is usable immediately — Volt talks while you type
    this.inputRow.classList.remove("hidden");
    document.getElementById("chips").classList.remove("hidden");
    this.booted = true;
    this.input.focus();
    this.scrollToBottom();

    await Bear.greet(returning);
    this.scrollToBottom();
  },

  /* ============================================================
     init
     ============================================================ */

  buildChips() {
    const box = document.getElementById("chips");
    const chips = [
      ["help", ""], ["whoami", ""], ["research", ""], ["experience", ""],
      ["news", ""], ["bear", "", "chip-bear"], ["play", ""], ["stats", ""], ["contact", ""],
    ];
    for (const [name, icon, cls] of chips) {
      const b = document.createElement("button");
      b.className = "chip" + (cls ? " " + cls : "");
      b.textContent = icon ? `${name} ${icon}` : name;
      b.addEventListener("click", async () => {
        if (this.busy) return;
        this.echo(name);
        if (this.mode !== "shell") {
          // chips always act like shell commands; leave any sub-mode first
          this.setMode("shell");
        }
        await this.runCommand(name);
        this.input.focus();
      });
      box.appendChild(b);
    }
  },

  init() {
    this.out = document.getElementById("output");
    this.input = document.getElementById("cmdline");
    this.inputRow = document.getElementById("inputRow");
    this.promptLabel = document.getElementById("promptLabel");
    this.screen = document.getElementById("screen");

    Game.load();
    this.buildChips();

    // any keypress fast-forwards whatever is currently animating
    document.addEventListener("keydown", () => {
      if (this.busy) this.skipType = true;
    });

    // keyboard
    this.input.addEventListener("keydown", (e) => {
      this.lastActivity = Date.now();
      if (e.key === "Enter") {
        this.submit(this.input.value);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (this.hIdx > 0) {
          this.hIdx--;
          this.input.value = this.history[this.hIdx] || "";
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (this.hIdx < this.history.length - 1) {
          this.hIdx++;
          this.input.value = this.history[this.hIdx] || "";
        } else {
          this.hIdx = this.history.length;
          this.input.value = "";
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        if (this.mode !== "shell") return;
        const cur = this.input.value.trim().toLowerCase();
        if (!cur) return;
        const pool = Object.keys(this.commands).filter(c => !this.commands[c].secret && !this.commands[c].hidden);
        const hit = pool.find(c => c.startsWith(cur));
        if (hit) this.input.value = hit;
      }
    });

    // click on terminal focuses input (unless user is selecting text)
    document.getElementById("terminal").addEventListener("click", () => {
      if (!window.getSelection().toString() && this.booted) this.input.focus({ preventScroll: true });
    });

    // clickable [[commands]] in output
    this.out.addEventListener("click", async (e) => {
      const el = e.target.closest(".cmd");
      if (!el || this.busy) return;
      const name = el.dataset.cmd;
      this.echo(name);
      if (this.mode !== "shell") this.setMode("shell");
      await this.runCommand(name);
      this.input.focus();
    });

    // idle nudges from the bear
    setInterval(() => {
      if (this.booted && !this.busy && this.mode === "shell" && Date.now() - this.lastActivity > 60000) {
        this.lastActivity = Date.now();
        Bear.idleTip();
      }
    }, 10000);

    this.boot();
  },
};

document.addEventListener("DOMContentLoaded", () => Term.init());
