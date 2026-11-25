/**
 * Campus Saathi - Emergency SOS & Distress Alert System
 * Includes 2-step confirmation, Web Audio acoustic alarm synthesizer, GPS broadcast, and transparent demo mode notice.
 */

class EmergencySOSManager {
  constructor() {
    this.audioCtx = null;
    this.sirenOscillator = null;
    this.sirenGain = null;
    this.isSirenPlaying = false;
    this.sirenInterval = null;
    this.userGpsCoords = null;
    this.primaryNumber = "+91 11 2659 1000";
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Global SOS button triggers (navbar, floating mobile, dashboard)
    document.querySelectorAll(".btn-trigger-sos").forEach(btn => {
      btn.addEventListener("click", () => this.openSOSModal());
    });

    // Close buttons
    const closeBtn = document.getElementById("sos-modal-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeSOSModal());
    }

    // Confirmation triggers
    const confirmBtn = document.getElementById("btn-confirm-sos-activation");
    if (confirmBtn) {
      confirmBtn.addEventListener("click", () => this.activateSOSAlert());
    }

    const cancelBtn = document.getElementById("btn-cancel-sos");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => this.closeSOSModal());
    }

    // Audible Siren toggle
    const sirenBtn = document.getElementById("btn-toggle-siren");
    if (sirenBtn) {
      sirenBtn.addEventListener("click", () => this.toggleAudibleSiren());
    }

    // Share Location button
    const shareGpsBtn = document.getElementById("btn-share-gps");
    if (shareGpsBtn) {
      shareGpsBtn.addEventListener("click", () => this.handleShareGps());
    }
  }

  async openSOSModal() {
    const modal = document.getElementById("sos-emergency-modal");
    if (!modal) return;

    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");

    // Load active configurable security contact
    try {
      const contacts = await window.storageService.getContacts();
      const primary = contacts.find(c => c.isPrimary) || contacts[0];
      if (primary) {
        this.primaryNumber = primary.phone;
        const callLink = document.getElementById("sos-call-primary-btn");
        if (callLink) {
          callLink.href = `tel:${primary.phone.replace(/[^0-9+]/g, '')}`;
          callLink.innerHTML = `<i class="fa-solid fa-phone-volume"></i> CALL CAMPUS SECURITY (${primary.phone})`;
        }
      }
    } catch (e) {
      console.warn("Could not load dynamic security contact:", e);
    }

    // Reset to confirmation step
    document.getElementById("sos-step-confirmation").classList.remove("hidden");
    document.getElementById("sos-step-active").classList.add("hidden");
  }

  closeSOSModal() {
    const modal = document.getElementById("sos-emergency-modal");
    if (!modal) return;

    this.stopAudibleSiren();
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
  }

  activateSOSAlert() {
    document.getElementById("sos-step-confirmation").classList.add("hidden");
    document.getElementById("sos-step-active").classList.remove("hidden");

    // Automatically attempt to fetch GPS location for instant availability
    this.fetchGpsForSOS();

    // Log incident in local storage for student dashboard
    const sosLog = {
      id: "SOS-" + Date.now().toString(36).toUpperCase(),
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 16),
      type: "Emergency SOS Activated (Simulated)",
      status: "Triggered"
    };
    const prevLogs = JSON.parse(localStorage.getItem("cs_sos_logs") || "[]");
    prevLogs.unshift(sosLog);
    localStorage.setItem("cs_sos_logs", JSON.stringify(prevLogs));

    window.campusApp.showToast("Emergency Assistance Panel Active! Contacts and acoustic alarm ready.", "warning");
  }

  fetchGpsForSOS() {
    const gpsDisplay = document.getElementById("sos-gps-details");
    if (!gpsDisplay) return;

    gpsDisplay.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Acquiring high-precision GPS coordinates...`;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          this.userGpsCoords = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: Math.round(pos.coords.accuracy)
          };

          const mapsUrl = `https://www.google.com/maps?q=${this.userGpsCoords.lat},${this.userGpsCoords.lng}`;
          const cleanPhone = (this.primaryNumber || "+911126591000").replace(/[^0-9+]/g, '');
          const smsBody = encodeURIComponent(`EMERGENCY: I need immediate campus security assistance! My coordinates: ${this.userGpsCoords.lat.toFixed(5)}, ${this.userGpsCoords.lng.toFixed(5)} (±${this.userGpsCoords.accuracy}m). Map: ${mapsUrl}`);

          gpsDisplay.innerHTML = `
            <div class="gps-success-box">
              <p><strong><i class="fa-solid fa-location-crosshairs"></i> Coordinates:</strong> ${this.userGpsCoords.lat.toFixed(5)}° N, ${this.userGpsCoords.lng.toFixed(5)}° E (±${this.userGpsCoords.accuracy}m)</p>
              <div class="gps-share-actions">
                <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-xs">
                  <i class="fa-solid fa-map-location-dot"></i> View on Google Maps
                </a>
                <a href="sms:${cleanPhone}?body=${smsBody}" class="btn btn-primary btn-xs">
                  <i class="fa-solid fa-comment-sms"></i> Send SMS with GPS
                </a>
              </div>
            </div>
          `;
        },
        (err) => {
          // Graceful fallback to campus center
          const fallbackLat = CAMPUS_CONFIG.mapCenter[0];
          const fallbackLng = CAMPUS_CONFIG.mapCenter[1];
          const mapsUrl = `https://www.google.com/maps?q=${fallbackLat},${fallbackLng}`;

          gpsDisplay.innerHTML = `
            <div class="gps-warning-box">
              <p><i class="fa-solid fa-triangle-exclamation"></i> GPS permission was denied or unavailable (${err.message}). Campus Center coordinates applied: 28.5450° N, 77.1926° E.</p>
              <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-xs">
                <i class="fa-solid fa-map-location-dot"></i> Open Campus Map
              </a>
            </div>
          `;
        },
        { enableHighAccuracy: true, timeout: 6000 }
      );
    } else {
      gpsDisplay.innerHTML = `<p class="text-muted">Geolocation is not supported by your browser.</p>`;
    }
  }

  handleShareGps() {
    if (this.userGpsCoords) {
      const shareText = `CAMPUS SAATHI EMERGENCY SOS: Need assistance near ${this.userGpsCoords.lat.toFixed(5)}, ${this.userGpsCoords.lng.toFixed(5)} (±${this.userGpsCoords.accuracy}m).`;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(shareText);
        window.campusApp.showToast("Emergency coordinates copied to clipboard!", "success");
      }
    } else {
      this.fetchGpsForSOS();
    }
  }

  // ==========================================
  // Web Audio Synthesizer (Loud Pulsing Siren)
  // No external audio files needed!
  // ==========================================
  toggleAudibleSiren() {
    if (this.isSirenPlaying) {
      this.stopAudibleSiren();
    } else {
      this.startAudibleSiren();
    }
  }

  startAudibleSiren() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();

      this.sirenOscillator = this.audioCtx.createOscillator();
      this.sirenGain = this.audioCtx.createGain();

      this.sirenOscillator.type = "sawtooth";
      this.sirenOscillator.frequency.setValueAtTime(600, this.audioCtx.currentTime);

      this.sirenGain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      this.sirenOscillator.connect(this.sirenGain);
      this.sirenGain.connect(this.audioCtx.destination);

      this.sirenOscillator.start();
      this.isSirenPlaying = true;

      // Pulse frequency between 600Hz and 1000Hz every 350ms
      let high = false;
      this.sirenInterval = setInterval(() => {
        if (!this.audioCtx || !this.sirenOscillator) return;
        const targetFreq = high ? 650 : 980;
        this.sirenOscillator.frequency.setTargetAtTime(targetFreq, this.audioCtx.currentTime, 0.08);
        high = !high;
      }, 350);

      const sirenBtn = document.getElementById("btn-toggle-siren");
      if (sirenBtn) {
        sirenBtn.classList.add("siren-active");
        sirenBtn.innerHTML = `<i class="fa-solid fa-volume-xmark"></i> Stop Loud Siren`;
      }

      window.campusApp.showToast("Audible alarm siren is sounding!", "warning");

    } catch (e) {
      console.warn("Web Audio API error:", e);
      window.campusApp.showToast("Audio synthesizer not allowed by browser permissions.", "warning");
    }
  }

  stopAudibleSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }

    if (this.sirenOscillator) {
      try {
        this.sirenOscillator.stop();
        this.sirenOscillator.disconnect();
      } catch (e) {}
      this.sirenOscillator = null;
    }

    if (this.audioCtx && this.audioCtx.state !== "closed") {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }

    this.isSirenPlaying = false;

    const sirenBtn = document.getElementById("btn-toggle-siren");
    if (sirenBtn) {
      sirenBtn.classList.remove("siren-active");
      sirenBtn.innerHTML = `<i class="fa-solid fa-bullhorn"></i> Sound Audible Alarm Siren`;
    }
  }
}

// Global SOS instance
window.emergencySOSManager = new EmergencySOSManager();
