/* =================================================================
   js/ui.js
   -----------------------------------------------------------------
   Presentation layer: navigation state, mobile menu, FAQ accordion,
   toast notifications and rendering of the Schedule / Resources
   lists.

   ALL CONTENT BELOW IS SAMPLE DATA — edit the arrays to your course.
   ================================================================= */

/* ----------------------------- DATA ---------------------------- */

/* Official curriculum for the Intermediate Plant Genome Bioinformatics
   Workshop. All sessions are conducted entirely IN PERSON (face-to-face). */
const SCHEDULE = [
  {
    day: "Day 0 · Mon 26 Oct 2026",
    title: "Arrival & Pre-workshop Technical Setup",
    time: "13:30 – 16:00",
    tag: "Setup",
    accent: "sage",
    lead: "Training Team",
    sessions: [
      { time: "13:30 – 16:00", activity: "Arrival & Pre-workshop Technical Setup", lead: "Training Team" }
    ]
  },
  {
    day: "Day 1 · Tue 27 Oct 2026",
    title: "Linux & Command-Line Foundations",
    time: "08:00 – 17:00",
    tag: "Module 1",
    accent: "leaf",
    lead: "Lord Hendrix Barboza",
    sessions: [
      { time: "08:00 – 08:30", activity: "Registration", lead: "" },
      { time: "08:30 – 09:30", activity: "Opening Program", lead: "SEARCA Team" },
      { time: "09:30 – 10:00", activity: "Intro Workshop Recap", lead: "Frances Nikki Borja" },
      { time: "10:00 – 10:15", activity: "Coffee Break", lead: "" },
      { time: "10:15 – 12:00", activity: "Lecture: Introduction to Linux", lead: "Lord Hendrix Barboza" },
      { time: "12:00 – 13:00", activity: "Lunch Break", lead: "" },
      { time: "13:00 – 15:00", activity: "Hands-on", lead: "Lord Hendrix Barboza & Team" },
      { time: "15:00 – 15:15", activity: "Coffee Break", lead: "" },
      { time: "15:15 – 16:45", activity: "Hands-on", lead: "Lord Hendrix Barboza & Team" },
      { time: "16:45 – 17:00", activity: "Wrap Up of Day 1", lead: "Frances Nikki Borja" }
    ]
  },
  {
    day: "Day 2 · Wed 28 Oct 2026",
    title: "Variant Calling & SNP-Seek",
    time: "08:30 – 17:00",
    tag: "Module 2",
    accent: "forest",
    lead: "Frances Nikki Borja",
    sessions: [
      { time: "08:30 – 09:00", activity: "Review & Q&A for Module 1", lead: "Frances Nikki Borja" },
      { time: "09:00 – 10:15", activity: "Lecture: Variant Calling", lead: "Frances Nikki Borja" },
      { time: "10:15 – 10:30", activity: "Coffee Break", lead: "" },
      { time: "10:30 – 12:00", activity: "Demo: Variant Calling Pipeline", lead: "Frances Nikki Borja" },
      { time: "12:00 – 13:00", activity: "Lunch Break", lead: "" },
      { time: "13:00 – 15:15", activity: "Hands-on", lead: "Frances Nikki Borja & Team" },
      { time: "15:15 – 15:30", activity: "Coffee Break", lead: "" },
      { time: "15:30 – 16:45", activity: "SNP-Seek", lead: "Lord Hendrix Barboza" },
      { time: "16:45 – 17:00", activity: "Day 2 Wrap-up", lead: "Frances Nikki Borja" }
    ]
  },
  {
    day: "Day 3 · Thu 29 Oct 2026",
    title: "Gen AI & Comparative Genomics",
    time: "08:30 – 17:00",
    tag: "Module 3",
    accent: "leaf",
    lead: "Victor Jun Ulat",
    sessions: [
      { time: "08:30 – 09:00", activity: "Review and Q & A for Module 2", lead: "Frances Nikki Borja" },
      { time: "09:00 – 10:00", activity: "Lecture: Bioinformatics and Gen AI", lead: "Victor Jun Ulat" },
      { time: "10:00 – 10:15", activity: "Coffee Break", lead: "" },
      { time: "10:15 – 10:45", activity: "Tutorial: Mastering Genbank", lead: "Frances Nikki Borja" },
      { time: "10:45 – 12:00", activity: "Lecture: Comparative Genomics", lead: "Victor Jun Ulat" },
      { time: "12:00 – 13:00", activity: "Lunch Break", lead: "" },
      { time: "13:00 – 15:00", activity: "Hands-on", lead: "Victor Jun Ulat & Team" },
      { time: "15:00 – 15:15", activity: "Coffee Break", lead: "" },
      { time: "15:15 – 16:15", activity: "Hands-on", lead: "Victor Jun Ulat & Team" },
      { time: "16:15 – 16:45", activity: "Project Assignments", lead: "Training Team" },
      { time: "16:45 – 17:00", activity: "Day 3 Wrap-up", lead: "Victor Jun Ulat" }
    ]
  },
  {
    day: "Day 4 · Fri 30 Oct 2026",
    title: "Integration & Final Presentations",
    time: "08:30 – 17:00",
    tag: "Integration",
    accent: "forest",
    lead: "Training Team",
    sessions: [
      { time: "08:30 – 09:00", activity: "Integration project", lead: "Frances Nikki Borja" },
      { time: "09:00 – 10:30", activity: "Group work", lead: "Groups" },
      { time: "10:30 – 10:45", activity: "Coffee Break", lead: "" },
      { time: "10:45 – 12:00", activity: "Group work", lead: "Groups" },
      { time: "12:00 – 13:00", activity: "Lunch Break", lead: "" },
      { time: "13:00 – 14:00", activity: "Finalization of Group work", lead: "Groups" },
      { time: "14:00 – 15:15", activity: "Final Presentations", lead: "All" },
      { time: "15:15 – 15:30", activity: "Coffee Break", lead: "" },
      { time: "15:30 – 16:00", activity: "Course Wrap-up", lead: "Training Team" },
      { time: "16:00 – 17:00", activity: "Closing Program", lead: "SEARCA" }
    ]
  }
];

