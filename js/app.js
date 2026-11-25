/**
 * Campus Saathi - Main Application Coordinator
 * Tagline: "Your campus, Your safety"
 * Slogan: "Find Your Way. Feel Safer. Speak Up."
 */

class CampusSaathiApp {
  constructor() {
    this.currentTab = "home";
  }

  init() {
    this.setupNavigation();
    this.setupMobileMenu();
    this.setupModalDismissals();
    this.updateUserNavUI();

    // Check URL hash for direct deep links
    const hash = window.location.hash.replace("#", "");
    if (hash && ["home", "navigation", "safety", "antiragging", "dashboard", "admin", "about", "contact"].includes(hash)) {
      this.navigateToTab(hash);
    } else {
      this.navigateToTab("home");
    }

    // Initialize sub-modules
    window.campusNavigationUI.init();
    window.campusSafetyManager.init();
    window.emergencySOSManager.init();
    window.antiRaggingManager.init();
    window.studentDashboardManager.init();
    window.campusAdminManager.init();

    // First time welcome tip
    if (!localStorage.getItem("cs_first_visit")) {
      setTimeout(() => {
        this.showToast("Welcome to Campus Saathi! Explore campus buildings or test Emergency SOS.", "info", 5000);
        localStorage.setItem("cs_first_visit", "true");
      }, 1200);
    }

    console.log("🚀 Campus Saathi Platform Initialized Successfully");
  }

