/**
 * Campus Saathi - Navigation UI & Route Presentation
 */

class CampusNavigationUI {
  constructor() {
    this.buildings = [];
    this.selectedCategory = "all";
    this.searchQuery = "";
  }

  async init() {
    this.buildings = await window.storageService.getBuildings();
    this.populateDropdowns();
    this.renderBuildingCards();
    this.bindEvents();
  }

  populateDropdowns() {
    const startSelect = document.getElementById("nav-start-select");
    const endSelect = document.getElementById("nav-end-select");
    if (!startSelect || !endSelect) return;

    // Retain selected values if any
    const prevStart = startSelect.value;
    const prevEnd = endSelect.value;

    startSelect.innerHTML = `<option value="">Choose Starting Point...</option>`;
    endSelect.innerHTML = `<option value="">Choose Destination...</option>`;

    // Group by category
    const categories = [...new Set(this.buildings.map(b => b.category))];

    categories.forEach(cat => {
      const startOptGroup = document.createElement("optgroup");
      startOptGroup.label = cat;
      const endOptGroup = document.createElement("optgroup");
      endOptGroup.label = cat;

      const items = this.buildings.filter(b => b.category === cat);
      items.forEach(b => {
        const opt1 = document.createElement("option");
        opt1.value = b.id;
        opt1.textContent = `${b.name} (${b.code || b.category})`;
        startOptGroup.appendChild(opt1);

        const opt2 = document.createElement("option");
        opt2.value = b.id;
        opt2.textContent = `${b.name} (${b.code || b.category})`;
        endOptGroup.appendChild(opt2);
      });

      startSelect.appendChild(startOptGroup);
      endSelect.appendChild(endOptGroup);
    });

    if (prevStart) startSelect.value = prevStart;
    if (prevEnd) endSelect.value = prevEnd;
  }

