/**
 * Campus Saathi - Anti-Ragging Support & Confidential Reporting Module
 * Slogan: "Find Your Way. Feel Safer. Speak Up."
 */

class AntiRaggingManager {
  constructor() {
    this.currentEvidenceBase64 = null;
  }

  init() {
    this.populateLocationSelect();
    this.bindEvents();
  }

  async populateLocationSelect() {
    const sel = document.getElementById("ar-location-select");
    if (!sel) return;

    const buildings = await window.storageService.getBuildings();
    sel.innerHTML = `<option value="">Select Campus Location where incident occurred...</option>`;
    
    buildings.forEach(b => {
      const opt = document.createElement("option");
      opt.value = b.name;
      opt.textContent = `${b.name} (${b.category})`;
      sel.appendChild(opt);
    });

    const optHostel = document.createElement("option");
    optHostel.value = "Student Hostels & Residential Area";
    optHostel.textContent = "🏢 Student Hostels / Residential Quarters";
    sel.appendChild(optHostel);

    const optOther = document.createElement("option");
    optOther.value = "Off-Campus / Transit Point";
    optOther.textContent = "🚌 Off-Campus / Transit / Bus Stop";
    sel.appendChild(optOther);
  }

  bindEvents() {
    // Anonymous toggle switch
    const anonToggle = document.getElementById("ar-anonymous-toggle");
    const studentInfoFields = document.getElementById("ar-student-info-fields");
    if (anonToggle && studentInfoFields) {
      anonToggle.addEventListener("change", (e) => {
        if (e.target.checked) {
          studentInfoFields.classList.add("hidden");
        } else {
          studentInfoFields.classList.remove("hidden");
        }
      });
    }

    // Form submission
    const form = document.getElementById("anti-ragging-form");
    if (form) {
      form.addEventListener("submit", (e) => this.handleComplaintSubmit(e));
    }

    // Evidence upload preview
    const fileInput = document.getElementById("ar-evidence-input");
    const previewContainer = document.getElementById("ar-evidence-preview");
    if (fileInput && previewContainer) {
      fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 8 * 1024 * 1024) {
            window.campusApp.showToast("File exceeds 8MB limit. Please upload a smaller file.", "error");
            fileInput.value = "";
            return;
          }
          const reader = new FileReader();
          reader.onload = (loadEvent) => {
            this.currentEvidenceBase64 = loadEvent.target.result;
            const isImage = file.type.startsWith("image/");
            previewContainer.innerHTML = `
              <div class="evidence-file-badge">
                <i class="fa-solid ${isImage ? 'fa-file-image' : 'fa-file-lines'}"></i>
                <span>${file.name} (${(file.size / 1024).toFixed(1)} KB)</span>
                <button type="button" class="remove-photo-btn" onclick="window.antiRaggingManager.clearEvidencePreview()">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </div>
            `;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    // Complaint status tracker lookup
    const trackBtn = document.getElementById("btn-track-complaint");
    if (trackBtn) {
      trackBtn.addEventListener("click", () => this.trackComplaintStatus());
    }
  }

  clearEvidencePreview() {
    this.currentEvidenceBase64 = null;
    const fileInput = document.getElementById("ar-evidence-input");
    const previewContainer = document.getElementById("ar-evidence-preview");
    if (fileInput) fileInput.value = "";
    if (previewContainer) previewContainer.innerHTML = "";
  }

  async handleComplaintSubmit(e) {
    e.preventDefault();

    const isAnonymous = document.getElementById("ar-anonymous-toggle") ? document.getElementById("ar-anonymous-toggle").checked : true;
    const category = document.getElementById("ar-category").value;
    const incidentDate = document.getElementById("ar-date").value;
    const location = document.getElementById("ar-location-select").value;
    const description = document.getElementById("ar-description").value.trim();
    const suspectDetails = document.getElementById("ar-suspects").value.trim();

    // Student identity details
    let complainantName = "Protected Identity (Anonymous)";
    let complainantRoll = "";
    let complainantContact = "Hidden";

    if (!isAnonymous) {
      complainantName = document.getElementById("ar-name").value.trim();
      complainantRoll = document.getElementById("ar-roll").value.trim();
      complainantContact = document.getElementById("ar-contact").value.trim();

      if (!complainantName || !complainantRoll || !complainantContact) {
        window.campusApp.showToast("Please provide your name, roll number, and contact details or choose Anonymous.", "warning");
        return;
      }
    }

    if (!category || !incidentDate || !location || !description) {
      window.campusApp.showToast("Please fill in the incident category, date, location, and description.", "warning");
      return;
    }

    const submitBtn = document.getElementById("btn-submit-complaint");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Submitting Statutory Complaint...`;
    }

    try {
      const complaint = await window.storageService.submitAntiRaggingReport({
        category,
        incidentDate,
        location,
        description,
        suspectDetails: suspectDetails || "Not specified",
        isAnonymous,
        complainantName,
        complainantRoll,
        complainantContact,
        evidenceUrl: this.currentEvidenceBase64
      });

      // Show confirmation dialog with tracking code
      this.showSubmissionModal(complaint);

      // Reset form
      document.getElementById("anti-ragging-form").reset();
      this.clearEvidencePreview();

    } catch (err) {
      window.campusApp.showToast("Error recording complaint. Please try again.", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="fa-solid fa-shield-halved"></i> File Confidential Complaint`;
      }
    }
  }

  showSubmissionModal(complaint) {
    const modal = document.createElement("div");
    modal.className = "complaint-success-modal";
    modal.innerHTML = `
      <div class="success-card">
        <div class="success-icon-wrap">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        <h3>Complaint Registered Confidentially</h3>
        <p>Your report has been forwarded to the <strong>Campus Anti-Ragging Flying Squad & Chief Proctor</strong>.</p>
        
        <div class="tracking-code-box">
          <span class="tracking-label">Official Tracking Reference Code</span>
          <div class="tracking-code-val">${complaint.id}</div>
          <button class="btn btn-outline btn-xs" onclick="navigator.clipboard.writeText('${complaint.id}'); window.campusApp.showToast('Tracking code copied!', 'success');">
            <i class="fa-solid fa-copy"></i> Copy Code
          </button>
        </div>

        <div class="privacy-reassurance">
          <p><i class="fa-solid fa-lock"></i> <strong>Statutory Confidentiality:</strong> ${complaint.isAnonymous ? 'Your anonymous identity is strictly preserved under UGC mandate.' : 'Your details are restricted solely to the Anti-Ragging Committee.'}</p>
        </div>

        <button class="btn btn-primary" onclick="this.closest('.complaint-success-modal').remove()">
          I Have Saved My Tracking Code
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  async trackComplaintStatus() {
    const input = document.getElementById("track-code-input");
    const resultBox = document.getElementById("track-result-box");
    if (!input || !resultBox) return;

    const code = input.value.trim().toUpperCase();
    if (!code) {
      window.campusApp.showToast("Please enter your tracking code (e.g. AR-2026-XXXX).", "warning");
      return;
    }

    resultBox.classList.remove("hidden");
    resultBox.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Checking confidential records...`;

    const reports = await window.storageService.getAntiRaggingReports();
    const target = reports.find(r => r.id.toUpperCase() === code);

    if (!target) {
      resultBox.innerHTML = `
        <div class="track-not-found">
          <i class="fa-solid fa-circle-exclamation"></i>
          <p>No complaint record found matching reference: <strong>${code}</strong>.</p>
          <small>Please verify your code format or contact the Chief Proctor's office directly.</small>
        </div>
      `;
      return;
    }

    let statusClass = "status-new";
    if (target.status === "Investigating") statusClass = "status-investigating";
    else if (target.status === "Resolved" || target.status === "Action Taken") statusClass = "status-resolved";

    resultBox.innerHTML = `
      <div class="track-found-card">
        <div class="track-header">
          <div>
            <span class="track-code">${target.id}</span>
            <h4>${target.category}</h4>
          </div>
          <span class="status-pill ${statusClass}">${target.status}</span>
        </div>

        <div class="track-meta">
          <div><strong>Location:</strong> ${target.location}</div>
          <div><strong>Reported On:</strong> ${target.submittedAt}</div>
          <div><strong>Assigned Investigator:</strong> ${target.assignedOfficer || 'Under Allocation'}</div>
        </div>

        ${target.actionNotes ? `
          <div class="track-notes">
            <strong><i class="fa-solid fa-clipboard-check"></i> Committee Action Update:</strong>
            <p>${target.actionNotes}</p>
          </div>
        ` : `
          <div class="track-pending-msg">
            <i class="fa-solid fa-hourglass-half"></i> The Anti-Ragging Flying Squad has initiated preliminary inquiry. Updates will be reflected here.
          </div>
        `}
      </div>
    `;
  }
}

// Global anti-ragging instance
window.antiRaggingManager = new AntiRaggingManager();
