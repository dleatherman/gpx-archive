import * as tj from '@mapbox/togeojson';
import fs from 'node:fs';
import { readFile } from 'node:fs/promises';
import { DOMParser } from '@xmldom/xmldom';
import { DateTime } from 'luxon';

// Chuck all your .gpx files into the _runs folder
const files = fs.readdirSync('_runs').map((file) => `_runs/${file}`);

Promise.all(files.map((file) => readFile(file))).then((fileBuffers) => {
  fileBuffers.forEach((fileBuffer) => {
    const gpxParse = new DOMParser().parseFromString(fileBuffer.toString('utf-8'), 'text/xml');
    const converted = tj.default.gpx(gpxParse);
    const date = DateTime.fromISO(converted.features[0].properties.time);
    const fileName = `${date.year}-${(date.month).toString().padStart(2, "0")}-${date.day.toString().padStart(2, "0")}`;
    fs.writeFileSync(`src/_data/runs/${fileName}.json`, JSON.stringify(converted));
  });
});
