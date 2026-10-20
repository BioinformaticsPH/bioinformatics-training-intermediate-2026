/* =================================================================
   js/ui.js
   -----------------------------------------------------------------
   Presentation layer: navigation state, mobile menu, FAQ accordion,
   toast notifications and rendering of the Schedule / Materials /
   Resources lists.

   ALL CONTENT BELOW IS SAMPLE DATA — edit the arrays to your course.
   ================================================================= */

import { DRIVE_LINKS } from "./firebase-config.js";

/* ----------------------------- DATA ---------------------------- */

/* Official curriculum for the Intermediate Plant Genome Bioinformatics
   Workshop. All sessions are conducted entirely IN PERSON (face-to-face). */
const SCHEDULE = [
  {
    day: "Day 0 · Mon 26 Oct 2026",
    title: "Pre-workshop Technical Setup",
    time: "AM",
    tag: "Setup",
    accent: "forest",
    lead: "All (Nikki for afternoon only)",
    details: [
      "Technical foundation & software installations: FastQC, fastp, bowtie2, SAMtools, VCFtools, IGV",
      "WSL2 dry-run check",
      "USB installers & group assignments"
    ],
    reqs: [
      "Software list with versions: FastQC, fastp, bowtie2, SAMtools, VCFtools, IGV",
      "Installation documentation for every tool",
      "WSL2 installation dry-run completed by Oct 15",
      "USB with installer",
      "Dataset on USB",
      "Working group assignments"
    ]
  },
  {
    day: "Day 1 · Mon 26 Oct 2026",
    title: "Command Line Bioinformatics",
    time: "AM – PM",
    tag: "Hands-on",
    accent: "leaf",
    lead: "Dags",
    details: [
      "Morning — Command line: environment & shell basics (terminal, file permissions, conda/mamba)",
      "Morning — File manipulation for FASTQ, FASTA, SAM/BAM and VCF (awk, grep, samtools, bedtools)",
      "Morning — Version control / Git: init, add, commit, diff, .gitignore, folder structure",
      "Afternoon — AI: genomic log & data interpretation (LLMs for error parsing and VCF summaries)",
      "Afternoon — Data governance & privacy (API vs local models such as Ollama)",
      "Afternoon — AI pitfalls & Git recovery live demo"
    ],
    reqs: [
      "Hardware & environment validation: WSL2 dry-run check on participant machines before Day 1 (catch PATH or system issues early)",
      "Demo data prep: tiny trimmed test file (~100-line FASTQ or ~20-record VCF) for the Git recovery demo",
      "GitHub account for the version control exercises",
      "Pre-written commands cheat sheet of working one-liners",
      "AI platform account (choose at least one: Google Gemini, Anthropic Claude or Cursor)",
      "Optional offline alternative: Ollama with llama3 or qwen2.5-coder pre-pulled",
      "Offline USB drives with software packages, conda/mamba environments, cheat sheets and datasets"
    ]
  },
  {
    day: "Day 2 · Tue 27 Oct 2026",
    title: "Variant Discovery & Genomics Pipelines",
    time: "AM – PM",
    tag: "Lecture + Lab",
    accent: "forest",
    lead: "Nikki",
    details: [
      "Morning — Concept lecture: Illumina short-read sequencing overview, paired-end reads and QC rationale",
      "Morning — End-to-end workflow: FastQC (QC) → fastp (cleaning) → bowtie2 & SAMtools (alignment) → bcftools (variant calling)",
      "Afternoon — Hands-on: Integrative Genomics Viewer (IGV)",
      "Afternoon — Hands-on: SNP / marker discovery"
    ],
    reqs: [
      "Dataset",
      "Pipeline / workflow",
      "Software",
      "Cheat sheet"
    ]
  },
  {
    day: "Day 3 · THU 29 OCT 2026",
    title: "Gene & Function Analysis",
    time: "AM – PM",
    tag: "Lecture + Lab",
    accent: "leaf",
    lead: "Victor",
    details: [
      "Bridging genomic discoveries with functional biological insights",
      "Candidate gene mapping & specialized bioinformatics tools",
      "Assays design & database exploration",
      "SnpEff variant annotation"
    ],
    reqs: [
      "Dataset",
      "Cheat sheet"
    ]
  },
  {
    day: "Day 4 · FRI 30 OCT 2026",
    title: "Integration",
    time: "AM – PM",
    tag: "Integration",
    accent: "forest",
    lead: "All (Nikki for afternoon only)",
    details: [
      "Synthesis of knowledge across all previous days",
      "Apply skills to participants' own plant genomic datasets",
      "Independent pipeline execution",
      "Train-the-Trainers session"
    ],
    reqs: [
      "5 possible problems to work through with participants"
    ]
  }
];

