var map = L.map('map', {
    zoomControl: false
  }).setView([0, 0], 3),
  layer = L.esri.basemapLayer('DarkGray').addTo(map),
  layerLabels = null,
  worldTransportation = L.esri.basemapLayer('ImageryTransportation');

function setBasemap(basemap) {
  if (layer) {
    map.removeLayer(layer);
  }
  if (basemap === 'OpenStreetMap') {
    layer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png");
  } else {
    layer = L.esri.basemapLayer(basemap);
  }
  map.addLayer(layer);
  if (layerLabels) {
    map.removeLayer(layerLabels);
  }

  if (basemap === 'ShadedRelief' || basemap === 'Oceans' || basemap === 'Gray' || basemap === 'DarkGray' || basemap === 'Imagery' || basemap === 'Terrain') {
    layerLabels = L.esri.basemapLayer(basemap + 'Labels');
    map.addLayer(layerLabels);
  }

  // add world transportation service to Imagery basemap
  if (basemap === 'Imagery') {
    worldTransportation.addTo(map);
  } else if (map.hasLayer(worldTransportation)) {
    // remove world transportation if Imagery basemap is not selected
    map.removeLayer(worldTransportation);
  }
}

L.control.zoom({
  position: 'topleft'
}).addTo(map);

var searchControl = L.esri.Geocoding.geosearch({
  expanded: true,
  collapseAfterResult: false,
  zoomToResult: true,
  providers: [L.esri.Geocoding.arcgisOnlineProvider({
    apikey: "AAPKa5248f479f614a40801d8872a5bdf8e57-QGHaLxuryJ0ImlSIdzKscQJXwOOw6eKsp7nNu7xpT6unRpegMrXuFtI9hqleCV",
  })]
}).addTo(map);

var results = L.layerGroup().addTo(map);

searchControl.on('results', function(data) {
  results.clearLayers();
  for (var i = data.results.length - 1; i >= 0; i--) {
    results.addLayer(L.marker(data.results[i].latlng));
  }
});

document.getElementById("content").style.display = 'none';


// Basemap changed
$("#selectStandardBasemap").on("change", function(e) {
  setBasemap($(this).val());
});

// Search
var input = $(".geocoder-control-input");
input.focus(function() {
  $("#panelSearch .panel-body").css("height", "150px");
});
input.blur(function() {
  $("#panelSearch .panel-body").css("height", "auto");
});

// Attach search control for desktop or mobile
function attachSearch() {
  var parentName = $(".geocoder-control").parent().attr("id"),
    geocoder = $(".geocoder-control"),
    width = $(window).width();
  if (width <= 767 && parentName !== "geocodeMobile") {
    geocoder.detach();
    $("#geocodeMobile").append(geocoder);
  } else if (width > 767 && parentName !== "geocode") {
    geocoder.detach();
    $("#geocode").append(geocoder);
  }
}

$(window).resize(function() {
  attachSearch();
});

attachSearch();

var geoJson;
$.ajax({
  url: "/dist/ufo.json",
  type: 'GET',
  cache: true,
  dataType: 'json', // added data type
  complete: function(jqXHR, XMLHTTPRequest) {
    addMarkers(geoJson);
    document.getElementById('content').style.display = 'block';
    document.getElementById('loader').style.display = 'none';
  },
  success: function(res) {
    geoJson = {
      type: 'FeatureCollection',
      features: res['data']
    }
    addMarkers(geoJson);
  },
});



function addMarkers(geojson) {
  var markers = L.markerClusterGroup();

  var geoJsonLayer = L.geoJson(geoJson, {
    onEachFeature: function(feature, layer) {
      layer.bindPopup(`
        <table class="table">
          <thead>
            <tr>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>City</strong>: ${feature.properties.city}</td>
            </tr>
            <tr>
              <td><strong>State</strong>: ${feature.properties.state}</td>
            </tr>
            <tr>
              <td><strong>Country</strong>: ${feature.properties.country}</td>
            </tr>
            <tr>
              <td><strong>Date</strong>: ${feature.properties.datetime}</td>
            </tr>
            <tr>
              <td><strong>Duration</strong>: ${feature.properties.duration}</td>
            </tr>
            <tr>
              <td><strong>Shape</strong>: ${feature.properties.shape}</td>
            </tr>
            <tr>
              <td><strong>Comments</strong>: ${feature.properties.comments}</td>
            </tr>
          </tbody>
        </table>
        `);
    }
  });
  markers.addLayer(geoJsonLayer);
  map.addLayer(markers);
}
