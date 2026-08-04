/* ============================================================
   bear.js — Volt, the AI assistant bear.
   Speech bubbles, moods, and a keyword-intent chat brain
   fed by DATA.bearBrain (see data.js).
   ============================================================ */

const Bear = {
  moods: {
    happy:   "ʕ •ᴥ• ʔ",
    excited: "ʕ ✧ᴥ✧ ʔ",
    cool:    "ʕ ⌐■ᴥ■ ʔ",
    sneaky:  "ʕ ¬ᴥ¬ ʔ",
    sleepy:  "ʕ -ᴥ- ʔ",
    love:    "ʕ ♥ᴥ♥ ʔ",
    grumpy:  "ʕ ಠᴥಠ ʔ",
  },

  face(mood) {
    return this.moods[mood] || this.moods.happy;
  },

  /* Render a speech-bubble line from Volt. Text supports
     [[command]] → clickable command link. */
  async say(text, mood, instant) {
    const out = document.getElementById("output");
    const row = document.createElement("div");
    row.className = "bear-line";

    const face = document.createElement("span");
    face.className = "bear-face";
    face.textContent = this.face(mood);

    const bubble = document.createElement("div");
    bubble.className = "bear-bubble";

    row.appendChild(face);
    row.appendChild(bubble);
    out.appendChild(row);

    const html = this.render(text);
    if (instant || Term.reducedMotion) {
      bubble.innerHTML = html;
      Term.scrollToBottom();
      return;
    }

    // Typewriter paced by wall clock: reveal count derives from
    // elapsed time, so throttled timers just catch up in bigger
    // steps instead of stretching the animation. Keypress skips.
    const plain = text.replace(/\[\[(.+?)\]\]/g, "$1").replace(/\{name\}/g, DATA.bear.name);
    const CHAR_MS = 12;
    Term.busy = true;
    Term.skipType = false;
    const t0 = performance.now();
    let shown = 0;
    while (shown < plain.length && !Term.skipType) {
      shown = Math.min(plain.length, Math.max(shown + 1, Math.floor((performance.now() - t0) / CHAR_MS)));
      bubble.textContent = plain.slice(0, shown);
      Term.scrollToBottom();
      await Term.sleep(CHAR_MS);
    }
    bubble.innerHTML = html;
    Term.busy = false;
    Term.scrollToBottom();
  },

  render(text) {
    const esc = Term.esc(text.replace(/\{name\}/g, DATA.bear.name));
    return esc.replace(/\[\[(.+?)\]\]/g, `<span class="cmd" data-cmd="$1">$1</span>`);
  },

  /* boot-time greeting */
  async greet(returning) {
    if (returning) {
      const lvl = Game.levelFor(Game.state.xp).name;
      await this.say(`Welcome back! I remembered you — still a ${lvl} with ${Game.state.xp} XP. Type [[help]] to keep exploring, or [[stats]] to see your progress.`, "happy");
    } else {
      await this.say(`Howdy — I'm ${DATA.bear.name}, Zack's assistant bear, and I'll be your guide. Type [[help]] (or tap a button below) to start exploring. You'll earn XP for everything you discover.`, "happy");
    }
  },

  /* entering chat mode via the `bear` command */
  async enterChat() {
    await Term.printLines([
      { html: `<span class="amber bold">── ${DATA.bear.name} v${DATA.bear.version} · chat mode ──</span>` },
      { html: `<span class="dim">Ask me anything about Zack. Type <span class="bold">exit</span> to leave.</span>` },
    ]);
    await this.say("You now have my full attention. What do you want to know? (psst: try asking about secrets)", "excited");
  },

  /* one round of chat: match visitor text against the brain */
  async chat(text) {
    Game.onBearMessage();
    const q = text.toLowerCase();

    let best = null;
    let bestScore = 0;
    for (const entry of DATA.bearBrain) {
      let score = 0;
      for (const kw of entry.intents) {
        if (q.includes(kw)) score += kw.length; // longer keyword = stronger signal
      }
      if (score > bestScore) { bestScore = score; best = entry; }
    }

    // thinking indicator
    const out = document.getElementById("output");
    const think = document.createElement("div");
    think.className = "line dim";
    think.textContent = `${DATA.bear.name} is thinking...`;
    out.appendChild(think);
    Term.scrollToBottom();
    await Term.sleep(Term.reducedMotion ? 0 : 450);
    think.remove();

    if (best) {
      await this.say(best.reply, best.mood);
    } else {
      const fb = DATA.bearFallbacks[Math.floor(Math.random() * DATA.bearFallbacks.length)];
      await this.say(fb, "sleepy");
    }
  },

  /* occasional nudge when the visitor goes quiet */
  tips: [
    "Psst — try [[play]]. Resistor color codes. Bragging rights at stake.",
    "Did you check [[news]]? That's how you keep up with Zack's journey.",
    "Type [[bear]] to chat with me directly. I know secrets.",
  ],
  tipIdx: 0,

  idleTip() {
    if (this.tipIdx >= 2) return; // don't be annoying
    const tip = this.tips[this.tipIdx % this.tips.length];
    this.tipIdx++;
    this.say(tip, "sneaky");
  },
};