const RESOURCES = [
  { name: "FastQC", icon: "fa-solid fa-chart-line", url: "https://www.bioinformatics.babraham.ac.uk/projects/fastqc/" },
  { name: "fastp", icon: "fa-solid fa-filter", url: "https://github.com/OpenGene/fastp" },
  { name: "bowtie2", icon: "fa-solid fa-align-left", url: "https://bowtie-bio.sourceforge.net/bowtie2/" },
  { name: "SAMtools", icon: "fa-solid fa-dna", url: "http://www.htslib.org/doc/samtools.html" },
  { name: "bcftools", icon: "fa-solid fa-sitemap", url: "http://www.htslib.org/doc/bcftools.html" },
  { name: "bedtools", icon: "fa-solid fa-table-cells", url: "https://bedtools.readthedocs.io/" },
  { name: "VCFtools", icon: "fa-solid fa-file-code", url: "https://vcftools.github.io/man_latest.html" },
  { name: "IGV", icon: "fa-solid fa-dna", url: "https://igv.org/doc/" },
  { name: "SnpEff", icon: "fa-solid fa-tag", url: "https://pcingola.github.io/SnpEff/" },
  { name: "Conda", icon: "fa-solid fa-box", url: "https://docs.conda.io/" },
  { name: "Mamba", icon: "fa-solid fa-cubes", url: "https://mamba.readthedocs.io/" },
  { name: "Git", icon: "fa-brands fa-git-alt", url: "https://git-scm.com/doc" },
  { name: "WSL2", icon: "fa-brands fa-windows", url: "https://learn.microsoft.com/en-us/windows/wsl/" },
  { name: "Ollama", icon: "fa-solid fa-robot", url: "https://ollama.com/" },
  { name: "Galaxy Platform", icon: "fa-solid fa-atom", url: "https://usegalaxy.org" },
  { name: "nf-core Pipelines", icon: "fa-solid fa-diagram-project", url: "https://nf-co.re" },
  { name: "Bioconductor", icon: "fa-solid fa-flask", url: "https://bioconductor.org" }
];

const FAQS = [
  {
    q: "Is the workshop in person?",
    a: "Yes — all tracks are conducted entirely in person (face-to-face). There are no online or virtual sessions."
  },
  {
    q: "What do I need to set up before the workshop?",
    a: "Bring a laptop and, if you can, the tools pre-installed — FastQC, fastp, bowtie2, SAMtools, VCFtools and IGV (versions are listed with the materials). A working WSL2 installation is required: complete the WSL2 dry-run check by Oct 15. The Day 0 pre-workshop setup block (Mon 26 Oct, 13:30–16:00) resolves any remaining environment or PATH issues on site, and USB installers are provided."
  },
  {
    q: "Do I need to install software locally?",
    a: "Practicals run in your local WSL2 environment and on on-site workstations. Bring a laptop — setup is verified together during the Day 0 pre-workshop setup block and USB installers are available."
  },
  {
    q: "Where are the session materials posted?",
    a: "Slides and datasets are shared in the workshop Google Drive folder and updated as the workshop progresses."
  },
  {
    q: "How do I post a question to the instructor?",
    a: "Sign in with your participant Google account using the button in the Q&A card, type your question and press Submit. It appears instantly in the Recent Questions feed."
  }
];

