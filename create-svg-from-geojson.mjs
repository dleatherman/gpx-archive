import { geoPath, geoIdentity } from 'd3';
import { optimize } from 'svgo';

export const CreateSVGfromGeoJSON = (data, strokeSize = 5) => {
  if (!data) return;
  const dimensions = {
    width: 350,
    height: 300,
  };

  const { width, height } = dimensions;

  const projection = geoIdentity()
    .reflectY(true)
    .fitSize(
      [dimensions.width - strokeSize, dimensions.height - strokeSize],
      data,
    );

  const path = geoPath(projection);

  const paths = data.features.map((d) => {
    return `${path(d)}`;
  });

  const { data: optimizedSVG } =
    optimize(`<svg class="run-path-wrapper" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <path class="run-path" d="${paths.join("")}" fill="none" stroke="currentColor" />
      </svg>`);

  return optimizedSVG;
}
