/**
 * Campus Saathi - Leaflet Map & Routing Engine
 * High-performance campus navigation, marker clustering, safe paths, and Dijkstra routing.
 */

class CampusMapService {
  constructor() {
    this.map = null;
    this.buildings = [];
    this.securityPoints = [];
    this.wellLitPathways = [];
    this.safetyReports = [];
    
    // Layers
    this.buildingsLayer = null;
    this.securityLayer = null;
    this.wellLitLayer = null;
    this.safetyReportsLayer = null;
    this.routeLayer = null;
    this.userLocationMarker = null;

    // Routing Graph Cache
    this.nodes = CAMPUS_CONFIG.routingNodes;
    this.edges = CAMPUS_CONFIG.routingEdges;
    this.buildingNodeMap = CAMPUS_CONFIG.buildingNodeMap;

    this.activeRoute = null;
  }

  async initMap(containerId = "campus-map") {
    if (this.map) {
      this.map.remove();
    }

    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Map container #${containerId} not found`);
      return;
    }

    // Load custom campus center if configured
    const settings = await window.storageService.getCampusSettings();
    const center = settings && settings.mapCenter ? settings.mapCenter : CAMPUS_CONFIG.mapCenter;
    const zoom = settings && settings.defaultZoom ? settings.defaultZoom : CAMPUS_CONFIG.defaultZoom;

    // Initialize Leaflet map
    this.map = L.map(containerId, {
      center: center,
      zoom: zoom,
      minZoom: CAMPUS_CONFIG.minZoom,
      maxZoom: CAMPUS_CONFIG.maxZoom,
      zoomControl: false
    });

    // Add custom zoom control top right
    L.control.zoom({ position: "topright" }).addTo(this.map);

