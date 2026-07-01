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

const agendaRosterCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTjUUx_mmfTqDn0tKSHa8t8Jcc9SdZU-4OqSuvlX23poHnViMv7t_S5m2fMGD64iAs77mli0QawSrNU/pub?gid=1205072565&single=true&output=csv";
const agendaContactsCsvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTjUUx_mmfTqDn0tKSHa8t8Jcc9SdZU-4OqSuvlX23poHnViMv7t_S5m2fMGD64iAs77mli0QawSrNU/pub?gid=211358017&single=true&output=csv";
let agendaContactRecords = [];

if (document.querySelector("#volunteerList") && document.querySelector("#staffList")) {
  syncAgendaSheetTabs();
  setInterval(syncAgendaSheetTabs, 60000);
  const agendaCards = document.querySelector("#weeks");
  if (agendaCards) {
    new MutationObserver(() => applyAgendaContactDirectory()).observe(agendaCards, {
      childList: true,
      subtree: true
    });
  }
}

async function syncAgendaSheetTabs() {
  try {
    const cacheBust = Date.now();
    const [rosterRows, contactRows] = await Promise.all([
      fetchSharedCsvRows(agendaRosterCsvUrl, cacheBust),
      fetchSharedCsvRows(agendaContactsCsvUrl, cacheBust)
    ]);
    const roster = sharedRosterFromRows(rosterRows);
    agendaContactRecords = sharedContactsFromRows(contactRows);
    applySharedRoster(roster);
    applySharedPersonFilter(roster, agendaContactRecords);
    applyAgendaContactDirectory();
  } catch (error) {
    console.warn("Roster/contact sheet tabs could not be synced.", error);
  }
}

async function fetchSharedCsvRows(url, cacheBust) {
  const response = await fetch(`${url}&cacheBust=${cacheBust}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Google Sheet request failed: ${response.status}`);
  return parseSharedCsv(await response.text());
}

function parseSharedCsv(csvText) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const next = csvText[index + 1];
    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some((cell) => cell.trim())) rows.push(row);
  return rows;
}

function sharedRosterFromRows(rows) {
  const [headers, ...body] = rows;
  const roster = { volunteers: [], staff: [] };
  if (!headers || !body.length) return roster;
  const keyMap = sharedKeyMap(headers);
  body.forEach((row) => {
    const name = sharedFirstCell(row, keyMap, ["name", "person", "people", "volunteer", "staff"]) || row[0] || "";
    const type = sharedFirstCell(row, keyMap, ["type", "role", "group", "category", "status"]) || row[1] || "";
    const cleanName = String(name || "").trim();
    if (!cleanName) return;
    if (String(type).toLowerCase().includes("staff")) {
      roster.staff.push(cleanName);
    } else {
      roster.volunteers.push(cleanName);
    }
  });
  roster.volunteers = sharedUnique(roster.volunteers);
  roster.staff = sharedUnique(roster.staff);
  return roster;
}

function sharedContactsFromRows(rows) {
  const [headers, ...body] = rows;
  if (!headers || !body.length) return [];
  const keyMap = sharedKeyMap(headers);
  return body.map((row) => ({
    name: sharedFirstCell(row, keyMap, ["contactperson", "contact", "name", "person"]) || row[0] || "",
    email: sharedFirstCell(row, keyMap, ["contactemail", "email", "mail"]) || "",
    phone: sharedFirstCell(row, keyMap, ["contactphone", "phone", "mobile", "telephone"]) || "",
    venue: sharedFirstCell(row, keyMap, ["where", "venue", "location", "centrodibario", "cdb", "center", "centre"]) || ""
  })).map((contact) => ({
    name: String(contact.name || "").trim(),
    email: String(contact.email || "").trim(),
    phone: String(contact.phone || "").trim(),
    venue: String(contact.venue || "").trim()
  })).filter((contact) => contact.name || contact.email || contact.phone);
}

