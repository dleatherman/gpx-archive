import CleanCSS from 'clean-css';
import { DateTime, Duration } from 'luxon';
import { CreateSparkline } from './create-sparkline.mjs';
import { CreateSVGfromGeoJSON } from './create-svg-from-geojson.mjs';

export default async function (eleventyConfig) {

  // Minify CSS
  eleventyConfig.addFilter("cssmin", function (code) {
    return new CleanCSS({}).minify(code).styles;
  });

  // Add base layout
  eleventyConfig.addLayoutAlias("base", "layouts/base.njk");

  // Add year into layout
  eleventyConfig.addShortcode("date", () => `${DateTime.fromJSDate(new Date()).toFormat("LLL d, yyyy")}`);

  // Creates a nice object for data display
  eleventyConfig.addFilter("entries", function (obj) {
    return Object.entries(obj);
  });

  // Readable date format
  eleventyConfig.addFilter("readableDateISO", (dateObj) => {
    return DateTime.fromISO(dateObj, { zone: "utc" }).toFormat("LLL d, yyyy");
  });

  // Generates SVG from GeoJSON
  eleventyConfig.addFilter("CreateSVGfromGeoJSON", (data) => {
    return CreateSVGfromGeoJSON(data);
  });

  // Generates a sparkline from run data
  eleventyConfig.addFilter(
    "getSparklineFromRunRecord",
    (run, getKey, color) => {
      if (!getKey) return;
      const result = [];
      const runData = run[1].features[0].properties[getKey];
      runData.forEach(entry => {
        if (!isNaN(entry)) {
          result.push(entry);
        }
      })
      return CreateSparkline(result);
    },
  );
};

export const config = {
  dir: {
    input: "src",
    output: "dist"
  }
};