/* --------------------------- TOASTS ---------------------------- */

const TOAST_ICONS = {
  success: "fa-circle-check text-forest",
  error: "fa-circle-exclamation text-red-600",
  info: "fa-circle-info text-leaf-dark"
};

/**
 * Show a dismissible toast notification.
 * @param {string} message
 * @param {"success"|"error"|"info"} type
 */
export function showToast(message, type = "info") {
  const region = document.getElementById("toast-region");
  if (!region) return;

  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  el.setAttribute("role", type === "error" ? "alert" : "status");
  el.innerHTML = `
    <i class="fa-solid ${TOAST_ICONS[type] || TOAST_ICONS.info} mt-0.5" aria-hidden="true"></i>
    <p class="flex-1 text-sm font-medium text-charcoal">${escapeHtml(message)}</p>
    <button type="button" class="text-charcoal-soft transition hover:text-charcoal" aria-label="Dismiss notification">
      <i class="fa-solid fa-xmark" aria-hidden="true"></i>
    </button>`;

  const remove = () => {
    el.classList.add("toast-out");
    el.addEventListener("animationend", () => el.remove(), { once: true });
  };

  el.querySelector("button").addEventListener("click", remove);
  region.appendChild(el);
  setTimeout(remove, 4500);
}

/* --------------------------- RENDERERS ------------------------- */

const DAY_ACCENT = {
  forest: "day-accent-forest",
  leaf: "day-accent-leaf",
  sage: "day-accent-sage"
};

/* Each day is a chronological table; break rows are muted. */
function renderSessionRows(sessions = []) {
  return sessions
    .map(({ time, activity, lead }) => {
      const isBreak = /break/i.test(activity);
      return `<tr class="${isBreak ? "schedule-row-break" : ""}">
        <td class="schedule-cell-time">${escapeHtml(time)}</td>
        <td class="schedule-cell-topic">${escapeHtml(activity)}</td>
        <td class="schedule-cell-speaker">${lead ? escapeHtml(lead) : '<span class="schedule-cell-empty">&mdash;</span>'}</td>
      </tr>`;
    })
    .join("");
}

function renderSchedule() {
  const list = document.getElementById("schedule-list");
  if (!list) return;
  list.innerHTML = SCHEDULE.map((s, i) => {
    const accent = DAY_ACCENT[s.accent] || DAY_ACCENT.forest;
    return `
    <section class="schedule-day ${accent}" aria-labelledby="sched-title-${i}">
      <div class="schedule-day-heading">
        <div class="min-w-0">
          <div class="schedule-day-topline">
            <span class="schedule-day-date">${escapeHtml(s.day)}</span>
            <span class="schedule-day-tag">${escapeHtml(s.tag)}</span>
          </div>
          <h3 id="sched-title-${i}" class="schedule-day-title">${escapeHtml(s.title)}</h3>
          <p class="schedule-day-meta">
            <span><i class="fa-regular fa-clock" aria-hidden="true"></i>${escapeHtml(s.time)}</span>
            <span><i class="fa-solid fa-user-tie" aria-hidden="true"></i>In charge: ${escapeHtml(s.lead)}</span>
          </p>
        </div>
      </div>
      <div class="schedule-table-wrap">
        <table class="schedule-table" aria-labelledby="sched-title-${i}">
          <thead>
            <tr>
              <th scope="col">Time</th>
              <th scope="col">Topic</th>
              <th scope="col">Speakers</th>
            </tr>
          </thead>
          <tbody>
            ${renderSessionRows(s.sessions)}
          </tbody>
        </table>
      </div>
    </section>`;
  }).join("");
}

function renderResources() {
  const list = document.getElementById("resources-list");
  if (!list) return;
  list.innerHTML = RESOURCES.map(
    (r) => `
    <li>
      <a href="${r.url}" target="_blank" rel="noopener noreferrer"
         class="flex h-full items-center gap-3 rounded-xl border border-sage-100 bg-white p-3 text-sm font-semibold text-forest transition hover:border-forest/25 hover:bg-paper">
        <span class="grid h-9 w-9 place-items-center rounded-lg bg-sage-100 text-forest">
          <i class="${r.icon}" aria-hidden="true"></i>
        </span>
        <span class="min-w-0 flex-1 truncate">${escapeHtml(r.name)}</span>
        <i class="fa-solid fa-arrow-up-right-from-square text-xs text-sage" aria-hidden="true"></i>
      </a>
    </li>`
  ).join("");
}

