function siteIcon(type) {
  if (type === "instagram") {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"></rect><circle cx="12" cy="12" r="4"></circle><path d="M17.5 6.5h.01"></path></svg>';
  }
  if (type === "mail") {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><path d="m3 7 9 6 9-6"></path></svg>';
  }
  return '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M2 12h20"></path><path d="M12 2a15.3 15.3 0 0 1 0 20"></path><path d="M12 2a15.3 15.3 0 0 0 0 20"></path></svg>';
}

function siteHeader(activePage) {
  const links = [
    ["index.html", "Home", "home"],
    ["agenda.html", "Agenda", "agenda"],
    ["media.html", "Media", "media"],
    ["team.html", "The Team", "team"],
    ["useful-info.html", "Useful Information", "useful-info"],
    ["take-home.html", "What we take home", "take-home"]
  ];
  return `
    <header class="topbar">
      <a class="brand" href="index.html" aria-label="EU HUB Summer Programme home">
        <span class="mark" aria-hidden="true"><img src="assets/euhub-logo.jpg" alt=""></span>
        <span class="brand-text"><strong>EU HUB</strong><span>Summer Programme</span></span>
      </a>
      <nav class="nav" aria-label="Main menu">
        ${links.map(([href, label, key]) => `<a class="${activePage === key ? "active" : ""}" href="${href}">${label}</a>`).join("")}
      </nav>
    </header>
  `;
}

function siteFooter() {
  return `
    <footer class="site-footer shared-footer" aria-label="Footer links">
      <h2>Helpful Links</h2>
      <p class="note">Follow the programme, learn more about CEDE Aruba and BARiO UNICO, or contact the EUHUB team directly.</p>
      <div class="external-links">
        <a href="https://www.instagram.com/euhubaruba/" target="_blank" rel="noreferrer">${siteIcon("instagram")}@euhubaruba</a>
        <a href="https://www.instagram.com/cedearuba/" target="_blank" rel="noreferrer">${siteIcon("instagram")}@cedearuba</a>
        <a href="https://www.instagram.com/bariounico/" target="_blank" rel="noreferrer">${siteIcon("instagram")}@bariounico</a>
        <a href="https://www.cedearuba.org" target="_blank" rel="noreferrer">${siteIcon("web")}cedearuba.org</a>
        <a href="https://www.bariounico.org" target="_blank" rel="noreferrer">${siteIcon("web")}bariounico.org</a>
        <a href="mailto:euyouth@cedearuba.org">${siteIcon("mail")}euyouth@cedearuba.org</a>
      </div>
      <div class="site-credit">
        <p>&copy; All rights reserved</p>
        <p>Created by: <span class="creator-name">Stefan Nikolovski</span><span class="creator-role">ESC Short Term Volunteer at EUHUB</span></p>
        <p><a class="collab-button" href="https://hihello.com/p/f9c31a1c-9994-4742-8c19-7009e31fc018" target="_blank" rel="noreferrer">Connect to collaborate</a></p>
      </div>
    </footer>
  `;
}

document.querySelectorAll("[data-site-header]").forEach((target) => {
  target.innerHTML = siteHeader(target.dataset.activePage || "");
});

document.querySelectorAll("[data-site-footer]").forEach((target) => {
  target.innerHTML = siteFooter();
});
