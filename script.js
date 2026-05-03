/*
    DONNÉES À MODIFIER POUR AJOUTER DU CONTENU
   FICHES PDF :
   - title    : nom de la fiche
   - subject  : matière (ex: "Chimie", "Histoire") — doit correspondre au filtre
   - desc     : courte description (optionnel)
   - date     : date de création
   - color    : couleur du post-it  → "yellow" | "pink" | "mint" | "sky" | "peach" | "lav"
   - file     : chemin vers le PDF dans ton repo GitHub (ex: "fiches/chimie-acides.pdf")

   PODCASTS :
   - title    : nom du podcast
   - subject  : matière
   - desc     : description
   - date     : date
   - duration : durée (ex: "14:32")
   - file     : chemin vers le fichier audio (ex: "podcasts/cours-photosynthese.mp3")
                → supporte MP3, M4A, OGG
*/

const FICHES = [
  {
    title: "Fiche de SES : La Socialisation ",
    subject: "SES",
    niveau: "seconde",
    desc: ".",
    date: "Mai 2026",
    color: "yellow",
    file: "/fiches/fiche de SES, La Socialisation.pdf"
  },
    {
    title: "Fiche de SES : politique ",
    subject: "SES",
    niveau: "seconde",
    desc: ".",
    date: "Mai 2026",
    color: "yellow",
    file: "/fiches/fiche de SES, La Socialisation.pdf"
  },
];

const PODCASTS = [
  {
    title: "lecture socialisation",
    subject: "SES",
    desc: ".",
    date: "mai 2026",
    duration: "15:22",
    file: "lecture/ses.mp3"
  },
];

/* ═══════════════════════════════════════════════
   CODE — pas besoin de modifier ce qui suit
═══════════════════════════════════════════════ */

const COLORS = {
  yellow: "card-pdf",
  pink:   "card-pdf color-pink",
  mint:   "card-pdf color-mint",
  sky:    "card-pdf color-sky",
  peach:  "card-pdf color-peach",
  lav:    "card-pdf color-lav"
};

let activeFilter = "all";
let audioElements = {};

function getAllSubjects() {
  const s = new Set();
  [...FICHES, ...PODCASTS].forEach(item => s.add(item.subject));
  return [...s].sort();
}

function buildFilters() {
  const container = document.getElementById("filters");
  getAllSubjects().forEach(subj => {
    const btn = document.createElement("button");
    btn.className = "filter-btn";
    btn.dataset.filter = subj;
    btn.textContent = subj;
    container.appendChild(btn);
  });
  container.addEventListener("click", e => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.toggle("active", b === btn));
    render();
  });
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function buildPdfCard(fiche) {
  const colorClass = COLORS[fiche.color] || "card-pdf";
  const card = document.createElement("div");
  card.className = `card ${colorClass}`;
  card.dataset.subject = fiche.subject;

  card.innerHTML = `
    <div class="card-accent"></div>
    <div class="card-body">
      <span class="card-tag">📄 ${fiche.subject}</span>
      <div class="card-title">${fiche.title}</div>
      ${fiche.desc ? `<div class="card-desc">${fiche.desc}</div>` : ""}
      <div class="btn-row">
        <button class="btn btn-primary btn-view">👁 Visualiser</button>
        <a class="btn btn-outline" href="${fiche.file}" download>⬇ PDF</a>
      </div>
      <div class="card-meta">🗓 ${fiche.date}</div>
    </div>
  `;

  card.querySelector(".btn-view").addEventListener("click", () => openModal(fiche));
  return card;
}

