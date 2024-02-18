"use client";

import React, { useEffect, useRef } from "react";
import createGlobe from "cobe";

const minLat = -90;
const maxLat = 90;
const minLng = -180;
const maxLng = 180;

// Function to generate a random latitude
function getRandomLatitude() {
  return Math.random() * (maxLat - minLat) + minLat;
}

// Function to generate a random longitude
function getRandomLongitude() {
  return Math.random() * (maxLng - minLng) + minLng;
}

// Function to generate a list of random locations
function generateRandomLocations(numLocations) {
  const locations = [];
  for (let i = 0; i < numLocations; i++) {
    const lat = getRandomLatitude();
    const lng = getRandomLongitude();
    locations.push({ location: [lat, lng], size: Math.random() / 10 });
  }
  return locations;
}

export default function Globe() {
  const canvasRef = useRef<HTMLCanvasElement>(null); // Add type annotation to useRef

  useEffect(() => {
    let phi = 0;

    const globe = createGlobe(canvasRef.current!, {
      // Add non-null assertion operator
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: -2.5,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.3],
      markerColor: [1, 0, 0.1],
      glowColor: [1, 1, 1],
      markers: generateRandomLocations(200),
      onRender: (state) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full"
      // style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
    />
  );
}