  bindEvents() {
    // Route calculation button
    const findRouteBtn = document.getElementById("btn-calculate-route");
    if (findRouteBtn) {
      findRouteBtn.addEventListener("click", () => this.handleCalculateRoute());
    }

    // Swap starting and destination
    const swapBtn = document.getElementById("btn-swap-locations");
    if (swapBtn) {
      swapBtn.addEventListener("click", () => {
        const startSelect = document.getElementById("nav-start-select");
        const endSelect = document.getElementById("nav-end-select");
        if (startSelect && endSelect) {
          const temp = startSelect.value;
          startSelect.value = endSelect.value;
          endSelect.value = temp;
          if (startSelect.value && endSelect.value) {
            this.handleCalculateRoute();
          }
        }
      });
    }

    // Clear route
    const clearRouteBtn = document.getElementById("btn-clear-route");
    if (clearRouteBtn) {
      clearRouteBtn.addEventListener("click", () => this.clearRoute());
    }

    // GPS Locate me
    const locateBtn = document.getElementById("btn-locate-me");
    if (locateBtn) {
      locateBtn.addEventListener("click", async () => {
        locateBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Locating...`;
        try {
          const loc = await window.campusMapService.locateUser();
          if (loc.isFallback) {
            window.campusApp.showToast("Using Main Gate as starting anchor (GPS permission required for live device location).", "info");
            document.getElementById("nav-start-select").value = "b9"; // Main Gate
          } else {
            window.campusApp.showToast("GPS position acquired! Finding nearest campus building...", "success");
            const nearestNode = window.campusMapService.findNearestNode(loc.lat, loc.lng);
            // Reverse lookup building
            for (const [bId, nKey] of Object.entries(CAMPUS_CONFIG.buildingNodeMap)) {
              if (nKey === nearestNode) {
                document.getElementById("nav-start-select").value = bId;
                break;
              }
            }
          }
        } catch (err) {
          window.campusApp.showToast("Could not access GPS. Please select your starting building.", "warning");
        } finally {
          locateBtn.innerHTML = `<i class="fa-solid fa-crosshairs"></i> Locate Me`;
        }
      });
    }

    // Search bar filter
    const searchInput = document.getElementById("building-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderBuildingCards();
      });
    }

    // Layer checkboxes
    const chkWellLit = document.getElementById("toggle-layer-welllit");
    if (chkWellLit) {
      chkWellLit.addEventListener("change", (e) => {
        window.campusMapService.toggleLayer("wellLit", e.target.checked);
      });
    }

    const chkSecurity = document.getElementById("toggle-layer-security");
    if (chkSecurity) {
      chkSecurity.addEventListener("change", (e) => {
        window.campusMapService.toggleLayer("security", e.target.checked);
      });
    }

    const chkHazards = document.getElementById("toggle-layer-hazards");
    if (chkHazards) {
      chkHazards.addEventListener("change", (e) => {
        window.campusMapService.toggleLayer("safetyReports", e.target.checked);
      });
    }
  }

  handleCalculateRoute() {
    const startId = document.getElementById("nav-start-select").value;
    const endId = document.getElementById("nav-end-select").value;
    const preferSafe = document.getElementById("nav-prefer-safe") ? document.getElementById("nav-prefer-safe").checked : true;

    if (!startId || !endId) {
      window.campusApp.showToast("Please choose both a Starting Point and Destination.", "warning");
      return;
    }

    if (startId === endId) {
      window.campusApp.showToast("Starting point and destination cannot be identical.", "warning");
      return;
    }

    const route = window.campusMapService.calculateRoute(startId, endId, preferSafe);

    if (route.error) {
      window.campusApp.showToast(route.error, "error");
      return;
    }

    this.displayRouteDetails(route);
    window.campusApp.showToast(`Route mapped! Walking time: ~${route.totalTimeMinutes} mins (${route.totalDistanceMeters}m)`, "success");
  }

  displayRouteDetails(route) {
    const panel = document.getElementById("route-results-panel");
    if (!panel) return;

    panel.classList.remove("hidden");
    panel.scrollIntoView({ behavior: "smooth", block: "nearest" });

    const distText = route.totalDistanceMeters >= 1000 
      ? (route.totalDistanceMeters / 1000).toFixed(2) + " km" 
      : route.totalDistanceMeters + " meters";

    let stepsHtml = "";
    route.steps.forEach((step, idx) => {
      const litBadge = step.wellLit 
        ? `<span class="step-badge lit-badge" title="Designated well-lit corridor with CCTV"><i class="fa-solid fa-lightbulb"></i> Well-Lit</span>`
        : `<span class="step-badge dim-badge" title="Standard pathway"><i class="fa-solid fa-person-walking"></i> Standard</span>`;

      stepsHtml += `
        <li class="route-step-item">
          <div class="step-index">${idx + 1}</div>
          <div class="step-body">
            <p class="step-text">${step.instruction}</p>
            <div class="step-meta">
              <span class="step-dist"><i class="fa-solid fa-ruler-horizontal"></i> ${step.distance}m</span>
              ${litBadge}
            </div>
          </div>
        </li>
      `;
    });

    panel.innerHTML = `
      <div class="route-summary-card">
        <div class="summary-header">
          <div>
            <h4 class="route-title">
              <span>${route.startBuilding.name}</span> 
              <i class="fa-solid fa-arrow-right"></i> 
              <span>${route.endBuilding.name}</span>
            </h4>
            <p class="route-subtitle">Campus Walking Guidance (${route.isWellLitPreferred ? 'Safe Well-Lit Priority' : 'Shortest Path'})</p>
          </div>
          <button class="btn-icon" onclick="window.campusNavigationUI.clearRoute()" title="Close route">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>

        <div class="route-stats-grid">
          <div class="route-stat-box">
            <div class="stat-icon time-icon"><i class="fa-regular fa-clock"></i></div>
            <div class="stat-data">
              <span class="stat-num">${route.totalTimeMinutes} min</span>
              <span class="stat-lbl">Est. Walk Time</span>
            </div>
          </div>

          <div class="route-stat-box">
            <div class="stat-icon dist-icon"><i class="fa-solid fa-shoe-prints"></i></div>
            <div class="stat-data">
              <span class="stat-num">${distText}</span>
              <span class="stat-lbl">Total Distance</span>
            </div>
          </div>

          <div class="route-stat-box">
            <div class="stat-icon safety-icon"><i class="fa-solid fa-shield-heart"></i></div>
            <div class="stat-data">
              <span class="stat-num">${route.safetyScore}%</span>
              <span class="stat-lbl">Safety Index</span>
            </div>
          </div>
        </div>

        <div class="turn-by-turn-section">
          <h5><i class="fa-solid fa-list-ol"></i> Step-by-Step Directions</h5>
          <ol class="route-steps-list">
            ${stepsHtml}
          </ol>
        </div>

        <div class="route-actions-bar">
          <button class="btn btn-outline btn-sm" onclick="window.campusNavigationUI.clearRoute()">
            <i class="fa-solid fa-trash-can"></i> Clear Route
          </button>
          <button class="btn btn-primary btn-sm" onclick="window.print()">
            <i class="fa-solid fa-print"></i> Print Directions
          </button>
        </div>
      </div>
    `;
  }

  clearRoute() {
    window.campusMapService.clearRoute();
    const panel = document.getElementById("route-results-panel");
    if (panel) {
      panel.innerHTML = "";
      panel.classList.add("hidden");
    }
  }

  setCategoryFilter(category) {
    this.selectedCategory = category;
    
    // Update active UI pills
    document.querySelectorAll(".category-pill").forEach(pill => {
      pill.classList.toggle("active", pill.dataset.category === category);
    });

    this.renderBuildingCards();
  }

  renderBuildingCards() {
    const container = document.getElementById("buildings-grid-container");
    if (!container) return;

    let filtered = this.buildings;

    if (this.selectedCategory !== "all") {
      filtered = filtered.filter(b => b.category.toLowerCase() === this.selectedCategory.toLowerCase());
    }

    if (this.searchQuery) {
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(this.searchQuery) ||
        (b.code && b.code.toLowerCase().includes(this.searchQuery)) ||
        b.description.toLowerCase().includes(this.searchQuery) ||
        b.category.toLowerCase().includes(this.searchQuery)
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="no-results-box">
          <i class="fa-solid fa-magnifying-glass"></i>
          <p>No campus buildings match your search query.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(b => {
      const amenitiesHtml = (b.amenities || []).slice(0, 3).map(a => `<span class="amenity-tag">${a}</span>`).join("");
      return `
        <div class="building-card" onclick="window.campusMapService.focusBuilding('${b.id}')">
          <div class="card-header">
            <div class="bldg-icon-wrap" style="background:${b.color || '#1E3A8A'}">
              <i class="fa-solid ${b.icon || 'fa-building'}"></i>
            </div>
            <div class="bldg-meta">
              <span class="bldg-code">${b.code || b.category}</span>
              <h4 class="bldg-name">${b.name}</h4>
            </div>
          </div>

          <p class="bldg-desc">${b.description}</p>

          <div class="bldg-amenities">
            ${amenitiesHtml}
          </div>

          <div class="bldg-footer">
            <span class="bldg-hours"><i class="fa-regular fa-clock"></i> ${b.hours ? b.hours.split('(')[0] : 'Open'}</span>
            <div class="bldg-actions" onclick="event.stopPropagation()">
              <button class="btn-card-action" title="View on map" onclick="window.campusMapService.focusBuilding('${b.id}')">
                <i class="fa-solid fa-map-pin"></i>
              </button>
              <button class="btn-card-action btn-primary-action" title="Find route here" onclick="window.campusApp.setRouteDestination('${b.id}')">
                <i class="fa-solid fa-diamond-turn-right"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join("");
  }
}

// Global UI instance
window.campusNavigationUI = new CampusNavigationUI();