    // OpenStreetMap standard tile layer with attribution
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Campus Saathi',
      maxZoom: 19
    }).addTo(this.map);

    // Initialize feature groups
    this.buildingsLayer = L.layerGroup().addTo(this.map);
    this.securityLayer = L.layerGroup().addTo(this.map);
    this.wellLitLayer = L.layerGroup().addTo(this.map);
    this.safetyReportsLayer = L.layerGroup().addTo(this.map);
    this.routeLayer = L.layerGroup().addTo(this.map);

    // Render static and saved data
    this.loadMapData();

    // Map click handler
    this.map.on("click", (e) => {
      window.dispatchEvent(new CustomEvent("campus-map-click", { detail: e.latlng }));
    });

    console.log("🗺️ Leaflet Campus Map initialized successfully");
  }

  async loadMapData() {
    this.buildings = await window.storageService.getBuildings();
    this.securityPoints = await window.storageService.getSecurityPoints();
    this.safetyReports = await window.storageService.getSafetyReports();
    this.wellLitPathways = await window.storageService.getWellLitPathways();

    this.renderBuildings();
    this.renderSecurityPoints();
    this.renderWellLitPathways();
    this.renderSafetyReports();
  }

  // Custom SVG Markers
  createBuildingMarkerIcon(building) {
    const iconClass = building.icon || "fa-building";
    const color = building.color || "#1E3A8A";
    
    return L.divIcon({
      className: "custom-map-pin-container",
      html: `
        <div class="custom-building-pin" style="--pin-color: ${color};" title="${building.name}">
          <i class="fa-solid ${iconClass}"></i>
          <span class="pin-badge">${building.code || ""}</span>
        </div>
      `,
      iconSize: [38, 44],
      iconAnchor: [19, 42],
      popupAnchor: [0, -38]
    });
  }

  createSecurityMarkerIcon(point) {
    return L.divIcon({
      className: "custom-map-pin-container",
      html: `
        <div class="custom-security-pin" title="${point.name}">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
      `,
      iconSize: [34, 38],
      iconAnchor: [17, 36],
      popupAnchor: [0, -34]
    });
  }

  createHazardMarkerIcon(report) {
    const isVerified = report.isVerified;
    const color = isVerified ? "#DC2626" : "#F59E0B";
    return L.divIcon({
      className: "custom-map-pin-container",
      html: `
        <div class="custom-hazard-pin" style="background:${color};" title="${report.category}">
          <i class="fa-solid fa-triangle-exclamation"></i>
        </div>
      `,
      iconSize: [28, 32],
      iconAnchor: [14, 30],
      popupAnchor: [0, -28]
    });
  }

  // Render Buildings
  renderBuildings() {
    this.buildingsLayer.clearLayers();

    this.buildings.forEach(b => {
      const marker = L.marker(b.coords, {
        icon: this.createBuildingMarkerIcon(b),
        title: b.name
      });

      const popupContent = `
        <div class="campus-map-popup">
          <div class="popup-header" style="border-left: 4px solid ${b.color || '#1E3A8A'}">
            <h4>${b.name}</h4>
            <span class="popup-badge">${b.category}</span>
          </div>
          <p class="popup-desc">${b.description}</p>
          <div class="popup-meta">
            <div><i class="fa-regular fa-clock"></i> ${b.hours || '08:00 AM - 08:00 PM'}</div>
            <div><i class="fa-solid fa-wheelchair"></i> ${b.accessible ? 'Accessible' : 'Standard'}</div>
          </div>
          <div class="popup-actions">
            <button class="popup-btn btn-route" onclick="window.campusApp.setRouteStart('${b.id}')" title="Set as Starting Point">
              <i class="fa-solid fa-location-dot"></i> Start
            </button>
            <button class="popup-btn btn-route" onclick="window.campusApp.setRouteDestination('${b.id}')" title="Set as Destination">
              <i class="fa-solid fa-flag-checkered"></i> Destination
            </button>
            <button class="popup-btn btn-info" onclick="window.campusApp.openBuildingModal('${b.id}')" title="Building Details">
              <i class="fa-solid fa-circle-info"></i> Info
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300, className: "cs-leaflet-popup" });
      this.buildingsLayer.addLayer(marker);
    });
  }

  // Render Security Points
  renderSecurityPoints() {
    this.securityLayer.clearLayers();

    this.securityPoints.forEach(sp => {
      const marker = L.marker(sp.coords, {
        icon: this.createSecurityMarkerIcon(sp),
        title: sp.name
      });

      const popupContent = `
        <div class="campus-map-popup security-popup">
          <div class="popup-header">
            <h4 style="color:#0D9488"><i class="fa-solid fa-shield-halved"></i> ${sp.name}</h4>
            <span class="popup-badge verified-badge"><i class="fa-solid fa-circle-check"></i> Verified Security</span>
          </div>
          <p class="popup-desc">${sp.description}</p>
          <div class="popup-meta">
            <div><i class="fa-solid fa-phone"></i> <strong>${sp.phone}</strong></div>
            <div><i class="fa-solid fa-bullhorn"></i> ${sp.type}</div>
          </div>
          <div class="popup-actions">
            <a href="tel:${sp.phone}" class="popup-btn btn-call">
              <i class="fa-solid fa-phone"></i> Call Post
            </a>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300, className: "cs-leaflet-popup" });
      this.securityLayer.addLayer(marker);
    });
  }

  // Render Well-Lit Pathways
  renderWellLitPathways() {
    this.wellLitLayer.clearLayers();

    this.wellLitPathways.forEach(wlp => {
      // Glow background line
      const glowPolyline = L.polyline(wlp.coords, {
        color: "#14B8A6",
        weight: 8,
        opacity: 0.35,
        lineCap: "round"
      });

      // Core crisp line
      const polyline = L.polyline(wlp.coords, {
        color: "#0D9488",
        weight: 4,
        opacity: 0.9,
        dashArray: "6, 8",
        lineCap: "round"
      });

      polyline.bindTooltip(`
        <strong>${wlp.name}</strong><br>
        <span style="color:#0D9488">★ Well-Lit Night Corridor (Safety ${wlp.safetyScore}%)</span>
      `, { sticky: true });

      this.wellLitLayer.addLayer(glowPolyline);
      this.wellLitLayer.addLayer(polyline);
    });
  }

  // Render Safety Reports (Unverified vs Verified)
  renderSafetyReports() {
    this.safetyReportsLayer.clearLayers();

    this.safetyReports.forEach(rep => {
      if (!rep.coords) return;
      const marker = L.marker(rep.coords, {
        icon: this.createHazardMarkerIcon(rep)
      });

      const badgeHtml = rep.isVerified 
        ? `<span class="popup-badge" style="background:#FEE2E2;color:#991B1B;"><i class="fa-solid fa-check-double"></i> Verified Hazard</span>`
        : `<span class="popup-badge" style="background:#FEF3C7;color:#92400E;"><i class="fa-solid fa-clock"></i> Community Report (Pending Verification)</span>`;

      marker.bindPopup(`
        <div class="campus-map-popup">
          <div class="popup-header">
            <h4><i class="fa-solid fa-triangle-exclamation" style="color:#DC2626"></i> ${rep.category}</h4>
            ${badgeHtml}
          </div>
          <p class="popup-desc">${rep.description}</p>
          <div class="popup-meta">
            <div><i class="fa-solid fa-location-dot"></i> ${rep.location}</div>
            <div><i class="fa-regular fa-clock"></i> Reported: ${rep.reportedAt}</div>
            <div><strong>Status:</strong> ${rep.status}</div>
          </div>
        </div>
      `, { maxWidth: 280 });

      this.safetyReportsLayer.addLayer(marker);
    });
  }

  // Toggle Visibility of Layers
  toggleLayer(layerName, show) {
    const layer = this[layerName + "Layer"];
    if (!layer || !this.map) return;
    if (show) {
      if (!this.map.hasLayer(layer)) this.map.addLayer(layer);
    } else {
      if (this.map.hasLayer(layer)) this.map.removeLayer(layer);
    }
  }

  // Locate User GPS
  locateUser() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser."));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const accuracy = pos.coords.accuracy;

          if (this.userLocationMarker) {
            this.map.removeLayer(this.userLocationMarker);
          }

          // User pulsing blue dot marker
          const userIcon = L.divIcon({
            className: "user-gps-pulse-container",
            html: `
              <div class="user-gps-pulse"></div>
              <div class="user-gps-dot"></div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12]
          });

          this.userLocationMarker = L.marker([lat, lng], { icon: userIcon }).addTo(this.map);
          this.userLocationMarker.bindPopup(`<strong>Your Current Location</strong><br><small>GPS Accuracy: ±${Math.round(accuracy)}m</small>`).openPopup();
          
          this.map.setView([lat, lng], 17);
          resolve({ lat, lng, accuracy });
        },
        (err) => {
          // Graceful fallback to campus Main Gate
          console.warn("GPS lookup denied or unavailable:", err.message);
          resolve({
            lat: CAMPUS_CONFIG.mapCenter[0],
            lng: CAMPUS_CONFIG.mapCenter[1],
            isFallback: true,
            error: err.message
          });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    });
  }

  // Fly to Building
  focusBuilding(buildingId) {
    const b = this.buildings.find(item => item.id === buildingId);
    if (b && this.map) {
      this.map.flyTo(b.coords, 18, { animate: true, duration: 1.2 });
      // Find marker and open popup
      this.buildingsLayer.eachLayer(layer => {
        if (layer.getLatLng && layer.getLatLng().lat === b.coords[0] && layer.getLatLng().lng === b.coords[1]) {
          layer.openPopup();
        }
      });
    }
  }

  // ==========================================
  // Campus Routing: Dijkstra Shortest Path
  // ==========================================
  findNearestNode(lat, lng) {
    let nearestNode = null;
    let minDistance = Infinity;

    for (const [nodeKey, coords] of Object.entries(this.nodes)) {
      const d = Math.hypot(coords[0] - lat, coords[1] - lng);
      if (d < minDistance) {
        minDistance = d;
        nearestNode = nodeKey;
      }
    }
    return nearestNode;
  }

  calculateRoute(startBuildingId, endBuildingId, preferWellLit = true) {
    let startNode = this.buildingNodeMap[startBuildingId];
    let endNode = this.buildingNodeMap[endBuildingId];

    // Fallback if building is custom
    if (!startNode) {
      const b = this.buildings.find(x => x.id === startBuildingId);
      if (b) startNode = this.findNearestNode(b.coords[0], b.coords[1]);
    }
    if (!endNode) {
      const b = this.buildings.find(x => x.id === endBuildingId);
      if (b) endNode = this.findNearestNode(b.coords[0], b.coords[1]);
    }

    if (!startNode || !endNode) {
      return { error: "Unable to find navigation waypoints for selected campus locations." };
    }

    if (startNode === endNode) {
      return { error: "Start and destination are the exact same campus building." };
    }

    // Build Graph Adjacency List
    const graph = {};
    for (const nodeKey of Object.keys(this.nodes)) {
      graph[nodeKey] = [];
    }

    this.edges.forEach(edge => {
      let weight = edge.distance;
      // If preferWellLit is true, penalize unlit paths by 2x weight so safe routes win
      if (preferWellLit && !edge.wellLit) {
        weight = weight * 2.2;
      }

      graph[edge.from].push({ to: edge.to, distance: edge.distance, weight, wellLit: edge.wellLit, desc: edge.desc });
      graph[edge.to].push({ to: edge.from, distance: edge.distance, weight, wellLit: edge.wellLit, desc: edge.desc });
    });

    // Dijkstra's Algorithm
    const distances = {};
    const previous = {};
    const unvisited = new Set();

    for (const nodeKey of Object.keys(this.nodes)) {
      distances[nodeKey] = Infinity;
      previous[nodeKey] = null;
      unvisited.add(nodeKey);
    }
    distances[startNode] = 0;

    while (unvisited.size > 0) {
      // Find smallest distance unvisited node
      let closestNode = null;
      let minDis = Infinity;
      for (const node of unvisited) {
        if (distances[node] < minDis) {
          minDis = distances[node];
          closestNode = node;
        }
      }

      if (!closestNode || distances[closestNode] === Infinity) {
        break; // No path reachable
      }

      if (closestNode === endNode) {
        break; // Reached target
      }

      unvisited.delete(closestNode);

      for (const neighbor of graph[closestNode]) {
        if (unvisited.has(neighbor.to)) {
          const alt = distances[closestNode] + neighbor.weight;
          if (alt < distances[neighbor.to]) {
            distances[neighbor.to] = alt;
            previous[neighbor.to] = { node: closestNode, edge: neighbor };
          }
        }
      }
    }

    // Reconstruct Path
    const pathNodes = [];
    let curr = endNode;
    const steps = [];
    let totalRealDistance = 0;
    let wellLitStepsCount = 0;

    while (curr && curr !== startNode) {
      pathNodes.unshift(curr);
      const prevInfo = previous[curr];
      if (!prevInfo) break;
      totalRealDistance += prevInfo.edge.distance;
      if (prevInfo.edge.wellLit) wellLitStepsCount++;
      steps.unshift({
        instruction: prevInfo.edge.desc || `Walk towards next landmark`,
        distance: prevInfo.edge.distance,
        wellLit: prevInfo.edge.wellLit
      });
      curr = prevInfo.node;
    }

    if (curr === startNode) {
      pathNodes.unshift(startNode);
    } else {
      return { error: "No walking pathway connected between these two locations." };
    }

    // Coordinates array for polyline
    const routeCoords = pathNodes.map(n => this.nodes[n]);

    // Walking speed: ~75 meters/min (4.5 km/h standard campus walking)
    const timeMinutes = Math.max(1, Math.round(totalRealDistance / 75));
    const safetyScore = Math.round((wellLitStepsCount / Math.max(1, steps.length)) * 100);

    const startBldg = this.buildings.find(b => b.id === startBuildingId);
    const endBldg = this.buildings.find(b => b.id === endBuildingId);

    const result = {
      startBuilding: startBldg || { name: "Starting Point" },
      endBuilding: endBldg || { name: "Destination" },
      nodes: pathNodes,
      coordinates: routeCoords,
      totalDistanceMeters: totalRealDistance,
      totalTimeMinutes: timeMinutes,
      steps: steps,
      safetyScore: Math.max(70, safetyScore),
      isWellLitPreferred: preferWellLit
    };

    this.activeRoute = result;
    this.drawRoute(result);
    return result;
  }

  drawRoute(route) {
    this.routeLayer.clearLayers();

    // Route Outer Border
    const outerLine = L.polyline(route.coordinates, {
      color: "#0F172A",
      weight: 8,
      opacity: 0.7,
      lineCap: "round"
    });

    // Route Inner Active Path (Teal/Navy)
    const innerLine = L.polyline(route.coordinates, {
      color: "#14B8A6",
      weight: 5,
      opacity: 1,
      dashArray: "10, 8",
      lineCap: "round",
      className: "animated-route-line"
    });

    // Start Marker (Green beacon)
    const startIcon = L.divIcon({
      className: "custom-map-pin-container",
      html: `<div class="route-endpoint-pin start-pin"><i class="fa-solid fa-person-walking"></i></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    const startMarker = L.marker(route.coordinates[0], { icon: startIcon }).bindPopup(`<strong>Start: ${route.startBuilding.name}</strong>`);

    // End Marker (Red Flag)
    const endIcon = L.divIcon({
      className: "custom-map-pin-container",
      html: `<div class="route-endpoint-pin end-pin"><i class="fa-solid fa-flag-checkered"></i></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    const endMarker = L.marker(route.coordinates[route.coordinates.length - 1], { icon: endIcon }).bindPopup(`<strong>Destination: ${route.endBuilding.name}</strong>`);

    this.routeLayer.addLayer(outerLine);
    this.routeLayer.addLayer(innerLine);
    this.routeLayer.addLayer(startMarker);
    this.routeLayer.addLayer(endMarker);

    // Zoom and pan to fit entire route smoothly
    this.map.fitBounds(innerLine.getBounds(), { padding: [50, 50], animate: true, duration: 1 });
  }

  clearRoute() {
    this.routeLayer.clearLayers();
    this.activeRoute = null;
  }
}

// Global Map Service instance
window.campusMapService = new CampusMapService();
