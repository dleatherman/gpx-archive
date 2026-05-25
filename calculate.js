import * as tj from '@mapbox/togeojson';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import { DOMParser } from '@xmldom/xmldom';
import { DateTime } from 'luxon';
import { topology } from "topojson-server";
import { feature } from "topojson-client";
import { presimplify, simplify } from 'topojson-simplify';

// Chuck all your .gpx files into the _workouts folder
const files = fs.readdirSync('_workouts')
  .filter((file) => file.endsWith('.gpx')).map((file) => `_workouts/${file}`);

// Extract per-trackpoint extension arrays directly from the GPX DOM
function extractExtensions(dom) {
  const trkpts = Array.from(dom.getElementsByTagName('trkpt'));
  const heartRates = [];
  const cadences   = [];
  const speeds     = [];

  trkpts.forEach((pt) => {
    const hr  = pt.getElementsByTagName('gpxtpx:hr')[0];
    const cad = pt.getElementsByTagName('gpxtpx:cad')[0];
    const spd = pt.getElementsByTagName('gpxtpx:speed')[0];
    heartRates.push(hr  ? Number(hr.textContent)  : null);
    cadences.push(cad ? Number(cad.textContent) : null); // cycling: rpm, running: spm
    speeds.push(    spd ? Number(spd.textContent) : null); // m/s
  });

  return { heartRates, cadences, speeds };
}

function haversineDistance(coord1, coord2) {
  const R = 3958.8; // Earth's radius in miles
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function totalDistance(feature) {
  const coords = feature.geometry.coordinates;
  let miles = 0;
  for (let i = 1; i < coords.length; i++) {
    miles += haversineDistance(coords[i - 1], coords[i]);
  }
  return Math.round(miles * 100) / 100;
}

Promise.all(files.map((file) => readFile(file))).then((fileBuffers) => {
  fileBuffers.forEach((fileBuffer) => {
    const gpxParse = new DOMParser().parseFromString(fileBuffer.toString('utf-8'), 'text/xml');
    const converted = tj.default.gpx(gpxParse);
    if (!converted?.features[0]?.properties) return;

    // Merge extension arrays into each feature's properties
    const extensions = extractExtensions(gpxParse);
    converted.features.forEach((feature) => {
      feature.properties.heartRates = extensions.heartRates;
      feature.properties.cadences   = extensions.cadences;
      feature.properties.speeds     = extensions.speeds;
      feature.properties.distanceMiles = totalDistance(feature);
    });

    const date = DateTime.fromISO(converted.features[0]?.properties?.time);
    const fileName = `${date.year}-${(date.month).toString().padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`;
    fs.writeFileSync(`src/_data/workouts/${fileName}.json`, JSON.stringify(converted, null, 2));
  });
});

// function deduplicateCoordinates(coordinates, thresholdMeters = 30) {
//   const unique = [];

//   for (const coord of coordinates) {
//     const isDuplicate = unique.some(
//       (existing) => haversineDistance(coord, existing) <= thresholdMeters,
//     );

//     if (!isDuplicate) {
//       unique.push(coord);
//     }
//   }

//   return unique;
// }

// /**
//  * Calculate distance between two lon/lat coordinates in meters
//  */
// function haversineDistance([lon1, lat1], [lon2, lat2]) {
//   const R = 6371000; // Earth radius in meters

//   const toRad = (deg) => (deg * Math.PI) / 180;

//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);

//   const a =
//     Math.sin(dLat / 2) ** 2 +
//     Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

//   return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// }