function renderFaq() {
  const wrap = document.getElementById("faq-accordion");
  if (!wrap) return;

  wrap.innerHTML = FAQS.map(
    (f, i) => `
    <div class="faq-item">
      <h4>
        <button type="button" id="faq-trigger-${i}" class="faq-trigger" aria-expanded="false" aria-controls="faq-panel-${i}">
          <span>${escapeHtml(f.q)}</span>
          <i class="fa-solid fa-chevron-down faq-chevron" aria-hidden="true"></i>
        </button>
      </h4>
      <div class="faq-panel" id="faq-panel-${i}" role="region" aria-labelledby="faq-trigger-${i}" data-open="false">
        <div class="faq-panel-inner">${escapeHtml(f.a)}</div>
      </div>
    </div>`
  ).join("");

  wrap.querySelectorAll(".faq-trigger").forEach((btn) => {
    btn.addEventListener("click", () => toggleFaq(btn));
  });
}

/* Pre-Flight Checklist: persists tick state in localStorage so participants
   can work through the pre-training setup tasks across reloads. Purely
   client-side. */
const PREFLIGHT_KEY = "bi:preflight";

function initChecklist() {
  const items = document.querySelectorAll(".preflight-box");
  if (!items.length) return;

  const counter = document.getElementById("preflight-count");
  let saved = [];
  try {
    saved = JSON.parse(localStorage.getItem(PREFLIGHT_KEY)) || [];
  } catch {
    saved = [];
  }

  const sync = () => {
    let done = 0;
    items.forEach((box) => {
      const li = box.closest(".preflight-item");
      const on = box.checked;
      if (on) done += 1;
      li?.classList.toggle("is-done", on);
    });
    if (counter) counter.textContent = `${done} of ${items.length} ready`;
    try {
      localStorage.setItem(
        PREFLIGHT_KEY,
        JSON.stringify([...items].filter((b) => b.checked).map((b) => b.value))
      );
    } catch {
      /* storage unavailable — checklist still works for this session */
    }
  };

  items.forEach((box) => {
    box.checked = saved.includes(box.value);
    box.addEventListener("change", sync);
  });

  sync();
}

/* --------------------------- INTERACTIONS ---------------------- */

/* Accordion toggle used by the FAQ panels. */
function togglePanel(btn) {
  const expanded = btn.getAttribute("aria-expanded") === "true";
  const panel = document.getElementById(btn.getAttribute("aria-controls"));
  if (!panel) return;
  btn.setAttribute("aria-expanded", String(!expanded));
  panel.setAttribute("data-open", String(!expanded));
}

function toggleFaq(btn) {
  togglePanel(btn);
}

/* Smooth scrolling + active nav highlighting */
function initNav() {
  const links = document.querySelectorAll(".nav-link, .mobile-nav-link");

  const closeMobile = () => {
    const nav = document.getElementById("mobile-nav");
    const toggle = document.getElementById("mobile-toggle");
    nav?.classList.add("hidden");
    toggle?.setAttribute("aria-expanded", "false");
  };

  links.forEach((link) => {
    link.addEventListener("click", () => {
      closeMobile();
      // Native CSS `scroll-smooth` handles the animation; scroll-margin
      // on sections keeps headings clear of the sticky header.
    });
  });

  // Highlight the nav items (desktop + mobile) for the section in view.
  const sections = document.querySelectorAll("[data-section]");
  const byId = {};
  links.forEach((l) => {
    const key = l.dataset.nav;
    if (!key) return;
    (byId[key] = byId[key] || []).push(l);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.dataset.section;
        Object.values(byId)
          .flat()
          .forEach((l) => l.removeAttribute("aria-current"));
        (byId[id] || []).forEach((l) => l.setAttribute("aria-current", "true"));
      });
    },
    { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
  );
  sections.forEach((s) => observer.observe(s));
}

function initMobileMenu() {
  const toggle = document.getElementById("mobile-toggle");
  const nav = document.getElementById("mobile-nav");
  if (!toggle || !nav) return;
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    nav.classList.toggle("hidden", open);
  });
}

/* --------------------------- HELPERS --------------------------- */

export function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/* --------------------------- INIT ------------------------------ */

export function initUI() {
  renderSchedule();
  renderResources();
  renderFaq();
  initNav();
  initMobileMenu();
  initChecklist();

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
}
