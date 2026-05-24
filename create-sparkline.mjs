import Sparkline from 'sparkline-svg';

export const CreateSparkline = (
  data,
  color = "#000000",
  fill = false,
  width = 250,
  height = 80,
) => {
  let line = new Sparkline.default(data || []);
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
