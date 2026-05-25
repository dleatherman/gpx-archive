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

  // Get average of array of numbers
  eleventyConfig.addFilter("average", (array) => {
    return array.reduce((a, b) => a + b, 0) / array.length;
  })

  // Get fixed number of decimals
  eleventyConfig.addFilter("toFixed", (number, length) => {
    return number.toFixed(length);
  })

  // convert to spm
  eleventyConfig.addFilter("spm", (kmh) => {
    return (parseFloat(kmh) * 2);
  });

  // convert to mph
  eleventyConfig.addFilter("mph", (mps) => {
    return (parseFloat(mps) * 2.23694).toFixed(2);
  });

  // Generates SVG from GeoJSON
  eleventyConfig.addFilter("CreateSVGfromGeoJSON", (data, size) => {
    let dimensions;
    if (size) {
      dimensions = { width: size, height: size };
    }
    return CreateSVGfromGeoJSON({data, dimensions});
  });

  // Generates a sparkline from workout data
  eleventyConfig.addFilter(
    "getSparklineFromWorkoutecord",
    (workout, getKey, color) => {
      if (!getKey) return;
      const result = [];
      const workoutData = workout.features[0].properties[getKey];
      workoutData.forEach(entry => {
        if (!isNaN(entry) || !isNumber(entry)) {
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
