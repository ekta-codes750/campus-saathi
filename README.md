# Campus Saathi – Your campus, Your safety
> **"Find Your Way. Feel Safer. Speak Up."**

Campus Saathi is a modern, responsive, and functional smart campus navigation and student safety web platform built with HTML5, CSS3, vanilla JavaScript, Leaflet.js, and OpenStreetMap, with modular support for Firebase Authentication, Firestore, and Firebase Storage (plus an automatic zero-config LocalStorage demo mode).

---

## 🌟 Key Features

### 1. Design & Branding
- **Color Palette:** Navy Blue (`#0F172A`, `#1E3A8A`), Teal (`#0D9488`, `#14B8A6`), Pure White, and Light Grey/Slate (`#F8FAFC`).
- **Typography:** Plus Jakarta Sans for headings and Inter for crisp UI readability.
- **Micro-Interactions:** Pulsing SOS beacons, animated route lines, custom SVG map pins, and smooth transitions.
- **Full Responsiveness:** Optimized for desktops, tablets, and smartphones with mobile drawer navigation and floating action button.

### 2. Smart Campus Navigation (Leaflet.js & OpenStreetMap)
- **10 Core Campus Locations:**
  1. Academic Block (`ACAD-01`)
  2. Computer Science Block (`CS-02`)
  3. Engineering Block (`ENG-03`)
  4. Laboratories (`LAB-04`)
  5. Central Library (`LIB-05`)
  6. Auditorium (`AUD-06`)
  7. Administrative Block (`ADMIN-07`)
  8. Cafeteria (`CAF-08`)
  9. Main Gate (`GATE-01`)
  10. Parking Area (`PARK-01`)
- **Dijkstra Shortest-Path Algorithm:** Calculates true walking paths across campus nodes rather than arbitrary straight lines.
- **Turn-by-Turn Guidance:** Step-by-step walking instructions with distance in meters and walking time estimate at ~4.5 km/h.
- **Safe Path Priority:** Toggle "Prioritize Well-Lit Night Corridors" to route users through illuminated, CCTV-monitored boulevards.
- **GPS Locate Me:** Real browser Geolocation with graceful fallback and accuracy indication.

### 3. Campus Safety & Infrastructure
- **Verified Security Posts:** Manned guard posts, emergency help points, and one-touch telephone links.
- **Hazard Reporting:** Students can report broken streetlights, dark unlit corners, or damaged paths with severity, location, and photo upload.
- **Verified vs Unverified:** Clear badges distinguishing official security-inspected hazards from community reports.

### 4. Emergency SOS
- **Highly Visible Trigger:** Accessible in the sticky navbar, mobile floating button, and dashboard.
- **2-Step Confirmation:** Prevents accidental false alarms while keeping activation rapid.
- **Real Acoustic Siren Synthesizer:** Uses browser HTML5 Web Audio API to produce an audible pulsing distress alarm on the device to deter attackers.
- **Live GPS Sharing:** Generates exact latitude/longitude coordinates, Google Maps link, and SMS-ready alert.
- **Transparent Notice:** Clearly labels prototype/demo status to maintain honesty and student safety.

### 5. Anti-Ragging Support
- **Statutory UGC & Supreme Court Compliance:** Zero-tolerance anti-ragging portal.
- **Confidential & Anonymous Reporting:** Students can choose whether to disclose identity or submit anonymously.
- **Tracking Reference Code:** Generates unique tracking code (e.g., `AR-2026-XXXX`) so students can check investigation status privately.
- **Authorized Squad Contacts:** Direct contact details for the Chief Proctor, Dean of Student Welfare, and National Helpline (`1800-180-5522`).

### 6. Student Dashboard
- Personalized greeting, quick navigation shortcuts, official university announcements, and recent activity logs.

### 7. Protected Admin Dashboard
- **Authentication:** Role-based access with one-click Demo Admin login (`admin@campussaathi.edu` / `admin123`).
- **Building Management (CRUD):** Add, edit, or delete buildings and update GPS coordinates.
- **Security & Well-Lit Paths Management:** Add, edit, and toggle security kiosks, SOS booths, and illuminated night corridors.
- **Emergency Directory Management:** Update university emergency hotlines and configure the primary SOS contact.
- **Campus Coordinates & Settings:** Replace demonstration coordinates with actual university coordinates, map center, and zoom.
- **Firebase Live / Demo Mode Configuration:** In-app interface to connect custom Firebase project API keys or toggle offline demo mode.
- **Hazard Verification:** Toggle "Verified" status on student reports and set resolution stage (`New`, `Investigating`, `Resolved`).
- **Confidential Anti-Ragging Docket Review:** Review whistleblower accounts, update stages, and log proctorial action notes.
- **Export & Reset:** Export all campus data to JSON or restore default factory settings with one click.

---

## 🚀 Quick Start / Local Testing

No build tools or Node.js packages required! You can open `index.html` directly in any modern browser:

1. **Double-click `index.html`** in File Explorer, OR
2. **Run a local development server:**
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Or using Node http-server
   npx http-server -p 8000
   ```
3. Open `http://localhost:8000` in your browser.

---

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Campus Admin** | `admin@campussaathi.edu` | `admin123` |
| **Student** | Any valid student email | Any password &ge; 4 chars |

*(A "Quick Login as Demo Admin" one-click button is also provided on the Admin page).*

---

## ⚙️ Connecting Live Firebase (Optional)

To connect your own Google Firebase backend:
1. Create a project at [Firebase Console](https://console.firebase.google.com).
2. Enable **Authentication** (Email/Password), **Cloud Firestore**, and **Firebase Storage**.
3. Open `js/firebase-service.js` and replace `FIREBASE_CONFIG` with your project's credentials.
4. Campus Saathi will automatically detect your keys and connect to the live backend.
