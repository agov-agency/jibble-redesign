import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// Soft "interface map" look: warm off-white land, pale blue water, light green parks, white roads.
const C = { land: "#f5f3ee", water: "#aad8ee", park: "#d3e9bd", wood: "#dcebc8", road: "#ffffff", casing: "#e1ddd3", label: "#6f6f6f", halo: "#f5f3ee" };

function restyle(map) {
  for (const l of map.getStyle().layers) {
    const id = l.id, set = (k, v) => map.setPaintProperty(id, k, v);
    try {
      if (id === "natural_earth" || id === "building-3d" || id.startsWith("poi") || id === "airport") map.setLayoutProperty(id, "visibility", "none");
      else if (id === "background") set("background-color", C.land);
      else if (id === "water") set("fill-color", C.water);
      else if (id.startsWith("waterway")) set("line-color", C.water);
      else if (id === "park" || id === "landcover_grass" || id === "landuse_pitch") set("fill-color", C.park);
      else if (id === "landcover_wood") set("fill-color", C.wood);
      else if (id === "park_outline" || id.startsWith("boundary")) map.setLayoutProperty(id, "visibility", "none");
      else if (id.startsWith("landuse_") || id.startsWith("landcover_") || id === "aeroway_fill") set("fill-color", C.land);
      else if (id === "building") set("fill-color", "#ebe8e0");
      else if (l.type === "line" && /casing/.test(id)) set("line-color", C.casing);
      else if (l.type === "line" && /^(road|bridge|tunnel)_(motorway|trunk|secondary|minor|link|street|service|path)/.test(id)) set("line-color", C.road);
      else if (l.type === "line" && /rail|aeroway/.test(id)) set("line-color", "#e6e3da");
      else if (l.type === "symbol") { set("text-color", C.label); set("text-halo-color", C.halo); set("text-halo-width", 1.5); }
    } catch { /* layer has no such property */ }
  }
  map.setPaintProperty("water_name_point_label", "text-color", "#5f9bb8");
}

const host = document.getElementById("map");
if (host) {
  const map = new maplibregl.Map({
    container: host, style: "https://tiles.openfreemap.org/styles/liberty", center: [-73.97, 40.72], zoom: 10, minZoom: 1.5, maxZoom: 18,
    attributionControl: { compact: true }, dragRotate: false, pitchWithRotate: false, touchPitch: false,
  });
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

  let markers = [], fitted = false, ready = false;
  const render = () => {
    if (!ready) return;
    const pins = window.__mapPins || [];
    const openId = markers.find(m => m.getPopup().isOpen())?.pinId;
    markers.forEach(m => m.remove()); markers = [];
    pins.forEach(p => {
      const btn = document.createElement("button");
      btn.type = "button"; btn.className = "map__pin"; btn.dataset.tone = p.tone; btn.setAttribute("aria-label", p.label);
      btn.innerHTML = `<span class="map__name"></span>`; btn.firstChild.textContent = p.name;
      const popup = new maplibregl.Popup({ className: "map__popup", offset: 22, maxWidth: "260px" }).setHTML(p.popup);
      popup.on("open", () => requestAnimationFrame(() => {
        const el = popup.getElement(); if (!el) return;
        const r = el.getBoundingClientRect(), h = host.getBoundingClientRect(), pad = 12;
        const dx = r.left < h.left + pad ? r.left - h.left - pad : r.right > h.right - pad ? r.right - h.right + pad : 0;
        const dy = r.top < h.top + pad ? r.top - h.top - pad : r.bottom > h.bottom - pad ? r.bottom - h.bottom + pad : 0;
        if (dx || dy) map.panBy([dx, dy], { duration: 250 });
      }));
      const m = new maplibregl.Marker({ element: btn })
        .setLngLat([p.lng, p.lat])
        .setPopup(popup)
        .addTo(map);
      m.pinId = p.id; markers.push(m);
      if (p.id === openId) m.togglePopup();
    });
    if (!fitted && pins.length) {
      fitted = true;
      const b = new maplibregl.LngLatBounds();
      pins.forEach(p => b.extend([p.lng, p.lat]));
      map.fitBounds(b, { padding: 70, maxZoom: 11, duration: 0 });
    }
  };
  map.on("load", () => { restyle(map); ready = true; render(); });
  window.addEventListener("jb-map-pins", render);
  new ResizeObserver(() => map.resize()).observe(host);
}
