
    mapboxgl.accessToken = mapToken;
    const map = new mapboxgl.Map({
        container: 'map', // container ID
        style: "mapbox://styles/mapbox/streets-v12",
        center: listing.geometry.coordinates, // starting position [lng, lat]. Note that lat must be set between -90 and 90
        zoom: 11 // starting zoom
    });

    // const marker = new mapboxgl.Marker({ color: "red"})
    // .setLngLat(listing.geometry.coordinates)
    // .setPopup(new mapboxgl.Popup({offset: 25})
    // .setHTML(`<h4>${listing.title}</h4><p>Exact Location will be provided after booking</p>`))
    // .addTo(map);

    // Assuming mapToken and listing are defined and passed correctly to this JS file


// Create the default marker
const marker = new mapboxgl.Marker({ color: "red" })
    .setLngLat(listing.geometry.coordinates)
    .addTo(map);

// Create a popup
const popup = new mapboxgl.Popup({ offset: 25 })
    .setHTML(`<p>Exact location will be shared upon booking.</p>`);

// Show popup on mouse enter
marker.getElement().addEventListener('mouseenter', () => {
    popup.setLngLat(listing.geometry.coordinates) // Set the popup position
        .addTo(map); // Add the popup to the map
});

// Hide popup on mouse leave
marker.getElement().addEventListener('mouseleave', () => {
    popup.remove(); // Remove the popup from the map
});

function updateMarkerVisibility() {
    const bounds = map.getBounds(); // Get the current bounds of the map
    const markerLngLat = marker.getLngLat(); // Get marker's coordinates

    // Check if marker is within bounds
    if (bounds.contains(markerLngLat)) {
        marker.getElement().style.display = 'block'; // Show the marker
    } else {
        marker.getElement().style.display = 'none'; // Hide the marker
    }
}

// Call this function on map load and whenever the map is moved or zoomed
map.on('load', updateMarkerVisibility);
map.on('move', updateMarkerVisibility);
map.on('zoom', updateMarkerVisibility);



    