/**
 * Campus Saathi - Firebase & LocalStorage Unified Service Layer
 * Supports seamless switching between Live Firebase (Auth, Firestore, Storage)
 * and zero-dependency Offline/Demo mode via browser LocalStorage.
 */

const FIREBASE_CONFIG = {
  apiKey: "DEMO_API_KEY_CAMPUS_SAATHI",
  authDomain: "campus-saathi.firebaseapp.com",
  projectId: "campus-saathi",
  storageBucket: "campus-saathi.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

class StorageBackend {
  constructor() {
    this.isFirebaseReady = false;
    this.auth = null;
    this.db = null;
    this.storage = null;
    this.currentUser = null;
    this.init();
  }

  init() {
    const isRealConfig = FIREBASE_CONFIG.apiKey && !FIREBASE_CONFIG.apiKey.startsWith("DEMO_");
    if (typeof firebase !== "undefined" && isRealConfig) {
      try {
        firebase.initializeApp(FIREBASE_CONFIG);
        this.auth = firebase.auth();
        this.db = firebase.firestore();
        this.storage = firebase.storage();
        this.isFirebaseReady = true;
        console.log("🔥 Campus Saathi: Connected to Live Firebase Backend");
      } catch (err) {
        console.warn("⚠️ Firebase initialization failed, falling back to Local Demo Mode:", err);
        this.isFirebaseReady = false;
      }
    } else {
      console.log("ℹ️ Campus Saathi: Operating in Interactive Demo Mode (Local Storage & Mock Services)");
      this.initLocalStorageDefaults();
    }

    const storedUser = localStorage.getItem("cs_session_user");
    if (storedUser) {
      try {
        this.currentUser = JSON.parse(storedUser);
      } catch (e) {
        this.currentUser = null;
      }
    }
  }

  initLocalStorageDefaults() {
    if (!localStorage.getItem("cs_buildings")) {
      localStorage.setItem("cs_buildings", JSON.stringify(CAMPUS_CONFIG.buildings));
    }
    if (!localStorage.getItem("cs_safety_reports")) {
      localStorage.setItem("cs_safety_reports", JSON.stringify(CAMPUS_CONFIG.initialSafetyReports));
    }
    if (!localStorage.getItem("cs_antiragging_reports")) {
      localStorage.setItem("cs_antiragging_reports", JSON.stringify(CAMPUS_CONFIG.initialAntiRaggingReports));
    }
    if (!localStorage.getItem("cs_security_points")) {
      localStorage.setItem("cs_security_points", JSON.stringify(CAMPUS_CONFIG.securityPoints));
    }
    if (!localStorage.getItem("cs_contacts")) {
      localStorage.setItem("cs_contacts", JSON.stringify(CAMPUS_CONFIG.emergencyContacts));
    }
    if (!localStorage.getItem("cs_well_lit_pathways")) {
      localStorage.setItem("cs_well_lit_pathways", JSON.stringify(CAMPUS_CONFIG.wellLitPathways));
    }
    if (!localStorage.getItem("cs_campus_settings")) {
      localStorage.setItem("cs_campus_settings", JSON.stringify({
        campusName: CAMPUS_CONFIG.campusName,
        tagline: CAMPUS_CONFIG.tagline,
        slogan: CAMPUS_CONFIG.slogan,
        mapCenter: CAMPUS_CONFIG.mapCenter,
        defaultZoom: CAMPUS_CONFIG.defaultZoom
      }));
    }
  }

  resetAllData() {
    localStorage.removeItem("cs_buildings");
    localStorage.removeItem("cs_safety_reports");
    localStorage.removeItem("cs_antiragging_reports");
    localStorage.removeItem("cs_security_points");
    localStorage.removeItem("cs_contacts");
    localStorage.removeItem("cs_well_lit_pathways");
    localStorage.removeItem("cs_campus_settings");
    this.initLocalStorageDefaults();
  }

  // Auth Methods
  async login(email, password) {
    if (this.isFirebaseReady && this.auth) {
      try {
        const cred = await this.auth.signInWithEmailAndPassword(email, password);
        const isAdmin = email.toLowerCase().includes("admin");
        this.currentUser = {
          uid: cred.user.uid,
          email: cred.user.email,
          role: isAdmin ? "admin" : "student",
          displayName: cred.user.displayName || (isAdmin ? "Campus Administrator" : "Student")
        };
        localStorage.setItem("cs_session_user", JSON.stringify(this.currentUser));
        return { success: true, user: this.currentUser };
      } catch (error) {
        return { success: false, error: error.message };
      }
    } else {
      // Demo authentication
      // Admin: admin@campussaathi.edu / admin123
      // Student: student@campussaathi.edu / student123
      if (email.toLowerCase().includes("admin")) {
        if (password === "admin123" || password === "admin") {
          this.currentUser = {
            uid: "demo-admin-01",
            email: email,
            role: "admin",
            displayName: "Chief Campus Administrator",
            department: "Office of Safety & Student Affairs"
          };
          localStorage.setItem("cs_session_user", JSON.stringify(this.currentUser));
          return { success: true, user: this.currentUser };
        } else {
          return { success: false, error: "Invalid admin password. Default demo password is: admin123" };
        }
      } else {
        if (password.length >= 4) {
          this.currentUser = {
            uid: "demo-stud-" + Date.now().toString(36),
            email: email,
            role: "student",
            displayName: email.split("@")[0].toUpperCase() || "Campus Student",
            department: "Computer Science & Engineering"
          };
          localStorage.setItem("cs_session_user", JSON.stringify(this.currentUser));
          return { success: true, user: this.currentUser };
        } else {
          return { success: false, error: "Password must be at least 4 characters long." };
        }
      }
    }
  }

  async logout() {
    if (this.isFirebaseReady && this.auth) {
      await this.auth.signOut();
    }
    this.currentUser = null;
    localStorage.removeItem("cs_session_user");
    return true;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // Buildings Management
  async getBuildings() {
    if (this.isFirebaseReady && this.db) {
      try {
        const snapshot = await this.db.collection("buildings").get();
        if (!snapshot.empty) {
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
      } catch (err) {
        console.warn("Firestore fetch buildings failed, reading local:", err);
      }
    }
    const data = localStorage.getItem("cs_buildings");
    return data ? JSON.parse(data) : CAMPUS_CONFIG.buildings;
  }

  async saveBuilding(buildingData) {
    let buildings = await this.getBuildings();
    if (buildingData.id) {
      const idx = buildings.findIndex(b => b.id === buildingData.id);
      if (idx !== -1) {
        buildings[idx] = { ...buildings[idx], ...buildingData };
      } else {
        buildings.push(buildingData);
      }
    } else {
      buildingData.id = "bldg_" + Date.now();
      buildings.push(buildingData);
    }
    localStorage.setItem("cs_buildings", JSON.stringify(buildings));

    if (this.isFirebaseReady && this.db) {
      try {
        await this.db.collection("buildings").doc(buildingData.id).set(buildingData, { merge: true });
      } catch (e) {
        console.warn("Firestore save failed:", e);
      }
    }
    return buildingData;
  }

  async deleteBuilding(id) {
    let buildings = await this.getBuildings();
    buildings = buildings.filter(b => b.id !== id);
    localStorage.setItem("cs_buildings", JSON.stringify(buildings));

    if (this.isFirebaseReady && this.db) {
      try {
        await this.db.collection("buildings").doc(id).delete();
      } catch (e) {
        console.warn("Firestore delete failed:", e);
      }
    }
    return true;
  }

  // Safety Reports
  async getSafetyReports() {
    if (this.isFirebaseReady && this.db) {
      try {
        const snap = await this.db.collection("safety_reports").orderBy("reportedAt", "desc").get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (e) {
        console.warn("Firestore getSafetyReports fallback:", e);
      }
    }
    const data = localStorage.getItem("cs_safety_reports");
    return data ? JSON.parse(data) : CAMPUS_CONFIG.initialSafetyReports;
  }

  async submitSafetyReport(reportData) {
    const reports = await this.getSafetyReports();
    const newReport = {
      id: "REP-" + Math.floor(1000 + Math.random() * 9000),
      reportedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "New",
      isVerified: false,
      ...reportData
    };
    reports.unshift(newReport);
    localStorage.setItem("cs_safety_reports", JSON.stringify(reports));

    if (this.isFirebaseReady && this.db) {
      try {
        await this.db.collection("safety_reports").doc(newReport.id).set(newReport);
      } catch (e) {
        console.warn("Firestore report submission error:", e);
      }
    }
    return newReport;
  }

  async updateSafetyReportStatus(id, status, isVerified) {
    const reports = await this.getSafetyReports();
    const target = reports.find(r => r.id === id);
    if (target) {
      if (status !== undefined) target.status = status;
      if (isVerified !== undefined) target.isVerified = isVerified;
      localStorage.setItem("cs_safety_reports", JSON.stringify(reports));

      if (this.isFirebaseReady && this.db) {
        try {
          await this.db.collection("safety_reports").doc(id).update({
            status: target.status,
            isVerified: target.isVerified
          });
        } catch (e) {
          console.warn("Firestore update error:", e);
        }
      }
      return target;
    }
    return null;
  }

  // Anti-Ragging Reports
  async getAntiRaggingReports() {
    if (this.isFirebaseReady && this.db) {
      try {
        const snap = await this.db.collection("antiragging_reports").orderBy("submittedAt", "desc").get();
        if (!snap.empty) {
          return snap.docs.map(d => ({ id: d.id, ...d.data() }));
        }
      } catch (e) {
        console.warn("Firestore getAntiRagging fallback:", e);
      }
    }
    const data = localStorage.getItem("cs_antiragging_reports");
    return data ? JSON.parse(data) : CAMPUS_CONFIG.initialAntiRaggingReports;
  }

  async submitAntiRaggingReport(complaintData) {
    const list = await this.getAntiRaggingReports();
    const trackingCode = "AR-" + new Date().getFullYear() + "-" + Math.floor(1000 + Math.random() * 9000);
    const newComplaint = {
      id: trackingCode,
      submittedAt: new Date().toISOString().replace("T", " ").substring(0, 16),
      status: "New",
      assignedOfficer: "Pending Proctor Allocation",
      ...complaintData
    };
    list.unshift(newComplaint);
    localStorage.setItem("cs_antiragging_reports", JSON.stringify(list));

    if (this.isFirebaseReady && this.db) {
      try {
        await this.db.collection("antiragging_reports").doc(trackingCode).set(newComplaint);
      } catch (e) {
        console.warn("Firestore antiragging submit failed:", e);
      }
    }
    return newComplaint;
  }

  async updateAntiRaggingStatus(id, status, assignedOfficer, notes) {
    const list = await this.getAntiRaggingReports();
    const target = list.find(c => c.id === id);
    if (target) {
      if (status) target.status = status;
      if (assignedOfficer) target.assignedOfficer = assignedOfficer;
      if (notes) target.actionNotes = notes;
      localStorage.setItem("cs_antiragging_reports", JSON.stringify(list));

      if (this.isFirebaseReady && this.db) {
        try {
          await this.db.collection("antiragging_reports").doc(id).update({
            status: target.status,
            assignedOfficer: target.assignedOfficer,
            actionNotes: target.actionNotes || ""
          });
        } catch (e) {
          console.warn("Firestore update error:", e);
        }
      }
      return target;
    }
    return null;
  }

  // Emergency Contacts Management
  async getContacts() {
    const data = localStorage.getItem("cs_contacts");
    return data ? JSON.parse(data) : CAMPUS_CONFIG.emergencyContacts;
  }

  async saveContact(contact) {
    let contacts = await this.getContacts();
    if (contact.id) {
      const idx = contacts.findIndex(c => c.id === contact.id);
      if (idx !== -1) contacts[idx] = { ...contacts[idx], ...contact };
      else contacts.push(contact);
    } else {
      contact.id = "contact_" + Date.now();
      contacts.push(contact);
    }
    localStorage.setItem("cs_contacts", JSON.stringify(contacts));
    return contact;
  }

  async deleteContact(id) {
    let contacts = await this.getContacts();
    contacts = contacts.filter(c => c.id !== id);
    localStorage.setItem("cs_contacts", JSON.stringify(contacts));
    return true;
  }

  // Security Points
  async getSecurityPoints() {
    const data = localStorage.getItem("cs_security_points");
    return data ? JSON.parse(data) : CAMPUS_CONFIG.securityPoints;
  }

  async saveSecurityPoint(point) {
    let points = await this.getSecurityPoints();
    if (point.id) {
      const idx = points.findIndex(p => p.id === point.id);
      if (idx !== -1) points[idx] = { ...points[idx], ...point };
      else points.push(point);
    } else {
      point.id = "sp_" + Date.now();
      points.push(point);
    }
    localStorage.setItem("cs_security_points", JSON.stringify(points));
    return point;
  }

  async deleteSecurityPoint(id) {
    let points = await this.getSecurityPoints();
    points = points.filter(p => p.id !== id);
    localStorage.setItem("cs_security_points", JSON.stringify(points));
    return true;
  }

  // Well-Lit Pathways
  async getWellLitPathways() {
    const data = localStorage.getItem("cs_well_lit_pathways");
    return data ? JSON.parse(data) : CAMPUS_CONFIG.wellLitPathways;
  }

  async saveWellLitPathway(pathway) {
    let pathways = await this.getWellLitPathways();
    if (pathway.id) {
      const idx = pathways.findIndex(p => p.id === pathway.id);
      if (idx !== -1) pathways[idx] = { ...pathways[idx], ...pathway };
      else pathways.push(pathway);
    } else {
      pathway.id = "wlp_" + Date.now();
      pathways.push(pathway);
    }
    localStorage.setItem("cs_well_lit_pathways", JSON.stringify(pathways));
    return pathway;
  }

  async deleteWellLitPathway(id) {
    let pathways = await this.getWellLitPathways();
    pathways = pathways.filter(p => p.id !== id);
    localStorage.setItem("cs_well_lit_pathways", JSON.stringify(pathways));
    return true;
  }

  // Campus Settings & Coordinates
  async getCampusSettings() {
    const data = localStorage.getItem("cs_campus_settings");
    return data ? JSON.parse(data) : {
      campusName: CAMPUS_CONFIG.campusName,
      tagline: CAMPUS_CONFIG.tagline,
      slogan: CAMPUS_CONFIG.slogan,
      mapCenter: CAMPUS_CONFIG.mapCenter,
      defaultZoom: CAMPUS_CONFIG.defaultZoom
    };
  }

  async saveCampusSettings(settings) {
    const current = await this.getCampusSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem("cs_campus_settings", JSON.stringify(updated));
    return updated;
  }

  // Firebase Config & Mode
  getFirebaseConfig() {
    const saved = localStorage.getItem("cs_firebase_custom_config");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return FIREBASE_CONFIG;
  }

  saveFirebaseConfig(customConfig) {
    localStorage.setItem("cs_firebase_custom_config", JSON.stringify(customConfig));
  }

  // File Upload Helper (converts to Base64 data URL for local storage preview)
  async uploadFile(file) {
    if (this.isFirebaseReady && this.storage) {
      try {
        const ref = this.storage.ref().child(`evidence/${Date.now()}_${file.name}`);
        const snapshot = await ref.put(file);
        const downloadUrl = await snapshot.ref.getDownloadURL();
        return downloadUrl;
      } catch (e) {
        console.warn("Firebase Storage failed, falling back to base64 preview:", e);
      }
    }

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }
}

// Global instance
const storageService = new StorageBackend();
window.storageService = storageService;
