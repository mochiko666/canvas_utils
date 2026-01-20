import {
  createCanvas,
  loadImage,
  registerFont,
  type Canvas,
  type CanvasRenderingContext2D,
} from "canvas";
import { readFile } from "fs/promises";
import { CanvasComponentType } from "../enums/canvas.js";
import type {
  AnyCanvasComponent,
  ArcOption,
  CanvasColorResolvable,
  CanvasContainer,
  CanvasTransformOption,
  DrawComponent,
  EllipseOption,
  ImageOption,
  OperationOption,
  RectangleOption,
  RoundRectangleOption,
  ShapeOption,
  StrokeOption,
  TextOption,
  TransformOption,
} from "../types/components.js";

/**
 * Interprets a {@link CanvasContainer} and draw on a new Canvas.
 * @param container The container to draw from.
 * @returns The canvas on which the image is drawn.
 */
export async function createCanvasFromContainer(container: CanvasContainer): Promise<Canvas> {
  const { size, components, fonts } = container;
  if (fonts) for (const [name, path] of Object.entries(fonts)) registerFont(path, { family: name });

  const canvas = createCanvas(...size);
  const ctx = canvas.getContext("2d");

  for (const component of components) await drawFromComponent(ctx, component);
  return canvas;
}
/**
 * Interprets a Canvas Component and draw with a specified context.
 * @param context The context to draw with.
 * @param component The component to draw from.
 */
export async function drawFromComponent(
  context: CanvasRenderingContext2D,
  component: AnyCanvasComponent,
): Promise<void> {
  switch (component.type) {
    case CanvasComponentType.Container:
      return drawFromContainer(context, component);
    case CanvasComponentType.Rectangle:
      return drawRectangle(context, component);
    case CanvasComponentType.Round:
      return drawRoundRectangle(context, component);
    case CanvasComponentType.Arc:
      return drawArc(context, component);
    case CanvasComponentType.Ellipse:
      return drawEllipse(context, component);
    case CanvasComponentType.File:
      return drawImageFile(context, component);
    case CanvasComponentType.Text:
      return drawText(context, component);
    case CanvasComponentType.Operation:
      return drawOperation(context, component);
  }
}
async function drawFromContainer(
  context: CanvasRenderingContext2D,
  component: CanvasContainer,
  keepConfig: boolean = true,
): Promise<void> {
  if (keepConfig) context.save();
  const result = await createCanvasFromContainer(component);
  resolveCommonStyles(context, component);
  const { offset, size } = component;
  context.drawImage(result, ...offset, ...size);
  if (keepConfig) context.restore();
}
async function drawRectangle(
  context: CanvasRenderingContext2D,
  component: RectangleOption,
  keepConfig: boolean = true,
): Promise<void> {
  if (keepConfig) context.save();
  context.beginPath();
  resolveCommonStyles(context, component);
  const { offset, size } = component;
  context.rect(...offset, ...size);

  await resolveDrawShape(context, component);
  if (keepConfig) context.restore();
}
async function drawRoundRectangle(
  context: CanvasRenderingContext2D,
  component: RoundRectangleOption,
  keepConfig: boolean = true,
): Promise<void> {
  if (keepConfig) context.save();
  context.beginPath();
  resolveCommonStyles(context, component);
  const { offset, size, radii } = component;
  context.roundRect(...offset, ...size, radii);

  await resolveDrawShape(context, component);
  if (keepConfig) context.restore();
}
async function drawArc(
  context: CanvasRenderingContext2D,
  component: ArcOption,
  keepConfig: boolean = true,
): Promise<void> {
  if (keepConfig) context.save();
  context.beginPath();
  resolveCommonStyles(context, component);
  const { offset, radius, angle, counterClockWise } = component;
  context.arc(...offset, radius, ...angle, counterClockWise);

  await resolveDrawShape(context, component);
  if (keepConfig) context.restore();
}
async function drawEllipse(
  context: CanvasRenderingContext2D,
  component: EllipseOption,
  keepConfig: boolean = true,
): Promise<void> {
  if (keepConfig) context.save();
  context.beginPath();
  resolveCommonStyles(context, component);
  const { offset, radius, rotation, angle, counterClockWise } = component;
  context.ellipse(...offset, ...radius, rotation, ...angle, counterClockWise);

  await resolveDrawShape(context, component);
  if (keepConfig) context.restore();
}
async function drawImageFile(
  context: CanvasRenderingContext2D,
  component: ImageOption,
  keepConfig: boolean = true,
): Promise<void> {
  if (keepConfig) context.save();
  resolveCommonStyles(context, component);
  const { offset, size, path } = component;
  const buffer = await readFile(path);
  const image = await loadImage(buffer);
  context.drawImage(image, ...offset, ...size);

  if (keepConfig) context.restore();
}
async function drawText(
  context: CanvasRenderingContext2D,
  component: TextOption,
  keepConfig: boolean = true,
): Promise<void> {
  if (keepConfig) context.save();
  const {
    text,
    offset,
    font,
    fontSize,
    fontWeight,
    color,
    maxWidth,
    textAlign,
    textBaseline,
    direction,
    lang,
    stroke,
  } = component;
  resolveCommonStyles(context, component);
  context.fillStyle = await resolveColor(context, color);

  const resolvedSize = typeof fontSize === "number" ? fontSize + "px" : (fontSize ?? "10px");
  context.font = `${fontWeight ?? "normal"} ${resolvedSize} ${font || "sans-serif"}`;
  context.textAlign = textAlign ?? "start";
  context.textBaseline = textBaseline ?? "alphabetic";
  context.direction = direction ?? "ltr";
  context.lang = lang ?? "";

  if (stroke) {
    await resolveStroke(context, stroke);
    context.strokeText(text, ...offset, maxWidth);
  } else {
    context.fillStyle = await resolveColor(context, color);
    context.fillText(text, ...offset, maxWidth);
  }
  if (keepConfig) context.restore();
}
function drawOperation(
  context: CanvasRenderingContext2D,
  component: OperationOption,
  keepConfig: boolean = true,
): void {
  if (keepConfig) context.save();
  component.operation(context);
  if (keepConfig) context.restore();
}

