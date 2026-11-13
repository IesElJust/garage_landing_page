"use strict";
// RSS2JSON is the only third-party runtime service; no keys or backend required.
const SITE_BASE = new URL("../", document.currentScript.src);
const NEWS_CONFIG = Object.freeze({
  feed: "https://portal.edu.gva.es/iesjaumeeljust/category/justhub-garage/feed/",
  provider: "https://api.rss2json.com/v1/api.json",
  fallback: new URL("data/news.json", SITE_BASE).href,
  cacheKey: "justhub-news-v1",
  refreshMs: 60 * 60 * 1000,
});
document.body.classList.add("js");
const toggle = document.querySelector(".menu-toggle");
const navigation = document.querySelector("#navigation");
toggle.hidden = false;
function closeMenu() {
  toggle.setAttribute("aria-expanded", "false");
  navigation.classList.remove("is-open");
}
toggle.addEventListener("click", () => {
  const open = toggle.getAttribute("aria-expanded") !== "true";
  toggle.setAttribute("aria-expanded", String(open));
  navigation.classList.toggle("is-open", open);
});
navigation.addEventListener("click", (event) => { if (event.target.closest("a")) closeMenu(); });
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") { closeMenu(); toggle.focus(); }
});
if (document.querySelector("#news-grid")) {
  function safeUrl(value, articleOnly = false) {
    try {
      const url = new URL(value);
      if (url.protocol !== "https:") return null;
      if (articleOnly && (url.hostname !== "portal.edu.gva.es" || !url.pathname.startsWith("/iesjaumeeljust/"))) return null;
      return url.href;
    } catch { return null; }
  }
  function plainText(value) {
    const doc = new DOMParser().parseFromString(String(value || ""), "text/html");
    doc.querySelectorAll("script, style").forEach((node) => node.remove());
    return (doc.body.textContent || "").replace(/\s+/g, " ").trim();
  }
  function normalize(items) {
    if (!Array.isArray(items)) return [];
    return items.filter((item) => item && safeUrl(item.link, true)).slice(0, 3).map((item) => {
      const markup = new DOMParser().parseFromString(String(item.content || item.description || ""), "text/html");
      const image = Array.from(markup.querySelectorAll("img")).map((img) => img.getAttribute("src")).find((src) => src && src.includes("/iesjaumeeljust/wp-content/uploads/"));
      return {
        title: plainText(item.title), link: safeUrl(item.link, true),
        date: item.date || (item.pubDate ? item.pubDate.replace(" ", "T") + (/[zZ]|[+-]\d\d:\d\d$/.test(item.pubDate) ? "" : "Z") : ""),
        excerpt: (() => { const text = plainText(item.excerpt || item.description || item.content); return text.length > 190 ? text.slice(0, 190).replace(/\s+\S*$/, "") + "…" : text; })(),
        image: safeUrl(item.image || image || item.thumbnail) || new URL("assets/coworking-space.webp", SITE_BASE).href,
      };
    });
  }
  function render(items, message) {
    const grid = document.querySelector("#news-grid");
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const card = document.createElement("article"); card.className = "news-card";
      const pictureLink = document.createElement("a"); pictureLink.href = item.link; pictureLink.tabIndex = -1; pictureLink.setAttribute("aria-hidden", "true");
      const image = document.createElement("img"); image.src = item.image; image.alt = ""; image.loading = "lazy"; image.className = "news-image"; image.width = 640; image.height = 360;
      image.addEventListener("error", () => { image.src = new URL("assets/coworking-space.webp", SITE_BASE).href; }, { once: true }); pictureLink.append(image); card.append(pictureLink);
      const date = new Date(item.date);
      if (!Number.isNaN(date.valueOf())) { const time = document.createElement("time"); time.dateTime = date.toISOString(); time.textContent = new Intl.DateTimeFormat("ca-ES", { day: "numeric", month: "long", year: "numeric" }).format(date); card.append(time); }
      const heading = document.createElement("h3"); const link = document.createElement("a"); link.href = item.link; link.textContent = item.title; heading.append(link); card.append(heading);
      const summary = document.createElement("p"); summary.textContent = item.excerpt; card.append(summary);
      const more = document.createElement("a"); more.href = item.link; more.className = "text-link"; more.textContent = "Llig la notícia ↗"; more.setAttribute("aria-label", "Llig la notícia: " + item.title); card.append(more); fragment.append(card);
    });
    grid.replaceChildren(fragment); document.querySelector("#news-status").textContent = message;
  }
  function cachedNews() {
    try { const value = JSON.parse(localStorage.getItem(NEWS_CONFIG.cacheKey)); return Array.isArray(value?.items) ? normalize(value.items) : []; } catch { return []; }
  }
  async function requestJson(url) {
    const response = await fetch(url, { signal: AbortSignal.timeout(12000), credentials: "omit", referrerPolicy: "no-referrer" });
    if (!response.ok) throw new Error("News request failed");
    return response.json();
  }
  let loading = false;
  async function loadNews() {
    if (loading) return;
    loading = true;
    try {
      try {
        const stored = JSON.parse(localStorage.getItem(NEWS_CONFIG.cacheKey));
        if (stored?.saved && Date.now() - stored.saved < NEWS_CONFIG.refreshMs) {
          const items = normalize(stored.items);
          if (items.length) { render(items, "Últimes publicacions de la web de l'institut."); return; }
        }
      } catch { /* Continue without local storage. */ }
      const data = await requestJson(NEWS_CONFIG.provider + "?rss_url=" + encodeURIComponent(NEWS_CONFIG.feed));
      const items = data.status === "ok" ? normalize(data.items) : [];
      if (!items.length) throw new Error("Empty news feed");
      render(items, "Últimes publicacions de la web de l'institut.");
      try { localStorage.setItem(NEWS_CONFIG.cacheKey, JSON.stringify({ items, saved: Date.now() })); } catch { /* Private browsing or storage quota: news remains available. */ }
    } catch {
      let items = cachedNews();
      if (!items.length) { try { const data = await requestJson(NEWS_CONFIG.fallback); items = normalize(data.items); } catch { /* Keep the source link visible below. */ } }
      render(items, items.length ? "Mostrem les últimes notícies guardades. Pots consultar totes les publicacions a la web de l'institut." : "Ara no podem carregar les notícies. Consulta-les a la web de l'institut.");
    } finally { loading = false; }
  }
  const initial = cachedNews();
  if (initial.length) render(initial, "Actualitzant les notícies…");
  loadNews();
  setInterval(() => { if (!document.hidden) loadNews(); }, NEWS_CONFIG.refreshMs);
  window.addEventListener("online", loadNews);

}