const MATERIALS = [
  {
    name: "Lecture Slides (all sessions)",
    formats: ["PDF"],
    size: "24 MB",
    updated: "Updated Oct 2026",
    icon: "fa-file-lines",
    url: DRIVE_LINKS.slides
  },
  {
    name: "Practice Datasets",
    formats: ["FASTQ", "VCF", "CSV"],
    size: "1.2 GB",
    updated: "Updated Oct 2026",
    icon: "fa-database",
    url: DRIVE_LINKS.datasets
  }
];

const RESOURCES = [
  { name: "Galaxy Platform", icon: "fa-solid fa-atom", url: "https://usegalaxy.org" },
  { name: "nf-core Pipelines", icon: "fa-solid fa-diagram-project", url: "https://nf-co.re" },
  { name: "Bioconductor", icon: "fa-solid fa-flask", url: "https://bioconductor.org" },
  { name: "IGV Documentation", icon: "fa-solid fa-dna", url: "https://igv.org/doc/" }
];

const FAQS = [
  {
    q: "Is the workshop in person?",
    a: "Yes — all tracks are conducted entirely in person (face-to-face). There are no online or virtual sessions."
  },
  {
    q: "What do I need to set up before Day 0?",
    a: "Bring a laptop and, if you can, the tools pre-installed — FastQC, fastp, bowtie2, SAMtools, VCFtools and IGV (versions are listed with the materials). A working WSL2 installation is required: complete the WSL2 dry-run check by Oct 15. Day 0 resolves any remaining environment or PATH issues on site, and USB installers are provided."
  },
  {
    q: "Do I need to install software locally?",
    a: "Practicals run in your local WSL2 environment and on on-site workstations. Bring a laptop — setup is verified together on Day 0 and USB installers are available."
  },
  {
    q: "Where are the session materials posted?",
    a: "Slides and datasets are shared in the Session Materials card on Google Drive and updated as the workshop progresses."
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

const ACCENT_CLASS = {
  forest: "bg-forest/10 text-forest",
  leaf: "bg-leaf/20 text-forest",
  sage: "bg-sage-100 text-charcoal-soft"
};

/* Bioinformatics tool names highlighted as monospace badges inside the
   schedule descriptions. Matched case-insensitively after escaping so the
   surrounding text stays safe. */
const TOOL_RE = /\b(WSL2|FastQC|fastp|bowtie2|SAMtools|VCFtools|IGV|bcftools|SnpEff|bedtools)\b/gi;

function toolBadges(escaped) {
  return escaped.replace(
    TOOL_RE,
    '<code class="rounded bg-sage-100 px-1 py-0.5 font-mono text-[0.72rem] font-semibold text-forest">$1</code>'
  );
}

function renderSchedule() {
  const list = document.getElementById("schedule-list");
  if (!list) return;
  list.innerHTML = SCHEDULE.map(
    (s, i) => `
    <li class="schedule-day">
      <button type="button" id="sched-trigger-${i}" class="sched-trigger" aria-expanded="false" aria-controls="sched-panel-${i}">
        <span class="min-w-0 flex-1 text-left">
          <span class="block text-[11px] font-semibold uppercase tracking-wide text-charcoal-soft/70">${escapeHtml(s.day)}</span>
          <span class="mt-0.5 block font-semibold text-forest">${escapeHtml(s.title)}</span>
          <span class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-charcoal-soft">
            <span><i class="fa-regular fa-clock mr-1" aria-hidden="true"></i>${escapeHtml(s.time)}</span>
            <span><i class="fa-solid fa-user-tie mr-1" aria-hidden="true"></i>In charge: ${escapeHtml(s.lead)}</span>
          </span>
        </span>
        <span class="flex shrink-0 items-center gap-2">
          <span class="rounded-full px-2.5 py-1 text-[11px] font-bold uppercase ${ACCENT_CLASS[s.accent] || ACCENT_CLASS.forest}">${escapeHtml(s.tag)}</span>
          <i class="fa-solid fa-chevron-down sched-chevron" aria-hidden="true"></i>
        </span>
      </button>
      <div class="sched-panel" id="sched-panel-${i}" role="region" aria-labelledby="sched-trigger-${i}" data-open="false">
        <div class="sched-panel-inner">
          <ul class="list-disc space-y-2 pl-5 text-sm text-charcoal-soft">
            ${s.details.map((d) => `<li>${toolBadges(escapeHtml(d))}</li>`).join("")}
          </ul>
          ${
            s.reqs?.length
              ? `<div class="mt-4 rounded-lg border-t border-gray-100/20 pt-3">
                   <p class="text-[11px] font-bold uppercase tracking-wide text-charcoal-soft">Requirements</p>
                   <ul class="mt-2 list-disc space-y-2 pl-5 text-xs text-charcoal-soft">
                     ${s.reqs.map((r) => `<li>${toolBadges(escapeHtml(r))}</li>`).join("")}
                   </ul>
                 </div>`
              : ""
          }
        </div>
      </div>
    </li>`
  ).join("");

  list.querySelectorAll(".sched-trigger").forEach((btn) => {
    btn.addEventListener("click", () => togglePanel(btn, ".sched-panel"));
  });
}

function renderMaterials() {
  const list = document.getElementById("materials-list");
  if (!list) return;
  list.innerHTML = MATERIALS.map(
    (m) => `
    <li>
      <a href="${m.url}" target="_blank" rel="noopener noreferrer" class="material-row group">
        <span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-leaf/15 text-forest">
          <i class="fa-brands fa-google-drive text-lg" aria-hidden="true"></i>
        </span>
        <span class="min-w-0 flex-1">
          <span class="block truncate text-sm font-semibold text-forest">${escapeHtml(m.name)}</span>
          <span class="mt-1 flex flex-wrap items-center gap-1.5">
            ${m.formats.map((f) => `<span class="rounded bg-sage-100 px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold text-forest">${escapeHtml(f)}</span>`).join("")}
          </span>
          <span class="mt-1 block text-[0.7rem] text-charcoal-soft/80"><i class="fa-regular fa-clock mr-1" aria-hidden="true"></i>${escapeHtml(m.updated)}</span>
        </span>
        <span class="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-sage-100 px-2.5 py-1.5 text-[0.7rem] font-semibold text-forest transition group-hover:bg-forest group-hover:text-white">
          <i class="fa-brands fa-google-drive" aria-hidden="true"></i>
          <span class="hidden sm:inline">Open in Google Drive</span>
        </span>
      </a>
    </li>`
  ).join("");
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
   can work through Day 0 setup tasks across reloads. Purely client-side. */
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

/* Generic accordion toggle shared by the schedule and FAQ panels. */
function togglePanel(btn) {
  const expanded = btn.getAttribute("aria-expanded") === "true";
  const panel = document.getElementById(btn.getAttribute("aria-controls"));
  btn.setAttribute("aria-expanded", String(!expanded));
  if (panel) panel.setAttribute("data-open", String(!expanded));
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
  renderMaterials();
  renderResources();
  renderFaq();
  initNav();
  initMobileMenu();
  initChecklist();

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
}