function applySharedRoster(roster) {
  const volunteerList = document.querySelector("#volunteerList");
  const staffList = document.querySelector("#staffList");
  if (volunteerList && roster.volunteers.length) {
    volunteerList.innerHTML = roster.volunteers.map(sharedRosterPill).join("");
  }
  if (staffList && roster.staff.length) {
    staffList.innerHTML = roster.staff.map(sharedRosterPill).join("");
  }
}

function applySharedPersonFilter(roster, contacts) {
  const personFilter = document.querySelector("#personFilter");
  if (!personFilter) return;
  const currentValue = personFilter.value || "all";
  const existingPeople = [...personFilter.options].map((option) => option.value);
  const volunteers = sharedUnique([...roster.volunteers, ...existingPeople.filter((value) => value && !["all", "Volunteers", "Staff", "Everyone"].includes(value))]);
  const staff = roster.staff;
  const contactPeople = sharedUnique(contacts.map((contact) => contact.name));
  personFilter.innerHTML = `
    <option value="all">All people</option>
    <optgroup label="Groups">
      <option value="Volunteers">Volunteers</option>
      <option value="Staff">Staff</option>
      <option value="Everyone">Everyone</option>
    </optgroup>
    <optgroup label="Volunteers">
      ${volunteers.map(sharedOption).join("")}
    </optgroup>
    <optgroup label="Staff">
      ${staff.map(sharedOption).join("")}
    </optgroup>
    <optgroup label="Contact persons">
      ${contactPeople.map(sharedOption).join("")}
    </optgroup>
  `;
  personFilter.value = [...personFilter.options].some((option) => option.value === currentValue) ? currentValue : "all";
}

function applyAgendaContactDirectory() {
  if (!agendaContactRecords.length) return;
  document.querySelectorAll(".card-foot").forEach((footer) => {
    const card = footer.closest(".card");
    const contactName = footer.querySelector(".contact-name")?.textContent?.trim() || "";
    const venue = card?.querySelector(".venue")?.textContent?.trim() || "";
    const match = findSharedContact(contactName, venue);
    if (!match) return;
    const nameElement = footer.querySelector(".contact-name");
    if (nameElement && match.name) nameElement.textContent = match.name;
    const actions = footer.querySelector(".contact-actions") || document.createElement("div");
    actions.className = "contact-actions";
    actions.innerHTML = `
      ${match.email ? `<a class="link-button" href="mailto:${match.email}">${siteIcon("mail")}Email</a>` : ""}
      ${match.phone ? `<a class="link-button" href="tel:${match.phone.replace(/[^\d+]/g, "")}">${siteIcon("web")}${match.phone}</a>` : ""}
    `;
    if ((match.email || match.phone) && !footer.querySelector(".contact-actions")) {
      footer.appendChild(actions);
    }
  });
}

function findSharedContact(name, venue) {
  const normalizedName = sharedLookup(name);
  const normalizedVenue = sharedLookup(venue);
  return agendaContactRecords.find((contact) => contact.name && sharedLookup(contact.name) === normalizedName)
    || agendaContactRecords.find((contact) => contact.venue && sharedLookup(contact.venue) === normalizedVenue);
}

function sharedKeyMap(headers) {
  return headers.reduce((map, header, index) => {
    map[String(header || "").toLowerCase().replace(/[^a-z0-9]/g, "")] = index;
    return map;
  }, {});
}

function sharedFirstCell(row, keyMap, keys) {
  for (const key of keys) {
    const index = keyMap[key];
    const value = index === undefined ? "" : String(row[index] || "").trim();
    if (value) return value;
  }
  return "";
}

function sharedRosterPill(value) {
  return `<span class="roster-pill">${value}</span>`;
}

function sharedOption(value) {
  return `<option value="${value}">${value}</option>`;
}

function sharedUnique(values) {
  return [...new Set(values.map((value) => String(value || "").trim()).filter(Boolean))];
}

function sharedLookup(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}