function buildPodcastCard(podcast) {
  const card = document.createElement("div");
  card.className = "card card-podcast";
  card.dataset.subject = podcast.subject;

  const id = "audio_" + Math.random().toString(36).slice(2);

  card.innerHTML = `
    <div class="card-accent"></div>
    <div class="card-body">
      <span class="card-tag">🎙 ${podcast.subject}</span>
      <div class="card-title">${podcast.title}</div>
      ${podcast.desc ? `<div class="card-desc">${podcast.desc}</div>` : ""}
      <div class="audio-player">
        <div class="audio-controls">
          <button class="play-btn" id="play_${id}" aria-label="Lecture/Pause">
            <svg class="play-icon" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
            <svg class="pause-icon" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
          </button>
          <div class="audio-info">
            <div class="audio-progress" id="bar_${id}">
              <div class="audio-fill" id="fill_${id}"></div>
            </div>
            <div class="audio-time" id="time_${id}">0:00 / ${podcast.duration || "--:--"}</div>
          </div>
        </div>
        <audio id="${id}" preload="none" controlsList="nodownload">
          <source src="${podcast.file}" />
        </audio>
      </div>
      <div class="card-meta">🗓 ${podcast.date}${podcast.duration ? ` · ⏱ ${podcast.duration}` : ""}</div>
    </div>
  `;

  const audio = card.querySelector(`#${id}`);
  const playBtn = card.querySelector(`#play_${id}`);
  const fill = card.querySelector(`#fill_${id}`);
  const timeEl = card.querySelector(`#time_${id}`);
  const bar = card.querySelector(`#bar_${id}`);
  const playIcon = playBtn.querySelector(".play-icon");
  const pauseIcon = playBtn.querySelector(".pause-icon");

  audioElements[id] = audio;

  playBtn.addEventListener("click", () => {
    if (audio.paused) {
      // Pause tous les autres
      Object.values(audioElements).forEach(a => { if (a !== audio) a.pause(); });
      document.querySelectorAll(".play-icon").forEach(i => i.style.display = "block");
      document.querySelectorAll(".pause-icon").forEach(i => i.style.display = "none");
      audio.play();
      playIcon.style.display = "none";
      pauseIcon.style.display = "block";
    } else {
      audio.pause();
      playIcon.style.display = "block";
      pauseIcon.style.display = "none";
    }
  });

  audio.addEventListener("timeupdate", () => {
    if (!audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    fill.style.width = pct + "%";
    timeEl.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
  });

  audio.addEventListener("ended", () => {
    playIcon.style.display = "block";
    pauseIcon.style.display = "none";
    fill.style.width = "0%";
  });

  bar.addEventListener("click", e => {
    if (!audio.duration) return;
    const rect = bar.getBoundingClientRect();
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * audio.duration;
  });

  // Empêcher le téléchargement via clic droit
  audio.addEventListener("contextmenu", e => e.preventDefault());

  return card;
}

function render() {
  const gridF = document.getElementById("grid-fiches");
  const gridP = document.getElementById("grid-podcasts");
  gridF.innerHTML = "";
  gridP.innerHTML = "";

  const fiches = FICHES.filter(f => activeFilter === "all" || f.subject === activeFilter);
  const podcasts = PODCASTS.filter(p => activeFilter === "all" || p.subject === activeFilter);

  if (fiches.length === 0) {
    gridF.innerHTML = `<div class="empty">Aucune fiche pour cette matière.</div>`;
  } else {
    fiches.forEach(f => gridF.appendChild(buildPdfCard(f)));
  }

  if (podcasts.length === 0) {
    gridP.innerHTML = `<div class="empty">Aucun podcast pour cette matière.</div>`;
  } else {
    podcasts.forEach(p => gridP.appendChild(buildPodcastCard(p)));
  }
}

// Modal PDF
function openModal(fiche) {
  document.getElementById("modal-title").textContent = fiche.title;
  document.getElementById("modal-iframe").src = fiche.file;
  document.getElementById("modal-download").href = fiche.file;
  document.getElementById("modal-download").download = fiche.file.split("/").pop();
  document.getElementById("modal").classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeModal() {
  document.getElementById("modal").classList.remove("open");
  document.getElementById("modal-iframe").src = "";
  document.body.style.overflow = "";
}

document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal").addEventListener("click", e => {
  if (e.target === document.getElementById("modal")) closeModal();
});
document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

// Init
buildFilters();
render();