// (vorheriger Code bleibt)

function initialise_map() {
    mapboxgl.accessToken = 'your-mapbox-token';
    map = new mapboxgl.Map({
      container: 'map',
      style: 'mapbox://styles/mapbox/streets-v11',
      center: truecenter,
      zoom: 12,
      pitch: 45,
      bearing: 0,
      dragRotate: true
    });
  
    map.on('load', function() {
      for (var key in coordinates) {
        map.addSource('line-segments' + key, {
          type: 'geojson',
          data: linejsons[key]
        });
        map.addLayer({
          id: 'lines-layer-' + key,
          type: 'line',
          source: 'line-segments' + key,
          paint: {
            'line-width': ['get', 'width'],
            'line-color': ['get', 'stroke']
          }
        });
  
        map.addSource('circles' + key, {
          type: 'geojson',
          data: pointjsons[key]
        });
        map.addLayer({
          id: 'circles-layer-' + key,
          type: 'circle',
          source: 'circles' + key,
          paint: {
            'circle-radius': ['get', 'radius'],
            'circle-color': ['get', 'fill'],
            'circle-stroke-width': ['get', 'stroke'],
            'circle-stroke-color': 'black',
            'circle-opacity': 0.5
          }
        });
      }
  
      addMarkers();
      map.addControl(new mapboxgl.NavigationControl({ showCompass: true, showZoom: true }));
    });
  }
  
  function addMarkers() {
    waypoints.forEach(function(wp) {
      var el = document.createElement('div');
      el.className = 'marker';
      el.style.backgroundImage = wp.icon;
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.backgroundSize = '100%';
  
      var marker = new mapboxgl.Marker(el, { offset: [0, -16] })
        .setLngLat(wp.coordinates)
        .setPopup(new mapboxgl.Popup({ offset: 25, closeButton: false }).setText(wp.name))
        .addTo(map);
      markers.push(marker);
    });
  }
  
  function zeitgewahlt(timr) {
    document.getElementById('myRange').value = timr;
    document.getElementById('uhr').textContent = convertMinutesToTime(timr);
    document.getElementById('gunuhr').textContent = convertMinutesToTime(Math.max(0, timr - delay.mara));
  
    for (var key in coordinates) {
      var kk = Math.max(0, timr - delay[key]);
      if (kk < woist[key].length) {
        for (var i = 0; i < coordinates[key].length - 1; i++) {
          var menge = woist[key][kk][i];
          var stroke = menge > 0 ? Math.min(10, mengeScale(menge)) : 0;
          var rad = menge > 0 ? Math.min(10, mengeScale(menge)) : 0;
          var col = menge > 0 ? colorScale[key](menge) : 'blue';
  
          pointjsons[key].features[i + 1].properties = {
            radius: rad * 1.5,
            stroke: 0,
            fill: col,
            text: racenames[key] + "\n" + (i + 1) / 40 + " km\n" + convertMinutesToTime(timr) + "\n" + menge + " runners"
          };
          linejsons[key].features[i].properties = {
            stroke: col,
            width: stroke
          };
        }
      }
      map.getSource('line-segments' + key).setData(linejsons[key]);
      map.getSource('circles' + key).setData(pointjsons[key]);
    }
  }
  
  function convertMinutesToTime(minutes) {
    var hours = Math.floor(minutes / 60);
    var mins = minutes % 60;
    return (hours < 10 ? '0' : '') + hours + ':' + (mins < 10 ? '0' : '') + mins;
  }
  
  function convertTimeToMinutes(time) {
    var parts = time.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
  }
  
  function findIndices(arr) {
    var first = -1, last = -1;
    for (var i = 0; i < arr.length; i++) {
      if (arr[i] > 0) {
        if (first === -1) first = i;
        last = i;
      }
    }
    return [last >= 0 ? last : 0, first >= 0 ? first : 0];
  }
  
  function generateColoredGeoJSON(coords) {
    var features = [];
    for (var i = 0; i < coords.length - 1; i++) {
      features.push({
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: [coords[i], coords[i + 1]]
        },
        properties: {
          stroke: '#000000',
          width: 1
        }
      });
    }
    return { type: 'FeatureCollection', features: features };
  }
  
  function coordinatesToGeoJSON(coords) {
    return {
      type: 'FeatureCollection',
      features: coords.map(function(c) {
        return {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: c },
          properties: { radius: 0, stroke: 0, fill: 'blue', text: '' }
        };
      })
    };
  }
  