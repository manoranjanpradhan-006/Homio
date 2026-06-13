let loadPromise = null;

/**
 * Asynchronously loads the Google Maps JavaScript API script.
 * Returns a promise that resolves with the `window.google` object once loaded.
 */
export const loadGoogleMaps = () => {
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    // If google maps is already loaded
    if (typeof window !== 'undefined' && window.google && window.google.maps) {
      resolve(window.google);
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
    if (!apiKey || apiKey.startsWith('your_')) {
      reject(new Error("Google Maps API Key is missing or invalid. Check VITE_GOOGLE_MAPS_API_KEY in your .env file."));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-script';

    script.onload = () => {
      if (window.google && window.google.maps) {
        resolve(window.google);
      } else {
        reject(new Error("Google Maps object not found on window after loading script."));
      }
    };

    script.onerror = () => {
      reject(new Error("Failed to load Google Maps script."));
    };

    document.head.appendChild(script);
  });

  return loadPromise;
};

/**
 * Factory that returns a CustomOverlayMarker class extending google.maps.OverlayView.
 * Needs the `google` namespace passed in.
 */
export const createCustomMarkerClass = (google) => {
  function CustomMarker(latlng, map, html, onClick) {
    this.latlng = latlng;
    this.html = html;
    this.onClick = onClick;
    this.setMap(map);
  }

  CustomMarker.prototype = new google.maps.OverlayView();

  CustomMarker.prototype.draw = function() {
    let div = this.div;
    if (!div) {
      div = this.div = document.createElement('div');
      div.style.position = 'absolute';
      div.style.transform = 'translate(-50%, -50%)'; // Center it!
      div.style.zIndex = '10';
      div.innerHTML = this.html;

      if (this.onClick) {
        div.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.onClick();
        };
      }

      const panes = this.getPanes();
      panes.overlayImage.appendChild(div);
    }

    const point = this.getProjection().fromLatLngToDivPixel(this.latlng);
    if (point) {
      div.style.left = point.x + 'px';
      div.style.top = point.y + 'px';
    }
  };

  CustomMarker.prototype.onRemove = function() {
    if (this.div) {
      this.div.parentNode.removeChild(this.div);
      this.div = null;
    }
  };

  return CustomMarker;
};
