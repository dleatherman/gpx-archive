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

Promise.all(files.map((file) => readFile(file))).then((fileBuffers) => {
  fileBuffers.forEach((fileBuffer) => {
    const gpxParse = new DOMParser().parseFromString(fileBuffer.toString('utf-8'), 'text/xml');
    const converted = tj.default.gpx(gpxParse);
    if (!converted?.features[0]?.properties) return;
    const date = DateTime.fromISO(converted.features[0]?.properties?.time);
    const fileName = `${date.year}-${(date.month).toString().padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`;
    const topo = topology({ data: converted });
    presimplify(topo);
    const simplifiedTopo = simplify(topo, 0.0001);
    const simplifiedGeoJSON = feature(
      simplifiedTopo,
      simplifiedTopo.objects.data
    );
    simplifiedGeoJSON.features[0].geometry.coordinates = deduplicateCoordinates(simplifiedGeoJSON.features[0]?.geometry?.coordinates)
    fs.writeFileSync(`src/_data/workouts/${fileName}.json`, JSON.stringify(simplifiedGeoJSON, null, 2));
  });
});

function deduplicateCoordinates(coordinates, thresholdMeters = 30) {
  const unique = [];

  for (const coord of coordinates) {
    const isDuplicate = unique.some(
      (existing) => haversineDistance(coord, existing) <= thresholdMeters,
    );

    if (!isDuplicate) {
      unique.push(coord);
    }
  }

  return unique;
}

/**
 * Calculate distance between two lon/lat coordinates in meters
 */
function haversineDistance([lon1, lat1], [lon2, lat2]) {
  const R = 6371000; // Earth radius in meters

  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
