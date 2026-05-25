import { geoPath, geoIdentity } from 'd3';
import { optimize } from 'svgo';

export const CreateSVGfromGeoJSON = (data, strokeSize = 5) => {
  if (!data) return;
  const dimensions = {
    width: 400,
    height: 400,
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
    optimize(`<svg class="workout-path-wrapper" xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
        <path class="workout-path" d="${paths.join("")}" fill="none" stroke="currentColor" />
      </svg>`);

  return optimizedSVG;
}
