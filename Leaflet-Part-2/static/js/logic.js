// Adding the tile layer

let baseMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
})

// initializing variable for map
let map = L.map('map', {
  center: [40.7, -94.5],
  zoom: 3,
  });   // center position + zoom

// adding background to the map
baseMap.addTo(map);

// initializing the layers for map
let tectonicplates = new L.LayerGroup();
let earthquakes = new L.LayerGroup();

let baseMaps = {
  "Global Earthquakes": baseMap,
};

var overlays = {
  "Tectonic Plates": tectonicplates,
  Earthquakes: earthquakes
};

// adding layers to the map
L.control
  .layers(baseMaps, overlays)
  .addTo(map);

// intializing the url 
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// fetching data from query url
d3.json(queryUrl).then(function(response) {
  // function for circle radius and color based on the earquake magnitude and depth
  function styleInfo(feature) {
    return {
      opacity: 1,
      fillOpacity: 1,
      fillColor: getColor(feature.geometry.coordinates[2]),
      color: "#000000",
      radius: getRadius(feature.properties.mag),
      stroke: true,
      weight: 0.5
    };
  }

  // function to fill circle color
  function getColor(depth){

    switch (true) {
      case depth > 90:
        return "#ea2c2c";
      case depth > 70:
        return "#ea822c";
      case depth > 50:
        return "#ee9c00";
      case depth > 30:
        return "#eecc00";
      case depth > 10:
        return "#d4ee00";
      default:
        return "#98ee00";
    }

  }

  // function for circle radius
  function getRadius(magnitude) {
    if (magnitude === 0){
      return 1;
    } 
    return magnitude *4;
  }

  
  // Add geojson data into layer to map
  L.geoJson(response, {
    // We turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // We set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // We create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "Magnitude: "
        + feature.properties.mag
        + "<br>Depth: "
        + feature.geometry.coordinates[2]
        + "<br>Location: "
        + feature.properties.place
      );
    }
  }).addTo(map);

  // initializing variable to add legend to the map
  let legend = L.control({
    position: "bottomright"
  });

  // function to add legend features 
  legend.onAdd=function() {
    let div = L.DomUtil.create("div", "info legend");
    let grades = [-10, 10, 30, 50, 70, 90];
    let colors = [
      "#98ee00",
      "#d4ee00",
      "#eecc00",
      "#ee9c00",
      "#ea822c",
      "#ea2c2c"
    ];

    // looping throuth the grades
    for (let i = 0; i < grades.length; i++) {
      div.innerHTML += "<i style='background: " + colors[i] + "'></i> "
        + grades[i] + (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+");
    }
    return div;

  }

  // adding legend to the map
  legend.addTo(map);

  // fetching to add layers to the map
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (platedata){
    L.geoJson(platedata, {
      color: "orange",
      weight: 2
    })
      .addTo(tectonicplates);

    // Then add the tectonicplates layer to the map.
    tectonicplates.addTo(map);
  })
});