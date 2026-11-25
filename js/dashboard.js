/**
 * Campus Saathi - Student Dashboard Module
 * Personalized welcome, quick navigation, campus announcements, and activity tracking.
 */

class StudentDashboardManager {
  constructor() {
    this.currentUser = null;
  }

  async init() {
    this.currentUser = window.storageService.getCurrentUser();
    this.renderWelcome();
    this.renderAnnouncements();
    this.renderQuickLocations();
    this.renderRecentActivity();
    this.bindEvents();
  }

  renderWelcome() {
    const greetingEl = document.getElementById("dash-user-greeting");
    const roleBadge = document.getElementById("dash-role-badge");
    const dateEl = document.getElementById("dash-current-date");

    if (greetingEl) {
      const name = this.currentUser ? this.currentUser.displayName : "Campus Student";
      greetingEl.textContent = `Welcome back, ${name}!`;
    }

    if (roleBadge) {
      const role = this.currentUser ? this.currentUser.role : "Student";
      roleBadge.textContent = role.toUpperCase();
    }

    if (dateEl) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }
  }

  renderAnnouncements() {
    const container = document.getElementById("dash-announcements-list");
    if (!container) return;

    container.innerHTML = CAMPUS_CONFIG.announcements.map(ann => {
      let icon = "fa-bullhorn";
      let badgeClass = "badge-info";
      if (ann.category === "Safety") { icon = "fa-shield-halved"; badgeClass = "badge-warning"; }
      if (ann.category === "Anti-Ragging") { icon = "fa-scale-balanced"; badgeClass = "badge-danger"; }

      return `
        <div class="announcement-item ${ann.priority === 'high' ? 'priority-high' : ''}">
          <div class="announcement-icon-wrap">
            <i class="fa-solid ${icon}"></i>
          </div>
          <div class="announcement-body">
            <div class="announcement-header">
              <span class="announcement-category ${badgeClass}">${ann.category}</span>
              <span class="announcement-date"><i class="fa-regular fa-calendar"></i> ${ann.date}</span>
            </div>
            <h4 class="announcement-title">${ann.title}</h4>
            <p class="announcement-text">${ann.content}</p>
          </div>
        </div>
      `;
    }).join("");
  }

  async renderQuickLocations() {
    const container = document.getElementById("dash-quick-locations-grid");
    if (!container) return;

    const buildings = await window.storageService.getBuildings();
    // Pick 4 high-frequency destinations: Library, CS Block, Cafeteria, Main Gate
    const featuredIds = ["b5", "b2", "b8", "b9"];
    const featured = buildings.filter(b => featuredIds.includes(b.id));

    container.innerHTML = featured.map(b => `
      <div class="quick-loc-tile" onclick="window.campusApp.setRouteDestination('${b.id}')">
        <div class="tile-icon" style="background:${b.color || '#1E3A8A'}">
          <i class="fa-solid ${b.icon || 'fa-building'}"></i>
        </div>
        <div class="tile-content">
          <h4>${b.name}</h4>
          <span class="tile-hours">${b.hours ? b.hours.split('(')[0] : 'Open'}</span>
        </div>
        <button class="tile-btn" title="Route here">
          <i class="fa-solid fa-diamond-turn-right"></i>
        </button>
      </div>
    `).join("");
  }

  async renderRecentActivity() {
    const container = document.getElementById("dash-my-activity");
    if (!container) return;

    const safetyReports = await window.storageService.getSafetyReports();
    const sosLogs = JSON.parse(localStorage.getItem("cs_sos_logs") || "[]");

    if (safetyReports.length === 0 && sosLogs.length === 0) {
      container.innerHTML = `
        <div class="no-activity-box">
          <i class="fa-regular fa-clipboard"></i>
          <p>No recent reports or alerts recorded from your browser.</p>
        </div>
      `;
      return;
    }

    let html = "";
    // Show top 3 safety reports
    safetyReports.slice(0, 3).forEach(r => {
      html += `
        <div class="dash-activity-item">
          <div class="activity-icon report-icon"><i class="fa-solid fa-triangle-exclamation"></i></div>
          <div class="activity-info">
            <span class="activity-title">${r.category} at ${r.location}</span>
            <span class="activity-sub">${r.reportedAt} &bull; Ref: ${r.id}</span>
          </div>
          <span class="activity-status-pill">${r.status}</span>
        </div>
      `;
    });

    // Show SOS logs if any
    sosLogs.slice(0, 2).forEach(s => {
      html += `
        <div class="dash-activity-item">
          <div class="activity-icon sos-icon"><i class="fa-solid fa-bell"></i></div>
          <div class="activity-info">
            <span class="activity-title">Emergency SOS Triggered</span>
            <span class="activity-sub">${s.timestamp} &bull; ${s.id}</span>
          </div>
          <span class="activity-status-pill" style="background:#FEE2E2;color:#991B1B;">Alert Issued</span>
        </div>
      `;
    });

    container.innerHTML = html;
  }

  bindEvents() {
    // Shortcuts
    const btnNavShortcut = document.getElementById("dash-btn-nav");
    if (btnNavShortcut) {
      btnNavShortcut.addEventListener("click", () => window.campusApp.navigateToTab("navigation"));
    }

    const btnHazardShortcut = document.getElementById("dash-btn-hazard");
    if (btnHazardShortcut) {
      btnHazardShortcut.addEventListener("click", () => window.campusApp.navigateToTab("safety"));
    }

    const btnAntiRaggingShortcut = document.getElementById("dash-btn-antiragging");
    if (btnAntiRaggingShortcut) {
      btnAntiRaggingShortcut.addEventListener("click", () => window.campusApp.navigateToTab("antiragging"));
    }
  }
}

// Global dashboard instance
window.studentDashboardManager = new StudentDashboardManager();