  setupNavigation() {
    // Nav links
    document.querySelectorAll(".nav-link").forEach(link => {
      link.addEventListener("click", (e) => {
        const tab = link.dataset.tab;
        if (tab) {
          e.preventDefault();
          this.navigateToTab(tab);
          // Close mobile menu if open
          document.getElementById("mobile-menu-drawer")?.classList.remove("active");
        }
      });
    });

    // Hash listener
    window.addEventListener("hashchange", () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && hash !== this.currentTab) {
        this.navigateToTab(hash, false);
      }
    });
  }

  setupMobileMenu() {
    const toggleBtn = document.getElementById("mobile-menu-toggle");
    const drawer = document.getElementById("mobile-menu-drawer");
    const closeBtn = document.getElementById("mobile-menu-close");

    if (toggleBtn && drawer) {
      toggleBtn.addEventListener("click", () => drawer.classList.add("active"));
    }
    if (closeBtn && drawer) {
      closeBtn.addEventListener("click", () => drawer.classList.remove("active"));
    }
  }

  setupModalDismissals() {
    // Dismiss modals when clicking on background backdrop
    document.querySelectorAll(".cs-modal-backdrop").forEach(modal => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal) {
          modal.classList.remove("active");
          if (modal.id === "sos-emergency-modal") {
            window.emergencySOSManager.stopAudibleSiren();
          }
        }
      });
    });

    // ESC key closes any open modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        document.querySelectorAll(".cs-modal-backdrop.active").forEach(m => {
          m.classList.remove("active");
        });
        window.emergencySOSManager.stopAudibleSiren();
      }
    });
  }

  navigateToTab(tabName, updateHash = true) {
    this.currentTab = tabName;

    if (updateHash) {
      window.location.hash = tabName;
    }

    // Hide all sections
    document.querySelectorAll(".app-section").forEach(sec => {
      sec.classList.add("hidden");
    });

    // Show target section
    const targetSection = document.getElementById(`section-${tabName}`);
    if (targetSection) {
      targetSection.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    // Update active nav links
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.toggle("active", link.dataset.tab === tabName);
    });

    // If navigating to Map section, trigger map resize & re-render so Leaflet displays tiles properly
    if (tabName === "navigation") {
      setTimeout(() => {
        if (!window.campusMapService.map) {
          window.campusMapService.initMap("campus-map");
        } else {
          window.campusMapService.map.invalidateSize();
        }
      }, 100);
    }

    // If navigating to Admin section, refresh auth & data
    if (tabName === "admin") {
      window.campusAdminManager.checkAdminAuth();
    }

    // If navigating to Dashboard, update announcements & activity
    if (tabName === "dashboard") {
      window.studentDashboardManager.init();
    }
  }

  updateUserNavUI() {
    const user = window.storageService.getCurrentUser();
    const navUserBadge = document.getElementById("nav-user-indicator");
    if (!navUserBadge) return;

    if (user && user.role === "admin") {
      navUserBadge.innerHTML = `
        <span class="user-badge admin-badge" onclick="window.campusApp.navigateToTab('admin')">
          <i class="fa-solid fa-user-shield"></i> Admin Active
        </span>
      `;
    } else {
      navUserBadge.innerHTML = `
        <span class="user-badge student-badge" onclick="window.campusApp.navigateToTab('dashboard')">
          <i class="fa-solid fa-graduation-cap"></i> Student Mode
        </span>
      `;
    }
  }

  setRouteStart(buildingId) {
    this.navigateToTab("navigation");
    const startSelect = document.getElementById("nav-start-select");
    if (startSelect) {
      startSelect.value = buildingId;
      this.showToast("Starting point set! Select destination or click any building.", "info");
      setTimeout(() => {
        window.campusMapService.focusBuilding(buildingId);
      }, 200);
    }
  }

  setRouteDestination(buildingId) {
    this.navigateToTab("navigation");
    const endSelect = document.getElementById("nav-end-select");
    const startSelect = document.getElementById("nav-start-select");
    
    if (endSelect) {
      endSelect.value = buildingId;
      // If start is empty, suggest Main Gate
      if (startSelect && !startSelect.value) {
        startSelect.value = "b9"; // Main Gate
      }
      this.showToast("Destination locked! Click 'Calculate Walking Route' or change start.", "info");
      
      // Focus building on map
      setTimeout(() => {
        window.campusMapService.focusBuilding(buildingId);
      }, 200);
    }
  }

  openUserGuide() {
    const modal = document.getElementById("user-guide-modal");
    if (modal) modal.classList.add("active");
  }

  async openBuildingModal(buildingId) {
    const buildings = await window.storageService.getBuildings();
    const b = buildings.find(x => x.id === buildingId);
    if (!b) return;

    const modal = document.getElementById("building-detail-modal");
    if (!modal) return;

    document.getElementById("modal-detail-name").textContent = b.name;
    document.getElementById("modal-detail-code").textContent = b.code || b.category;
    document.getElementById("modal-detail-desc").textContent = b.description;
    document.getElementById("modal-detail-hours").textContent = b.hours || "08:00 AM - 08:00 PM";
    document.getElementById("modal-detail-floors").textContent = `${b.floors || 3} Floors`;
    document.getElementById("modal-detail-access").textContent = b.accessible ? "Wheelchair Accessible Ramp & Lift" : "Standard Staircase Access";

    const amenitiesList = document.getElementById("modal-detail-amenities");
    if (amenitiesList) {
      amenitiesList.innerHTML = (b.amenities || []).map(a => `<li><i class="fa-solid fa-circle-check"></i> ${a}</li>`).join("");
    }

    const routeBtn = document.getElementById("modal-detail-route-btn");
    if (routeBtn) {
      routeBtn.onclick = () => {
        modal.classList.remove("active");
        this.setRouteDestination(b.id);
      };
    }

    modal.classList.add("active");
  }

  // Toast Notification System
  showToast(message, type = "info", duration = 3800) {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast-item toast-${type}`;

    let icon = "fa-circle-info";
    if (type === "success") icon = "fa-circle-check";
    if (type === "warning") icon = "fa-triangle-exclamation";
    if (type === "error") icon = "fa-circle-xmark";

    toast.innerHTML = `
      <i class="fa-solid ${icon} toast-icon"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close" onclick="this.parentElement.remove()"><i class="fa-solid fa-xmark"></i></button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("toast-fade-out");
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }
}

// Global App instance
window.campusApp = new CampusSaathiApp();

// Boot application upon DOM ready
document.addEventListener("DOMContentLoaded", () => {
  window.campusApp.init();
});
