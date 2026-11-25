/**
 * Campus Saathi - Admin Dashboard & Management Portal
 * Role-based authentication, building CRUD, report adjudication, and anti-ragging case management.
 */

class CampusAdminManager {
  constructor() {
    this.currentAdminTab = "buildings";
    this.editingBuildingId = null;
    this.editingSecurityPointId = null;
    this.editingContactId = null;
  }

  async init() {
    this.checkAdminAuth();
    this.bindEvents();
  }

  checkAdminAuth() {
    const user = window.storageService.getCurrentUser();
    const loginSection = document.getElementById("admin-login-card");
    const portalSection = document.getElementById("admin-portal-content");

    if (user && user.role === "admin") {
      if (loginSection) loginSection.classList.add("hidden");
      if (portalSection) portalSection.classList.remove("hidden");
      this.loadDashboardData();
    } else {
      if (loginSection) loginSection.classList.remove("hidden");
      if (portalSection) portalSection.classList.add("hidden");
    }
  }

  bindEvents() {
    // Admin login form
    const loginForm = document.getElementById("admin-login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("admin-email-input").value.trim();
        const pass = document.getElementById("admin-pass-input").value;

        const res = await window.storageService.login(email, pass);
        if (res.success && res.user.role === "admin") {
          window.campusApp.showToast("Authenticated as Campus Administrator!", "success");
          this.checkAdminAuth();
          window.campusApp.updateUserNavUI();
        } else {
          window.campusApp.showToast(res.error || "Admin access required. Use admin@campussaathi.edu / admin123", "error");
        }
      });
    }

    // Quick demo login button
    const quickDemoBtn = document.getElementById("btn-quick-admin-login");
    if (quickDemoBtn) {
      quickDemoBtn.addEventListener("click", async () => {
        const res = await window.storageService.login("admin@campussaathi.edu", "admin123");
        if (res.success) {
          window.campusApp.showToast("Quick Demo Admin access granted!", "success");
          this.checkAdminAuth();
          window.campusApp.updateUserNavUI();
        }
      });
    }

    // Admin logout button
    const logoutBtn = document.getElementById("btn-admin-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await window.storageService.logout();
        window.campusApp.showToast("Admin session ended.", "info");
        this.checkAdminAuth();
        window.campusApp.updateUserNavUI();
      });
    }

    // Sub-tab switching in admin
    const navItems = document.querySelectorAll(".admin-nav-item");
    navItems.forEach(item => {
      item.addEventListener("click", () => {
        navItems.forEach(i => i.classList.remove("active"));
        item.classList.add("active");
        this.switchAdminTab(item.dataset.adminTab);
      });
    });

    // Building form modal submit
    const bldgForm = document.getElementById("building-modal-form");
    if (bldgForm) {
      bldgForm.addEventListener("submit", (e) => this.handleSaveBuilding(e));
    }

    // Security point modal submit
    const secForm = document.getElementById("security-modal-form");
    if (secForm) {
      secForm.addEventListener("submit", (e) => this.handleSaveSecurityPoint(e));
    }

    // Pathway modal submit
    const pathForm = document.getElementById("pathway-modal-form");
    if (pathForm) {
      pathForm.addEventListener("submit", (e) => this.handleSavePathway(e));
    }

    // Emergency contact modal submit
    const contactForm = document.getElementById("contact-modal-form");
    if (contactForm) {
      contactForm.addEventListener("submit", (e) => this.handleSaveContact(e));
    }

    // Campus Coordinates Settings form submit
    const settingsForm = document.getElementById("campus-settings-form");
    if (settingsForm) {
      settingsForm.addEventListener("submit", (e) => this.handleSaveSettings(e));
    }

    // Firebase config form submit
    const firebaseForm = document.getElementById("firebase-config-form");
    if (firebaseForm) {
      firebaseForm.addEventListener("submit", (e) => this.handleSaveFirebaseConfig(e));
    }

    // Switch to Demo Mode button
    const demoModeBtn = document.getElementById("btn-switch-demo-mode");
    if (demoModeBtn) {
      demoModeBtn.addEventListener("click", () => this.handleSwitchToDemoMode());
    }

    // Reset data button
    const resetDataBtn = document.getElementById("btn-admin-reset-demo");
    if (resetDataBtn) {
      resetDataBtn.addEventListener("click", () => {
        if (confirm("Reset all campus data to factory demo defaults? Custom buildings, contacts, and reports will be restored.")) {
          window.storageService.resetAllData();
          window.campusApp.showToast("All campus data reset to default demo state.", "success");
          this.loadDashboardData();
          window.campusMapService.loadMapData();
        }
      });
    }

    // Export data button
    const exportDataBtn = document.getElementById("btn-admin-export-data");
    if (exportDataBtn) {
      exportDataBtn.addEventListener("click", () => this.exportCampusData());
    }
  }

  switchAdminTab(tabName) {
    this.currentAdminTab = tabName;
    document.querySelectorAll(".admin-nav-item").forEach(item => {
      item.classList.toggle("active", item.dataset.adminTab === tabName);
    });
    document.querySelectorAll(".admin-tab-pane").forEach(pane => {
      pane.classList.add("hidden");
    });
    const targetPane = document.getElementById(`admin-pane-${tabName}`);
    if (targetPane) targetPane.classList.remove("hidden");
  }

  async loadDashboardData() {
    const buildings = await window.storageService.getBuildings();
    const safetyReports = await window.storageService.getSafetyReports();
    const arReports = await window.storageService.getAntiRaggingReports();
    const securityPoints = await window.storageService.getSecurityPoints();
    const pathways = await window.storageService.getWellLitPathways();
    const contacts = await window.storageService.getContacts();

    // Stats
    const statBldgs = document.getElementById("stat-total-buildings");
    if (statBldgs) statBldgs.textContent = buildings.length;

    const statSec = document.getElementById("stat-total-security");
    if (statSec) statSec.textContent = securityPoints.length;

    const statHazards = document.getElementById("stat-total-hazards");
    if (statHazards) statHazards.textContent = safetyReports.filter(r => r.status !== "Resolved").length;

    const statAR = document.getElementById("stat-total-antiragging");
    if (statAR) statAR.textContent = arReports.filter(r => r.status !== "Resolved").length;

    // Render Sub-tables
    this.renderAdminBuildingsTable(buildings);
    this.renderAdminSecurityTable(securityPoints);
    this.renderAdminPathwaysTable(pathways);
    this.renderAdminContactsTable(contacts);
    this.renderAdminSafetyTable(safetyReports);
    this.renderAdminAntiRaggingTable(arReports);
    this.loadAdminSettings();
  }

  // ==========================================
  // Building Management
  // ==========================================
  renderAdminBuildingsTable(buildings) {
    const tbody = document.getElementById("admin-buildings-tbody");
    if (!tbody) return;

    tbody.innerHTML = buildings.map(b => `
      <tr>
        <td><strong>${b.code || 'BLDG'}</strong></td>
        <td>
          <div style="font-weight:600; color:#0F172A;">${b.name}</div>
          <small class="text-muted">${b.coords[0].toFixed(4)}, ${b.coords[1].toFixed(4)}</small>
        </td>
        <td><span class="badge badge-info">${b.category}</span></td>
        <td>${b.hours ? b.hours.split('(')[0] : '8 AM - 8 PM'}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-xs" onclick="window.campusAdminManager.openEditBuildingModal('${b.id}')" title="Edit Building">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-outline btn-xs text-danger" onclick="window.campusAdminManager.handleDeleteBuilding('${b.id}')" title="Delete Building">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  openAddBuildingModal() {
    this.editingBuildingId = null;
    const modal = document.getElementById("admin-building-modal");
    const form = document.getElementById("building-modal-form");
    if (modal && form) {
      form.reset();
      document.getElementById("modal-building-title").textContent = "Add Campus Building";
      document.getElementById("modal-bldg-lat").value = CAMPUS_CONFIG.mapCenter[0];
      document.getElementById("modal-bldg-lng").value = CAMPUS_CONFIG.mapCenter[1];
      modal.classList.add("active");
    }
  }

  async openEditBuildingModal(bldgId) {
    this.editingBuildingId = bldgId;
    const buildings = await window.storageService.getBuildings();
    const b = buildings.find(x => x.id === bldgId);
    if (!b) return;

    const modal = document.getElementById("admin-building-modal");
    if (modal) {
      document.getElementById("modal-building-title").textContent = `Edit ${b.name}`;
      document.getElementById("modal-bldg-name").value = b.name;
      document.getElementById("modal-bldg-code").value = b.code || "";
      document.getElementById("modal-bldg-category").value = b.category || "Academic";
      document.getElementById("modal-bldg-lat").value = b.coords[0];
      document.getElementById("modal-bldg-lng").value = b.coords[1];
      document.getElementById("modal-bldg-hours").value = b.hours || "";
      document.getElementById("modal-bldg-floors").value = b.floors || 3;
      document.getElementById("modal-bldg-desc").value = b.description || "";
      document.getElementById("modal-bldg-amenities").value = (b.amenities || []).join(", ");
      document.getElementById("modal-bldg-accessible").checked = b.accessible !== false;

      modal.classList.add("active");
    }
  }

  closeBuildingModal() {
    const modal = document.getElementById("admin-building-modal");
    if (modal) modal.classList.remove("active");
  }

  async handleSaveBuilding(e) {
    e.preventDefault();

    const name = document.getElementById("modal-bldg-name").value.trim();
    const code = document.getElementById("modal-bldg-code").value.trim();
    const category = document.getElementById("modal-bldg-category").value;
    const lat = parseFloat(document.getElementById("modal-bldg-lat").value);
    const lng = parseFloat(document.getElementById("modal-bldg-lng").value);
    const hours = document.getElementById("modal-bldg-hours").value.trim();
    const floors = parseInt(document.getElementById("modal-bldg-floors").value) || 3;
    const desc = document.getElementById("modal-bldg-desc").value.trim();
    const amenitiesRaw = document.getElementById("modal-bldg-amenities").value;
    const accessible = document.getElementById("modal-bldg-accessible").checked;

    if (!name || isNaN(lat) || isNaN(lng)) {
      window.campusApp.showToast("Please provide building name and valid coordinates.", "warning");
      return;
    }

    const amenities = amenitiesRaw ? amenitiesRaw.split(",").map(a => a.trim()).filter(Boolean) : ["Restrooms", "Wi-Fi"];

    const buildingData = {
      id: this.editingBuildingId || undefined,
      name,
      code,
      category,
      coords: [lat, lng],
      hours: hours || "08:00 AM - 08:00 PM",
      floors,
      description: desc || "Campus facility building.",
      amenities,
      accessible,
      color: "#1E3A8A",
      icon: "fa-building"
    };

    await window.storageService.saveBuilding(buildingData);
    window.campusApp.showToast(`Building "${name}" saved successfully!`, "success");

    this.closeBuildingModal();
    this.loadDashboardData();
    window.campusMapService.loadMapData();
    window.campusNavigationUI.init();
  }

  async handleDeleteBuilding(bldgId) {
    if (confirm("Are you sure you want to delete this campus building?")) {
      await window.storageService.deleteBuilding(bldgId);
      window.campusApp.showToast("Building deleted from directory.", "info");
      this.loadDashboardData();
      window.campusMapService.loadMapData();
      window.campusNavigationUI.init();
    }
  }

  // ==========================================
  // Safety Reports Management
  // ==========================================
  renderAdminSafetyTable(reports) {
    const tbody = document.getElementById("admin-safety-tbody");
    if (!tbody) return;

    tbody.innerHTML = reports.map(r => `
      <tr>
        <td><strong>${r.id}</strong></td>
        <td>
          <div style="font-weight:600;">${r.category}</div>
          <small class="text-muted">${r.location}</small>
        </td>
        <td>
          <span class="severity-pill ${r.severity.toLowerCase()}">${r.severity}</span>
        </td>
        <td>
          <button class="badge-toggle-btn ${r.isVerified ? 'verified' : 'unverified'}" onclick="window.campusAdminManager.toggleReportVerification('${r.id}', ${!r.isVerified})">
            ${r.isVerified ? '<i class="fa-solid fa-check"></i> Verified' : '<i class="fa-solid fa-clock"></i> Unverified'}
          </button>
        </td>
        <td>
          <select class="admin-table-select" onchange="window.campusAdminManager.updateReportStatus('${r.id}', this.value)">
            <option value="New" ${r.status === 'New' ? 'selected' : ''}>New</option>
            <option value="Investigating" ${r.status === 'Investigating' ? 'selected' : ''}>Investigating</option>
            <option value="Resolved" ${r.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        </td>
      </tr>
    `).join("");
  }

  async toggleReportVerification(id, newStatus) {
    await window.storageService.updateSafetyReportStatus(id, undefined, newStatus);
    window.campusApp.showToast(`Report ${id} verification set to: ${newStatus ? 'Verified' : 'Unverified'}`, "success");
    this.loadDashboardData();
    window.campusSafetyManager.init();
    window.campusMapService.loadMapData();
  }

  async updateReportStatus(id, status) {
    await window.storageService.updateSafetyReportStatus(id, status, undefined);
    window.campusApp.showToast(`Report ${id} status updated to: ${status}`, "success");
    this.loadDashboardData();
    window.campusSafetyManager.init();
  }

  // ==========================================
  // Anti-Ragging Confidential Adjudication
  // ==========================================
  renderAdminAntiRaggingTable(cases) {
    const tbody = document.getElementById("admin-antiragging-tbody");
    if (!tbody) return;

    tbody.innerHTML = cases.map(c => `
      <tr class="sensitive-row">
        <td><strong class="text-primary">${c.id}</strong></td>
        <td>
          <div style="font-weight:600; color:#DC2626;">${c.category}</div>
          <small class="text-muted"><i class="fa-solid fa-location-dot"></i> ${c.location} &bull; ${c.incidentDate}</small>
        </td>
        <td>
          <span class="badge ${c.isAnonymous ? 'badge-warning' : 'badge-info'}">
            ${c.isAnonymous ? 'Anonymous' : c.complainantName}
          </span>
        </td>
        <td>
          <select class="admin-table-select" onchange="window.campusAdminManager.updateAntiRaggingStatus('${c.id}', this.value)">
            <option value="New" ${c.status === 'New' ? 'selected' : ''}>New</option>
            <option value="Investigating" ${c.status === 'Investigating' ? 'selected' : ''}>Investigating</option>
            <option value="Action Taken" ${c.status === 'Action Taken' ? 'selected' : ''}>Action Taken</option>
            <option value="Resolved" ${c.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
          </select>
        </td>
        <td>
          <button class="btn btn-primary btn-xs" onclick="window.campusAdminManager.openCaseDetailsModal('${c.id}')">
            <i class="fa-solid fa-folder-open"></i> Review Case
          </button>
        </td>
      </tr>
    `).join("");
  }

  async updateAntiRaggingStatus(id, status) {
    await window.storageService.updateAntiRaggingStatus(id, status);
    window.campusApp.showToast(`Anti-Ragging case ${id} marked as: ${status}`, "success");
    this.loadDashboardData();
  }

  async openCaseDetailsModal(caseId) {
    const cases = await window.storageService.getAntiRaggingReports();
    const c = cases.find(x => x.id === caseId);
    if (!c) return;

    const modal = document.createElement("div");
    modal.className = "case-review-modal";
    modal.innerHTML = `
      <div class="case-review-card">
        <div class="case-header">
          <div>
            <span class="confidential-seal"><i class="fa-solid fa-lock"></i> Strictly Confidential</span>
            <h3>Case Docket: ${c.id}</h3>
          </div>
          <button class="btn-icon" onclick="this.closest('.case-review-modal').remove()">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="case-grid">
          <div><strong>Category:</strong> ${c.category}</div>
          <div><strong>Date/Time:</strong> ${c.incidentDate}</div>
          <div><strong>Location:</strong> ${c.location}</div>
          <div><strong>Complainant:</strong> ${c.isAnonymous ? 'Statutory Anonymous Identity' : `${c.complainantName} (Roll: ${c.complainantRoll || 'N/A'}, Phone: ${c.complainantContact || 'N/A'})`}</div>
          <div><strong>Involved Suspects:</strong> ${c.suspectDetails || 'Not specified'}</div>
          <div><strong>Status:</strong> ${c.status}</div>
        </div>

        <div class="case-desc-box">
          <h5><i class="fa-solid fa-file-lines"></i> Incident Narrative:</h5>
          <p>${c.description}</p>
        </div>

        ${c.evidenceUrl ? `
          <div class="case-evidence-box">
            <h5><i class="fa-solid fa-paperclip"></i> Attached Proof:</h5>
            <img src="${c.evidenceUrl}" alt="Case Evidence" class="evidence-preview-img" onclick="window.campusSafetyManager.viewFullImage('${c.evidenceUrl}')">
          </div>
        ` : ''}

        <div class="case-action-form">
          <h5><i class="fa-solid fa-gavel"></i> Proctorial Action Notes:</h5>
          <textarea id="case-proctor-notes" rows="3" placeholder="Enter confidential committee resolutions, student summons, or disciplinary actions...">${c.actionNotes || ''}</textarea>
          <div class="case-footer-actions">
            <button class="btn btn-outline" onclick="this.closest('.case-review-modal').remove()">Close</button>
            <button class="btn btn-primary" onclick="window.campusAdminManager.saveCaseNotes('${c.id}', this)">
              <i class="fa-solid fa-floppy-disk"></i> Save Case Record
            </button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }

  async saveCaseNotes(caseId, btnEl) {
    const notes = document.getElementById("case-proctor-notes").value.trim();
    await window.storageService.updateAntiRaggingStatus(caseId, undefined, "Dr. K. Sharma (Chief Proctor)", notes);
    window.campusApp.showToast(`Proctorial notes saved for Docket ${caseId}`, "success");
    btnEl.closest(".case-review-modal").remove();
    this.loadDashboardData();
  }

  // ==========================================
  // Security Points & Well-Lit Pathways
  // ==========================================
  renderAdminSecurityTable(points) {
    const tbody = document.getElementById("admin-security-tbody");
    if (!tbody) return;

    tbody.innerHTML = points.map(sp => `
      <tr>
        <td>
          <div style="font-weight:600; color:#0F172A;"><i class="fa-solid fa-shield-halved" style="color:#0D9488"></i> ${sp.name}</div>
          <small class="text-muted">${sp.coords[0].toFixed(4)}, ${sp.coords[1].toFixed(4)}</small>
        </td>
        <td><span class="badge badge-info">${sp.type}</span></td>
        <td><strong>${sp.phone}</strong></td>
        <td>
          <span class="badge ${sp.isVerified ? 'badge-success' : 'badge-warning'}">
            ${sp.isVerified ? 'Verified' : 'Unverified'}
          </span>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-xs" onclick="window.campusAdminManager.openEditSecurityModal('${sp.id}')" title="Edit Security Post">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-outline btn-xs text-danger" onclick="window.campusAdminManager.handleDeleteSecurityPoint('${sp.id}')" title="Delete Security Post">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  openAddSecurityModal() {
    this.editingSecurityPointId = null;
    const modal = document.getElementById("admin-security-modal");
    const form = document.getElementById("security-modal-form");
    if (modal && form) {
      form.reset();
      document.getElementById("modal-security-title").textContent = "Add Security Post / Kiosk";
      document.getElementById("modal-sec-lat").value = CAMPUS_CONFIG.mapCenter[0];
      document.getElementById("modal-sec-lng").value = CAMPUS_CONFIG.mapCenter[1];
      modal.classList.add("active");
    }
  }

  async openEditSecurityModal(spId) {
    this.editingSecurityPointId = spId;
    const points = await window.storageService.getSecurityPoints();
    const sp = points.find(p => p.id === spId);
    if (!sp) return;

    const modal = document.getElementById("admin-security-modal");
    if (modal) {
      document.getElementById("modal-security-title").textContent = `Edit ${sp.name}`;
      document.getElementById("modal-sec-name").value = sp.name;
      document.getElementById("modal-sec-type").value = sp.type || "Guard Post";
      document.getElementById("modal-sec-lat").value = sp.coords[0];
      document.getElementById("modal-sec-lng").value = sp.coords[1];
      document.getElementById("modal-sec-phone").value = sp.phone || "";
      document.getElementById("modal-sec-desc").value = sp.description || "";
      document.getElementById("modal-sec-verified").checked = sp.isVerified !== false;

      modal.classList.add("active");
    }
  }

  closeSecurityModal() {
    const modal = document.getElementById("admin-security-modal");
    if (modal) modal.classList.remove("active");
  }

  async handleSaveSecurityPoint(e) {
    e.preventDefault();

    const name = document.getElementById("modal-sec-name").value.trim();
    const type = document.getElementById("modal-sec-type").value;
    const lat = parseFloat(document.getElementById("modal-sec-lat").value);
    const lng = parseFloat(document.getElementById("modal-sec-lng").value);
    const phone = document.getElementById("modal-sec-phone").value.trim();
    const desc = document.getElementById("modal-sec-desc").value.trim();
    const isVerified = document.getElementById("modal-sec-verified").checked;

    if (!name || isNaN(lat) || isNaN(lng) || !phone) {
      window.campusApp.showToast("Please provide name, coordinates, and phone number.", "warning");
      return;
    }

    const data = {
      id: this.editingSecurityPointId || undefined,
      name,
      type,
      coords: [lat, lng],
      phone,
      description: desc || "Campus security outpost.",
      isVerified
    };

    await window.storageService.saveSecurityPoint(data);
    window.campusApp.showToast(`Security post "${name}" saved!`, "success");
    this.closeSecurityModal();
    this.loadDashboardData();
    window.campusSafetyManager.init();
    window.campusMapService.loadMapData();
  }

  async handleDeleteSecurityPoint(id) {
    if (confirm("Delete this security post from the campus grid?")) {
      await window.storageService.deleteSecurityPoint(id);
      window.campusApp.showToast("Security post removed.", "info");
      this.loadDashboardData();
      window.campusSafetyManager.init();
      window.campusMapService.loadMapData();
    }
  }

  // Well-Lit Pathways
  renderAdminPathwaysTable(pathways) {
    const tbody = document.getElementById("admin-pathways-tbody");
    if (!tbody) return;

    tbody.innerHTML = pathways.map(wlp => `
      <tr>
        <td><strong>${wlp.name}</strong></td>
        <td><small class="text-muted">${wlp.description}</small></td>
        <td>
          <span class="badge badge-success"><i class="fa-solid fa-lightbulb"></i> ${wlp.safetyScore}% Safe</span>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-xs text-danger" onclick="window.campusAdminManager.handleDeletePathway('${wlp.id}')" title="Delete Pathway">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  openAddPathwayModal() {
    const modal = document.getElementById("admin-pathway-modal");
    if (modal) {
      document.getElementById("pathway-modal-form").reset();
      modal.classList.add("active");
    }
  }

  closePathwayModal() {
    const modal = document.getElementById("admin-pathway-modal");
    if (modal) modal.classList.remove("active");
  }

  async handleSavePathway(e) {
    e.preventDefault();

    const name = document.getElementById("modal-path-name").value.trim();
    const desc = document.getElementById("modal-path-desc").value.trim();
    const score = parseInt(document.getElementById("modal-path-score").value) || 95;
    const coordsRaw = document.getElementById("modal-path-coords").value.trim();

    if (!name || !coordsRaw) {
      window.campusApp.showToast("Please provide pathway name and coordinates.", "warning");
      return;
    }

    try {
      // Expect JSON array of coordinates or line format
      let coords = [];
      if (coordsRaw.startsWith("[")) {
        coords = JSON.parse(coordsRaw);
      } else {
        coords = coordsRaw.split("\n").map(line => {
          const parts = line.split(",").map(p => parseFloat(p.trim()));
          return [parts[0], parts[1]];
        }).filter(p => !isNaN(p[0]) && !isNaN(p[1]));
      }

      if (coords.length < 2) {
        window.campusApp.showToast("A pathway must contain at least 2 coordinate points.", "warning");
        return;
      }

      await window.storageService.saveWellLitPathway({
        name,
        description: desc || "Illuminated student pathway",
        coords,
        safetyScore: score,
        isVerified: true
      });

      window.campusApp.showToast(`Well-lit pathway "${name}" added!`, "success");
      this.closePathwayModal();
      this.loadDashboardData();
      window.campusMapService.loadMapData();
    } catch (err) {
      window.campusApp.showToast("Invalid coordinates format. Use JSON array e.g. [[28.54, 77.19], [28.55, 77.19]]", "error");
    }
  }

  async handleDeletePathway(id) {
    if (confirm("Delete this well-lit pathway?")) {
      await window.storageService.deleteWellLitPathway(id);
      window.campusApp.showToast("Pathway deleted.", "info");
      this.loadDashboardData();
      window.campusMapService.loadMapData();
    }
  }

  // ==========================================
  // Emergency Contacts Management
  // ==========================================
  renderAdminContactsTable(contacts) {
    const tbody = document.getElementById("admin-contacts-tbody");
    if (!tbody) return;

    tbody.innerHTML = contacts.map(c => `
      <tr>
        <td>
          <div style="font-weight:600; color:#0F172A;">${c.name}</div>
          <small class="text-muted"><i class="fa-solid fa-location-dot"></i> ${c.location || 'Campus'}</small>
        </td>
        <td><span class="badge badge-info">${c.role}</span></td>
        <td><strong>${c.phone}</strong></td>
        <td>
          <button class="badge-toggle-btn ${c.isPrimary ? 'verified' : 'unverified'}" onclick="window.campusAdminManager.togglePrimaryContact('${c.id}')">
            ${c.isPrimary ? '<i class="fa-solid fa-star"></i> Primary SOS' : 'Standard'}
          </button>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-xs" onclick="window.campusAdminManager.openEditContactModal('${c.id}')" title="Edit Contact">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn btn-outline btn-xs text-danger" onclick="window.campusAdminManager.handleDeleteContact('${c.id}')" title="Delete Contact">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join("");
  }

  openAddContactModal() {
    this.editingContactId = null;
    const modal = document.getElementById("admin-contact-modal");
    if (modal) {
      document.getElementById("contact-modal-form").reset();
      document.getElementById("modal-contact-title").textContent = "Add Emergency Contact";
      modal.classList.add("active");
    }
  }

  async openEditContactModal(contactId) {
    this.editingContactId = contactId;
    const contacts = await window.storageService.getContacts();
    const c = contacts.find(x => x.id === contactId);
    if (!c) return;

    const modal = document.getElementById("admin-contact-modal");
    if (modal) {
      document.getElementById("modal-contact-title").textContent = `Edit ${c.name}`;
      document.getElementById("modal-contact-name").value = c.name;
      document.getElementById("modal-contact-role").value = c.role || "";
      document.getElementById("modal-contact-phone").value = c.phone;
      document.getElementById("modal-contact-location").value = c.location || "";
      document.getElementById("modal-contact-badge").value = c.badge || "24x7 Active";
      document.getElementById("modal-contact-primary").checked = c.isPrimary === true;

      modal.classList.add("active");
    }
  }

  closeContactModal() {
    const modal = document.getElementById("admin-contact-modal");
    if (modal) modal.classList.remove("active");
  }

  async handleSaveContact(e) {
    e.preventDefault();

    const name = document.getElementById("modal-contact-name").value.trim();
    const role = document.getElementById("modal-contact-role").value.trim();
    const phone = document.getElementById("modal-contact-phone").value.trim();
    const location = document.getElementById("modal-contact-location").value.trim();
    const badge = document.getElementById("modal-contact-badge").value.trim();
    const isPrimary = document.getElementById("modal-contact-primary").checked;

    if (!name || !phone) {
      window.campusApp.showToast("Please provide contact name and phone number.", "warning");
      return;
    }

    // If setting as primary, demote other contacts
    if (isPrimary) {
      let contacts = await window.storageService.getContacts();
      contacts.forEach(c => c.isPrimary = false);
      localStorage.setItem("cs_contacts", JSON.stringify(contacts));
    }

    await window.storageService.saveContact({
      id: this.editingContactId || undefined,
      name,
      role: role || "Campus Support",
      phone,
      location: location || "Campus Main",
      badge: badge || "Active",
      isPrimary
    });

    window.campusApp.showToast(`Emergency contact "${name}" saved!`, "success");
    this.closeContactModal();
    this.loadDashboardData();
    window.campusSafetyManager.init();
  }

  async handleDeleteContact(id) {
    if (confirm("Delete this emergency telephone contact?")) {
      await window.storageService.deleteContact(id);
      window.campusApp.showToast("Contact removed.", "info");
      this.loadDashboardData();
      window.campusSafetyManager.init();
    }
  }

  async togglePrimaryContact(id) {
    let contacts = await window.storageService.getContacts();
    contacts.forEach(c => {
      c.isPrimary = (c.id === id);
    });
    localStorage.setItem("cs_contacts", JSON.stringify(contacts));
    window.campusApp.showToast("Primary SOS emergency number updated!", "success");
    this.loadDashboardData();
  }

  // ==========================================
  // Campus Coordinates Settings & Firebase
  // ==========================================
  async loadAdminSettings() {
    const settings = await window.storageService.getCampusSettings();
    if (settings) {
      const elName = document.getElementById("set-campus-name");
      if (elName) elName.value = settings.campusName || "";
      const elTagline = document.getElementById("set-campus-tagline");
      if (elTagline) elTagline.value = settings.tagline || "";
      const elLat = document.getElementById("set-campus-lat");
      if (elLat && settings.mapCenter) elLat.value = settings.mapCenter[0];
      const elLng = document.getElementById("set-campus-lng");
      if (elLng && settings.mapCenter) elLng.value = settings.mapCenter[1];
      const elZoom = document.getElementById("set-campus-zoom");
      if (elZoom) elZoom.value = settings.defaultZoom || 16.5;
    }

    // Load Firebase config status
    const fbStatus = document.getElementById("firebase-status-pill");
    if (fbStatus) {
      if (window.storageService.isFirebaseReady) {
        fbStatus.innerHTML = `<span class="badge badge-success"><i class="fa-solid fa-circle-check"></i> Connected to Live Firebase</span>`;
      } else {
        fbStatus.innerHTML = `<span class="badge badge-warning"><i class="fa-solid fa-server"></i> Operating in Local Demo Mode (Zero-Config Active)</span>`;
      }
    }

    const fbConfig = window.storageService.getFirebaseConfig();
    if (fbConfig) {
      const elKey = document.getElementById("fb-cfg-apikey");
      if (elKey) elKey.value = fbConfig.apiKey || "";
      const elAuth = document.getElementById("fb-cfg-authdomain");
      if (elAuth) elAuth.value = fbConfig.authDomain || "";
      const elProj = document.getElementById("fb-cfg-projectid");
      if (elProj) elProj.value = fbConfig.projectId || "";
      const elBucket = document.getElementById("fb-cfg-storagebucket");
      if (elBucket) elBucket.value = fbConfig.storageBucket || "";
      const elAppId = document.getElementById("fb-cfg-appid");
      if (elAppId) elAppId.value = fbConfig.appId || "";
    }
  }

  async handleSaveSettings(e) {
    e.preventDefault();

    const name = document.getElementById("set-campus-name").value.trim();
    const tagline = document.getElementById("set-campus-tagline").value.trim();
    const lat = parseFloat(document.getElementById("set-campus-lat").value);
    const lng = parseFloat(document.getElementById("set-campus-lng").value);
    const zoom = parseFloat(document.getElementById("set-campus-zoom").value) || 16.5;

    if (isNaN(lat) || isNaN(lng)) {
      window.campusApp.showToast("Please provide valid latitude and longitude numbers.", "warning");
      return;
    }

    await window.storageService.saveCampusSettings({
      campusName: name || CAMPUS_CONFIG.campusName,
      tagline: tagline || CAMPUS_CONFIG.tagline,
      mapCenter: [lat, lng],
      defaultZoom: zoom
    });

    window.campusApp.showToast("Campus center coordinates updated! Reloading map...", "success");
    window.campusMapService.initMap("campus-map");
  }

  handleSaveFirebaseConfig(e) {
    e.preventDefault();

    const apiKey = document.getElementById("fb-cfg-apikey").value.trim();
    const authDomain = document.getElementById("fb-cfg-authdomain").value.trim();
    const projectId = document.getElementById("fb-cfg-projectid").value.trim();
    const storageBucket = document.getElementById("fb-cfg-storagebucket").value.trim();
    const appId = document.getElementById("fb-cfg-appid").value.trim();

    if (!apiKey || !projectId) {
      window.campusApp.showToast("API Key and Project ID are required.", "warning");
      return;
    }

    window.storageService.saveFirebaseConfig({
      apiKey,
      authDomain,
      projectId,
      storageBucket,
      appId
    });

    window.campusApp.showToast("Firebase credentials saved! Reload page to initialize Firebase connection.", "success");
  }

  handleSwitchToDemoMode() {
    localStorage.removeItem("cs_firebase_custom_config");
    window.campusApp.showToast("Switched to Local Demo Mode.", "info");
    this.loadAdminSettings();
  }

  exportCampusData() {
    const data = {
      exportedAt: new Date().toISOString(),
      buildings: JSON.parse(localStorage.getItem("cs_buildings") || "[]"),
      safetyReports: JSON.parse(localStorage.getItem("cs_safety_reports") || "[]"),
      antiRaggingReports: JSON.parse(localStorage.getItem("cs_antiragging_reports") || "[]")
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campus_saathi_export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    window.campusApp.showToast("Exported campus dataset as JSON file.", "success");
  }
}

// Global admin instance
window.campusAdminManager = new CampusAdminManager();