function resolveCommonStyles(context: CanvasRenderingContext2D, option: DrawComponent): void {
  const { alpha, shadow, composite, transforms } = option;
  context.shadowColor = shadow?.color ?? "rgba(0, 0, 0, 0.00)";
  context.shadowBlur = shadow?.blur ?? 0;
  const [sx, sy] = shadow?.offset ?? [0, 0];
  context.shadowOffsetX = sx;
  context.shadowOffsetY = sy;

  context.globalAlpha = alpha ?? 1;

  context.globalCompositeOperation = composite ?? "source-over";

  resolveTransforms(context, transforms);
}
function resolveTransforms(
  context: CanvasRenderingContext2D,
  transforms?: CanvasTransformOption[],
): void {
  context.resetTransform();
  if (!transforms) return;
  for (const transform of transforms) {
    if ("translate" in transform) context.translate(...transform.translate);
    else if ("angle" in transform) context.rotate(transform.angle);
    else if ("scale" in transform) context.scale(...transform.scale);
    else if ("matrix" in transform) context.setTransform(transform.matrix);
    else {
      const defaults: TransformOption = {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
        ...transform,
      };
      const { a, b, c, d, e, f } = defaults;
      context.transform(a, b, c, d, e, f);
    }
  }
}
async function resolveColor(
  context: CanvasRenderingContext2D,
  color?: CanvasColorResolvable,
): Promise<string | CanvasGradient | CanvasPattern> {
  if (!color || typeof color === "string") return color ?? "#000000";
  if ("path" in color) {
    const { path, repetition, transform } = color;
    const buffer = await readFile(path);
    const image = await loadImage(buffer);
    const pattern = context.createPattern(image, repetition);
    if (transform) pattern.setTransform(transform);
    return pattern;
  }

  const defaults = {
    x0: 0,
    y0: 0,
    r0: 0,
    x1: 0,
    y1: 0,
    r1: 0,
    ...color,
  };
  const { x0, y0, r0, x1, y1, r1, stops } = defaults;
  const gradient =
    "r0" in color || "r1" in color
      ? context.createRadialGradient(x0, y0, r0, x1, y1, r1)
      : context.createLinearGradient(x0, y0, x1, y1);
  for (const { offset, color } of stops) gradient.addColorStop(offset, color);

  return gradient;
}
async function resolveStroke(context: CanvasRenderingContext2D, option?: boolean | StrokeOption) {
  const defaults: Required<StrokeOption> = {
    color: "#000000",
    width: 1.0,
    cap: "butt",
    join: "miter",
    dash: [],
    dashOffset: 0.0,
    miterLimit: 10.0,
  };
  if (typeof option !== "boolean") Object.assign(defaults, option);
  const { color, width, cap, join, dash, dashOffset, miterLimit } = defaults;
  context.strokeStyle = await resolveColor(context, color);
  context.lineWidth = width;
  context.lineCap = cap;
  context.lineJoin = join;
  context.setLineDash(dash);
  context.lineDashOffset = dashOffset;
  context.miterLimit = miterLimit;
}
async function resolveDrawShape(
  context: CanvasRenderingContext2D,
  component: ShapeOption,
): Promise<void> {
  const { color, stroke } = component;
  if (stroke) {
    await resolveStroke(context, stroke);
    context.stroke();
  } else {
    context.fillStyle = await resolveColor(context, color);
    context.fill();
  }
}
