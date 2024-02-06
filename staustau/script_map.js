// Initialize the map
var map = L.map("map", {
  // zoomControl: false, // disables the zoom control buttons
  // scrollWheelZoom: false, // disables zooming with the scroll wheel
  // doubleClickZoom: false, // disables zooming with a double click
  // touchZoom: false, // disables pinch-zooming on touch devices
  // boxZoom: false, // disables zooming to a specific area selected using the shift key
  // keyboard: false, // disables zooming using the + and - keys
  // dragging: false, // disables moving the map by dragging
  // tap: false, // disables tap interaction on touch devices
}).setView([51.3356, 7.864], 14);

// Add OpenStreetMap as the base map layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
var greenIcon = new L.Icon({
  iconUrl: "assets/marker-icon-2x-blue.png",
  // shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
var blueIcon = new L.Icon({
  iconUrl: "assets/marker-icon-2x-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
var purpleIcon = new L.Icon({
  iconUrl: "assets/marker-icon-2x-orange.png",
  // shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Add markers for the coordinates
var hoehleMarker = L.marker([51.341209, 7.872643], { icon: blueIcon }).addTo(
  map
);

var krankenhausMarker = L.marker([51.326923, 7.867607], {
  icon: greenIcon,
}).addTo(map);

var schuleMarker = L.marker([51.327617, 7.852697], { icon: purpleIcon }).addTo(
  map
);
krankenhausMarker.bindPopup("Krankenhaus");
hoehleMarker.bindPopup("Höhle");
schuleMarker.bindPopup("Schule");
