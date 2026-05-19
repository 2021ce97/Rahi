import React, { useEffect, useState } from 'react';
import { useMap, useMapsLibrary } from '@vis.gl/react-google-maps';

interface DirectionsProps {
  origin: string | google.maps.LatLngLiteral;
  destination: string | google.maps.LatLngLiteral;
  onETACalculated?: (eta: string) => void;
}

export function MapDirections({ origin, destination, onETACalculated }: DirectionsProps) {
  const map = useMap();
  const routesLibrary = useMapsLibrary('routes');
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService>();
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer>();

  useEffect(() => {
    if (!routesLibrary || !map) return;
    setDirectionsService(new routesLibrary.DirectionsService());
    const renderer = new routesLibrary.DirectionsRenderer({
      map,
      suppressMarkers: false,
    });
    setDirectionsRenderer(renderer);
    
    return () => {
      renderer.setMap(null);
    }
  }, [routesLibrary, map]);

  useEffect(() => {
    if (!directionsService || !directionsRenderer || !origin || !destination) return;

    directionsService.route({
      origin: origin,
      destination: destination,
      travelMode: google.maps.TravelMode.DRIVING,
    }).then(response => {
      directionsRenderer.setDirections(response);
      if (response.routes[0] && response.routes[0].legs[0]) {
        const leg = response.routes[0].legs[0];
        if (leg.duration && onETACalculated) {
           onETACalculated(leg.duration.text);
        }
      }
    }).catch((e) => {
      console.error("Directions request failed", e);
    });
  }, [directionsService, directionsRenderer, origin, destination]);

  return null;
}
