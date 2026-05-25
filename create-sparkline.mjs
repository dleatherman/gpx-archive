import Sparkline from 'sparkline-svg';

export const CreateSparkline = (
  data,
  color = "currentColor",
  fill = false,
  width = 250,
  height = 30,
) => {
  let line = new Sparkline.default(data.filter(num => typeof num === 'number' && !isNaN(num)) || []);
  line.setViewBoxHeight(height);
  line.setViewBoxWidth(width);
  line.setWidth(width);
  line.setHeight(height);
  if (fill) {
    line.setFill("inherit");
    line.setC;
  }
  line.setStrokeWidth(1);

  if (color) {
    line.setStroke(color || "#000000");
  }
  return line.outerHTML;
}
