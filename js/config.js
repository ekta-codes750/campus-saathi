/**
 * Campus Saathi - Configuration & Initial Data
 * Tagline: "Your campus, Your safety"
 * Slogan: "Find Your Way. Feel Safer. Speak Up."
 */

const CAMPUS_CONFIG = {
  campusName: "Campus Saathi University",
  shortName: "Campus Saathi",
  tagline: "Your campus, Your safety",
  slogan: "Find Your Way. Feel Safer. Speak Up.",
  
  // Default Campus Map Center (Lush University Campus Layout: 28.5450° N, 77.1926° E)
  mapCenter: [28.5450, 77.1926],
  defaultZoom: 16.5,
  minZoom: 14,
  maxZoom: 19,

  // Emergency Contacts
  emergencyContacts: [
    {
      id: "sec-control",
      name: "Main Campus Security Control Room",
      role: "24x7 Security & Emergency Dispatch",
      phone: "+91 11 2659 1000",
      altPhone: "100",
      location: "Main Gate, Security Headquarters",
      badge: "24x7 Active",
      isPrimary: true
    },
    {
      id: "women-cell",
      name: "Women's Safety & Internal Complaints Cell",
      role: "Confidential Student Support",
      phone: "+91 98765 43210",
      altPhone: "1091",
      location: "Administrative Block, Room 104",
      badge: "Immediate Assistance",
      isPrimary: true
    },
    {
      id: "medical-center",
      name: "Campus Health Center & Ambulance",
      role: "24x7 Medical Response",
      phone: "+91 11 2659 1100",
      altPhone: "102",
      location: "Near Engineering Block, Health Unit",
      badge: "Ambulance Ready",
      isPrimary: true
    },
    {
      id: "anti-ragging-national",
      name: "National Anti-Ragging Helpline (Toll Free)",
      role: "UGC Statutory Helpline",
      phone: "1800-180-5522",
      email: "helpline@antiragging.in",
      location: "National Portal / New Delhi",
      badge: "Toll-Free 24x7",
      isPrimary: false
    },
    {
      id: "campus-proctor",
      name: "Office of the Chief Proctor & Disciplinary Dean",
      role: "Campus Anti-Ragging Committee Head",
      phone: "+91 11 2659 1234",
      email: "proctor@campussaathi.edu",
      location: "Administrative Block, 2nd Floor",
      badge: "Disciplinary Authority",
      isPrimary: false
    },
    {
      id: "local-police",
      name: "Local Police Station (Jurisdiction Unit)",
      role: "Civil Emergency Police",
      phone: "112",
      location: "Outer Ring Road Sector Kiosk",
      badge: "Civil Police",
      isPrimary: false
    }
  ],

  // 10 Mandatory Demo Locations (Searchable, Editable, Categorized)
  buildings: [
    {
      id: "b1",
      name: "Academic Block",
      code: "ACAD-01",
      category: "Academic",
      coords: [28.5458, 77.1925],
      description: "Central academic complex housing lecture theatres, humanities faculties, and seminar halls.",
      hours: "08:00 AM - 08:00 PM",
      floors: 4,
      amenities: ["Wheelchair Ramp", "Elevator", "Restrooms", "Water Purifier", "Wi-Fi"],
      accessible: true,
      hasAED: true,
      icon: "fa-graduation-cap",
      color: "#1E3A8A"
    },
    {
      id: "b2",
      name: "Computer Science Block",
      code: "CS-02",
      category: "Academic",
      coords: [28.5467, 77.1932],
      description: "School of Computing, AI and Data Labs, Server Infrastructure, and Innovation Incubator.",
      hours: "08:00 AM - 10:00 PM (Labs 24x7 for Scholars)",
      floors: 5,
      amenities: ["High-speed LAN", "Server Room", "Ramps", "Coffee Kiosk", "Restrooms"],
      accessible: true,
      hasAED: true,
      icon: "fa-laptop-code",
      color: "#0D9488"
    },
    {
      id: "b3",
      name: "Engineering Block",
      code: "ENG-03",
      category: "Academic",
      coords: [28.5462, 77.1912],
      description: "Mechanical, Electrical, and Civil engineering departments with design workshops.",
      hours: "08:00 AM - 07:30 PM",
      floors: 4,
      amenities: ["Heavy Equipment Access", "First Aid Kit", "Elevators", "Hydration Stations"],
      accessible: true,
      hasAED: false,
      icon: "fa-cogs",
      color: "#2563EB"
    },
    {
      id: "b4",
      name: "Laboratories",
      code: "LAB-04",
      category: "Facilities",
      coords: [28.5471, 77.1918],
      description: "Advanced chemistry, physics, and bio-engineering experimental testing facilities.",
      hours: "08:30 AM - 06:30 PM",
      floors: 3,
      amenities: ["Safety Showers", "Eye Wash Stations", "Hazardous Waste Disposal", "First Aid"],
      accessible: true,
      hasAED: true,
      icon: "fa-flask",
      color: "#059669"
    },
    {
      id: "b5",
      name: "Central Library",
      code: "LIB-05",
      category: "Facilities",
      coords: [28.5448, 77.1938],
      description: "Four-story knowledge hub with 150,000+ volumes, reading halls, digital e-library and silent zones.",
      hours: "08:00 AM - 12:00 Midnight (Exam periods 24x7)",
      floors: 4,
      amenities: ["Quiet Reading Rooms", "E-Resource Center", "Braille Section", "Elevator", "Restrooms"],
      accessible: true,
      hasAED: true,
      icon: "fa-book-open",
      color: "#7C3AED"
    },
    {
      id: "b6",
      name: "Auditorium",
      code: "AUD-06",
      category: "Facilities",
      coords: [28.5442, 77.1919],
      description: "Grand Convocation Hall seating 1,800 guests, equipped for cultural festivals and academic symposiums.",
      hours: "Event Specific / 09:00 AM - 09:00 PM",
      floors: 2,
      amenities: ["Acoustic Soundproofing", "Emergency Fire Exits", "Wheelchair Seating", "Green Rooms"],
      accessible: true,
      hasAED: true,
      icon: "fa-landmark",
      color: "#EA580C"
    },
    {
      id: "b7",
      name: "Administrative Block",
      code: "ADMIN-07",
      category: "Administration",
      coords: [28.5438, 77.1932],
      description: "Vice Chancellor's Office, Registrar, Admissions, Anti-Ragging Cell, and Student Affairs Office.",
      hours: "09:00 AM - 05:30 PM (Mon-Fri)",
      floors: 3,
      amenities: ["Disciplinary Inquiry Room", "Inquiry Desk", "Ramps", "Student Help Counter"],
      accessible: true,
      hasAED: true,
      icon: "fa-building-columns",
      color: "#1E293B"
    },
    {
      id: "b8",
      name: "Cafeteria",
      code: "CAF-08",
      category: "Amenities",
      coords: [28.5452, 77.1915],
      description: "Central Student Food Court with multi-cuisine stalls, hygienic seating, and shaded outdoor garden.",
      hours: "07:30 AM - 10:30 PM Daily",
      floors: 1,
      amenities: ["Handwash Stations", "Dietary Options", "Covered Seating", "CCTV Monitoring"],
      accessible: true,
      hasAED: false,
      icon: "fa-utensils",
      color: "#D97706"
    },
    {
      id: "b9",
      name: "Main Gate",
      code: "GATE-01",
      category: "Access",
      coords: [28.5428, 77.1924],
      description: "Primary campus entrance with 24x7 security checkpoint, RFID boom barriers, and visitor registry.",
      hours: "24 Hours (Active Guard Patrol)",
      floors: 1,
      amenities: ["Security Kiosk", "Emergency Phone Booth", "Visitor Badging", "Night Floodlights"],
      accessible: true,
      hasAED: true,
      icon: "fa-shield-halved",
      color: "#DC2626"
    },
    {
      id: "b10",
      name: "Parking Area",
      code: "PARK-01",
      category: "Access",
      coords: [28.5431, 77.1938],
      description: "Designated faculty and student vehicle parking with EV charging stations and surveillance cameras.",
      hours: "24 Hours Monitored",
      floors: 1,
      amenities: ["EV Fast Chargers", "Emergency Call Pillar", "Solar Canopy Lights", "CCTV 360 Coverage"],
      accessible: true,
      hasAED: false,
      icon: "fa-square-parking",
      color: "#475569"
    }
  ],

  // Security and Help Points on Campus
  securityPoints: [
    {
      id: "sp1",
      name: "Main Security Kiosk 1",
      type: "Guard Post",
      coords: [28.5430, 77.1923],
      phone: "+91 11 2659 1001",
      description: "Manned 24x7 by two licensed security personnel with emergency vehicle access.",
      isVerified: true
    },
    {
      id: "sp2",
      name: "Library Security Post & Help Desk",
      type: "Help Point",
      coords: [28.5447, 77.1935],
      phone: "+91 11 2659 1002",
      description: "Night security officer stationed here until library close. First-aid equipped.",
      isVerified: true
    },
    {
      id: "sp3",
      name: "North Campus Patrol Booth (Near Labs)",
      type: "Guard Post",
      coords: [28.5469, 77.1921],
      phone: "+91 11 2659 1003",
      description: "Continuous surveillance overlooking laboratory corridor and back pathway.",
      isVerified: true
    },
    {
      id: "sp4",
      name: "Cafeteria Emergency Intercom Pillar",
      type: "SOS Call Box",
      coords: [28.5451, 77.1912],
      phone: "+91 11 2659 1004",
      description: "One-touch direct acoustic link to the Central Security Dispatch.",
      isVerified: true
    },
    {
      id: "sp5",
      name: "Admin Quadrangle Help Desk",
      type: "Help Point",
      coords: [28.5440, 77.1930],
      phone: "+91 11 2659 1005",
      description: "Student guidance and complaint intake desk during operational hours.",
      isVerified: true
    }
  ],

  // Designated Well-Lit Pathways (for Safe Route visualization)
  wellLitPathways: [
    {
      id: "wlp-1",
      name: "Central Academic Spine",
      description: "Fully illuminated boulevard with LED lamp posts every 15 meters and continuous CCTV coverage.",
      coords: [
        [28.5428, 77.1924], // Main Gate
        [28.5438, 77.1926], // Approaching Admin
        [28.5445, 77.1925], // Central Junction
        [28.5458, 77.1925], // Academic Block
        [28.5467, 77.1925]  // North Quad
      ],
      safetyScore: 98,
      isVerified: true
    },
    {
      id: "wlp-2",
      name: "Library & Admin Walkway",
      description: "High-visibility pedestrian plaza connecting Central Library, Administrative Wing, and Parking.",
      coords: [
        [28.5431, 77.1938], // Parking
        [28.5438, 77.1932], // Admin Block
        [28.5448, 77.1938], // Central Library
        [28.5458, 77.1935]  // Towards CS Block
      ],
      safetyScore: 95,
      isVerified: true
    },
    {
      id: "wlp-3",
      name: "Auditorium & Cafeteria Promenade",
      description: "Tree-lined, well-illuminated walkway with high evening student footfall and security patrols.",
      coords: [
        [28.5442, 77.1919], // Auditorium
        [28.5452, 77.1915], // Cafeteria
        [28.5462, 77.1912], // Engineering Block
        [28.5471, 77.1918]  // Labs
      ],
      safetyScore: 92,
      isVerified: true
    },
    {
      id: "wlp-4",
      name: "Cross-Campus Connecting Avenue",
      description: "Well-trafficked corridor linking East and West departments.",
      coords: [
        [28.5452, 77.1915], // Cafeteria
        [28.5458, 77.1925], // Academic Block
        [28.5467, 77.1932]  // CS Block
      ],
      safetyScore: 94,
      isVerified: true
    }
  ],

  // Walking Graph for Campus Routing (Waypoints and connected edges for realistic shortest paths)
  routingNodes: {
    "n_gate": [28.5428, 77.1924],       // Main Gate
    "n_park": [28.5431, 77.1938],       // Parking
    "n_admin_front": [28.5436, 77.1928],
    "n_admin": [28.5438, 77.1932],      // Admin Block
    "n_audi": [28.5442, 77.1919],       // Auditorium
    "n_spine_mid": [28.5445, 77.1925],  // Central cross junction
    "n_lib": [28.5448, 77.1938],        // Library
    "n_cafe": [28.5452, 77.1915],       // Cafeteria
    "n_acad": [28.5458, 77.1925],       // Academic Block
    "n_eng": [28.5462, 77.1912],        // Engineering Block
    "n_cs": [28.5467, 77.1932],         // CS Block
    "n_labs": [28.5471, 77.1918]        // Labs
  },

  // Building ID to Node Mapping
  buildingNodeMap: {
    "b9": "n_gate",
    "b10": "n_park",
    "b7": "n_admin",
    "b6": "n_audi",
    "b5": "n_lib",
    "b8": "n_cafe",
    "b1": "n_acad",
    "b3": "n_eng",
    "b2": "n_cs",
    "b4": "n_labs"
  },

  // Graph Adjacency with edge properties (wellLit, distanceMeters, description)
  routingEdges: [
    { from: "n_gate", to: "n_admin_front", distance: 95, wellLit: true, desc: "Follow the main entrance boulevard north" },
    { from: "n_gate", to: "n_park", distance: 130, wellLit: true, desc: "Take the right lane towards visitor parking" },
    { from: "n_park", to: "n_admin", distance: 90, wellLit: true, desc: "Walk along the administrative parking walkway" },
    { from: "n_admin_front", to: "n_admin", distance: 45, wellLit: true, desc: "Enter Administrative Block plaza" },
    { from: "n_admin_front", to: "n_audi", distance: 110, wellLit: true, desc: "Turn left towards Auditorium west entrance" },
    { from: "n_admin_front", to: "n_spine_mid", distance: 105, wellLit: true, desc: "Walk straight along the central shaded spine" },
    { from: "n_admin", to: "n_lib", distance: 120, wellLit: true, desc: "Walk northeast across the university lawn to Central Library" },
    { from: "n_spine_mid", to: "n_lib", distance: 130, wellLit: true, desc: "Head east along the library avenue" },
    { from: "n_spine_mid", to: "n_cafe", distance: 125, wellLit: true, desc: "Turn west towards Student Cafeteria square" },
    { from: "n_spine_mid", to: "n_acad", distance: 145, wellLit: true, desc: "Head north directly into the Academic Quadrangle" },
    { from: "n_audi", to: "n_cafe", distance: 115, wellLit: true, desc: "Walk north past the outdoor amphitheatre to Cafeteria" },
    { from: "n_cafe", to: "n_eng", distance: 110, wellLit: true, desc: "Walk northwest along Engineering corridor" },
    { from: "n_cafe", to: "n_acad", distance: 120, wellLit: true, desc: "Cross the lawn towards Academic Block entrance" },
    { from: "n_eng", to: "n_labs", distance: 115, wellLit: false, desc: "Follow North Engineering lane towards Laboratories" },
    { from: "n_acad", to: "n_labs", distance: 155, wellLit: true, desc: "Walk north past Lecture Hall complex to Laboratories" },
    { from: "n_acad", to: "n_cs", distance: 125, wellLit: true, desc: "Cross the tech promenade east to Computer Science Block" },
    { from: "n_lib", to: "n_cs", distance: 215, wellLit: true, desc: "Follow the lighted student pathway north to CS Block" }
  ],

  // Sample College Announcements
  announcements: [
    {
      id: "ann-1",
      title: "Night Escort Service Available from Central Library",
      category: "Safety",
      date: "2026-11-20",
      content: "Security personnel are available at the Central Library desk every night from 10:00 PM to 01:00 AM to escort students walking to their respective hostels or Main Gate.",
      priority: "high"
    },
    {
      id: "ann-2",
      title: "Zero Tolerance Anti-Ragging Drive 2026",
      category: "Anti-Ragging",
      date: "2026-11-15",
      content: "All students are reminded that ragging in any form is a non-bailable offense under statutory law. Report any suspicious conduct via Campus Saathi with 100% confidentiality guaranteed.",
      priority: "high"
    },
    {
      id: "ann-3",
      title: "New Solar Illumination Installed Near North Labs",
      category: "Infrastructure",
      date: "2026-11-10",
      content: "Six high-mast solar LED lights have been commissioned between the Engineering Block and Research Laboratories following recent student safety feedback.",
      priority: "medium"
    }
  ],

  // Initial Safety & Infrastructure Reports (Sample editable data)
  initialSafetyReports: [
    {
      id: "REP-101",
      category: "Broken Streetlight",
      location: "Near Engineering Block & Labs connecting lane",
      coords: [28.5466, 77.1915],
      severity: "Medium",
      description: "Street lamp #14 flickering continuously and goes dark after 8 PM.",
      reportedAt: "2026-11-21 19:45",
      status: "Investigating",
      reportedBy: "Student (Anonymous)",
      isVerified: true,
      evidenceUrl: null
    },
    {
      id: "REP-102",
      category: "Vegetation Overgrowth",
      location: "Behind Auditorium Back Exit",
      coords: [28.5440, 77.1916],
      severity: "Low",
      description: "Dense shrubs obstructing visibility on the corner path leading to cafeteria.",
      reportedAt: "2026-11-23 11:20",
      status: "Resolved",
      reportedBy: "Faculty Member",
      isVerified: true,
      evidenceUrl: null
    },
    {
      id: "REP-103",
      category: "Unlit Corner",
      location: "East corner of Parking Area",
      coords: [28.5432, 77.1942],
      severity: "High",
      description: "Complete dark zone near two-wheeler parking lot.",
      reportedAt: "2026-11-24 18:30",
      status: "New",
      reportedBy: "Hostel Student",
      isVerified: false,
      evidenceUrl: null
    }
  ],

  // Initial Anti-Ragging Reports (Confidential records for Admin)
  initialAntiRaggingReports: [
    {
      id: "AR-2026-001",
      category: "Verbal Harassment / Intimidation",
      location: "Outside Engineering Block Workshop",
      incidentDate: "2026-11-18 17:30",
      description: "A group of senior students demanding first-year students perform mock marching drills under threat of academic boycott.",
      suspectDetails: "3 students in 3rd year mechanical shirts",
      isAnonymous: true,
      complainantName: "Protected Identity",
      complainantContact: "Confidential",
      status: "Investigating",
      submittedAt: "2026-11-18 19:15",
      assignedOfficer: "Dr. K. Sharma (Proctorial Committee)"
    }
  ]
};

// Freeze default structure for deep clone protection
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CAMPUS_CONFIG;
}
