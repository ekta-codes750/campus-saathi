/**
 * Campus Saathi - Campus Safety Module
 * Verified security posts, well-lit pathways, emergency contacts, and infrastructure hazard reporting.
 */

class CampusSafetyManager {
  constructor() {
    this.reports = [];
    this.securityPoints = [];
    this.contacts = [];
    this.filterVerified = "all"; // 'all', 'verified', 'unverified'
    this.currentPhotoBase64 = null;
  }

  async init() {
    this.reports = await window.storageService.getSafetyReports();
    this.securityPoints = await window.storageService.getSecurityPoints();
    this.contacts = await window.storageService.getContacts();

    this.renderEmergencyContacts();
    this.renderSecurityKiosks();
    this.renderCommunityReports();
    this.populateReportLocationDropdown();
    this.bindEvents();
  }

  async populateReportLocationDropdown() {
    const sel = document.getElementById("safety-location-select");
    if (!sel) return;

    const buildings = await window.storageService.getBuildings();
    sel.innerHTML = `<option value="">Select Nearest Campus Building / Landmark...</option>`;
    
    buildings.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b.name;
      opt.textContent = `${b.name} (${b.category})`;
      sel.appendChild(opt);
    });

    // Add option for other/pathway
    const optOther = document.createElement("option");
    optOther.value = "Other Location";
    optOther.textContent = "📍 Other Location (Specify in description)";
    sel.appendChild(optOther);
  }

  bindEvents() {
    // Form submission
    const form = document.getElementById("report-hazard-form");
    if (form) {
      form.addEventListener("submit", (e) => this.handleReportSubmit(e));
    }

    // Photo input preview
    const fileInput = document.getElementById("hazard-photo-input");
    const previewContainer = document.getElementById("hazard-photo-preview");
    if (fileInput && previewContainer) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 5 * 1024 * 1024) {
            window.campusApp.showToast("File size exceeds 5MB limit. Please upload a smaller image.", "error");
            fileInput.value = "";
            return;
          }
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            this.currentPhotoBase64 = loadEvent.target.result;
            previewContainer.innerHTML = `
              <div class="photo-preview-box">
                <img src="${this.currentPhotoBase64}" alt="Hazard Preview">
                <button type="button" class="remove-photo-btn" onclick="window.campusSafetyManager.clearPhotoPreview()">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            `;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Reports filter buttons
    const filterButtons = document.querySelectorAll(".reports-filter-btn");
    filterButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        filterButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.filterVerified = btn.dataset.filter;
        this.renderCommunityReports();
      });
    });
  }

  clearPhotoPreview() {
    this.currentPhotoBase64 = null;
    const fileInput = document.getElementById("hazard-photo-input");
    const previewContainer = document.getElementById("hazard-photo-preview");
    if (fileInput) fileInput.value = "";
    if (previewContainer) previewContainer.innerHTML = "";
  }

  async handleReportSubmit(e) {
    e.preventDefault();

    const category = document.getElementById("hazard-category").value;
    const locationName = document.getElementById("safety-location-select").value;
    const severity = document.getElementById("hazard-severity").value;
    const description = document.getElementById("hazard-description").value.trim();
    const reporterType = document.getElementById("hazard-reporter-type").value;

    if (!category || !locationName || !description) {
      window.campusApp.showToast("Please fill in the category, location, and description.", "warning");
      return;
    }

    // Match coords if known building
    let coords = CAMPUS_CONFIG.mapCenter;
    const buildings = await window.storageService.getBuildings();
    const matchedBldg = buildings.find(b => b.name === locationName);
    if (matchedBldg) {
      coords = matchedBldg.coords;
    }

    const submitBtn = document.getElementById("btn-submit-hazard");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting Report...`;
    }

    try {
      const newReport = await window.storageService.submitSafetyReport({
        category,
        location: locationName,
        coords,
        severity,
        description,
        reportedBy: reporterType === "anonymous" ? "Student (Anonymous)" : "Registered Student",
        evidenceUrl: this.currentPhotoBase64,
        isVerified: false
      });

      window.campusApp.showToast(`Report filed successfully! Reference #${newReport.id}. Under campus safety review.`, "success");
      
      // Reset form
      document.getElementById("report-hazard-form").reset();
      this.clearPhotoPreview();

      // Refresh list and map
      this.reports = await window.storageService.getSafetyReports();
      this.renderCommunityReports();
      window.campusMapService.loadMapData();

    } catch (err) {
      window.campusApp.showToast("Failed to submit report. Please try again.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Submit Safety Report`;
      }
    }
  }

  renderEmergencyContacts() {
    const container = document.getElementById("emergency-contacts-grid");
    if (!container) return;

    container.innerHTML = this.contacts.map(c => `
      <div class="contact-card ${c.isPrimary ? 'primary-contact' : ''}">
        <div class="contact-card-top">
          <span class="contact-badge">${c.badge}</span>
          <i class="fa-solid fa-phone-volume contact-icon-bg"></i>
        </div>
        <h4 class="contact-name">${c.name}</h4>
        <p class="contact-role">${c.role}</p>
        <p class="contact-loc"><i class="fa-solid fa-location-dot"></i> ${c.location}</p>
        <div class="contact-call-action">
          <a href="tel:${c.phone.replace(/[^0-9+]/g, '')}" class="btn-call-direct">
            <i class="fa-solid fa-phone"></i> ${c.phone}
          </a>
        </div>
      </div>
    `).join("");
  }

  renderSecurityKiosks() {
    const container = document.getElementById("security-kiosks-grid");
    if (!container) return;

    container.innerHTML = this.securityPoints.map(sp => `
      <div class="kiosk-card">
        <div class="kiosk-icon">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        <div class="kiosk-info">
          <div class="kiosk-header">
            <h4>${sp.name}</h4>
            <span class="verified-tag"><i class="fa-solid fa-circle-check"></i> Verified</span>
          </div>
          <p class="kiosk-desc">${sp.description}</p>
          <div class="kiosk-footer">
            <span class="kiosk-type"><i class="fa-solid fa-layer-group"></i> ${sp.type}</span>
            <a href="tel:${sp.phone}" class="kiosk-phone-link"><i class="fa-solid fa-phone"></i> ${sp.phone}</a>
          </div>
        </div>
      </div>
    `).join("");
  }

  renderCommunityReports() {
    const container = document.getElementById("community-reports-list");
    if (!container) return;

    let filtered = this.reports;
    if (this.filterVerified === "verified") {
      filtered = filtered.filter(r => r.isVerified);
    } else if (this.filterVerified === "unverified") {
      filtered = filtered.filter(r => !r.isVerified);
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-reports-box">
          <i class="fa-solid fa-circle-check"></i>
          <p>No reports currently matching the filter.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(r => {
      const isVerified = r.isVerified;
      const verificationBadge = isVerified 
        ? `<span class="badge verified-tag"><i class="fa-solid fa-circle-check"></i> Verified by Security</span>`
        : `<span class="badge unverified-tag"><i class="fa-regular fa-clock"></i> Community Report (Pending Inspection)</span>`;

      let severityColor = "#2563EB";
      if (r.severity === "High" || r.severity === "Critical") severityColor = "#DC2626";
      else if (r.severity === "Medium") severityColor = "#D97706";

      const photoHtml = r.evidenceUrl 
        ? `<div class="report-photo-thumb" onclick="window.campusSafetyManager.viewFullImage('${r.evidenceUrl}')">
             <img src="${r.evidenceUrl}" alt="Hazard Proof">
             <span><i class="fa-solid fa-magnifying-glass-plus"></i> View Proof</span>
           </div>`
        : "";

      return `
        <div class="report-card ${isVerified ? 'verified-card' : 'unverified-card'}">
          <div class="report-card-header">
            <div>
              <span class="report-id">${r.id}</span>
              <h4 class="report-category">${r.category}</h4>
            </div>
            <div class="report-badges">
              <span class="severity-pill" style="border-color:${severityColor}; color:${severityColor};">
                ${r.severity} Severity
              </span>
              ${verificationBadge}
            </div>
          </div>

          <p class="report-desc">${r.description}</p>
          ${photoHtml}

          <div class="report-meta-row">
            <span><i class="fa-solid fa-location-dot"></i> ${r.location}</span>
            <span><i class="fa-regular fa-calendar"></i> ${r.reportedAt}</span>
            <span><i class="fa-solid fa-user-shield"></i> Status: <strong>${r.status}</strong></span>
          </div>
        </div>
      `;
    }).join("");
  }

  viewFullImage(dataUrl) {
    const modal = document.createElement("div");
    modal.className = "image-lightbox-modal";
    modal.innerHTML = `
      <div class="lightbox-content">
        <button class="lightbox-close" onclick="this.closest('.image-lightbox-modal').remove()">
          <i class="fa-solid fa-xmark"></i>
        </button>
        <img src="${dataUrl}" alt="Evidence Fullscreen">
      </div>
    `;
    document.body.appendChild(modal);
  }
}

// Global safety instance
window.campusSafetyManager = new CampusSafetyManager();
