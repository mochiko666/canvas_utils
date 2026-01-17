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
  CanvasColorResolvable,
  CanvasContainer,
  ImageOption,
  TextOption,
} from "../types/canvas.js";

/**
 * Interprets a {@link CanvasContainer} and draw from it.
 * @param container A container to draw from.
 * @param canvas Optional. Used to draw on a specific canvas instead of new one.
 */
export async function drawFromContainer(
  container: CanvasContainer,
  canvas?: Canvas,
): Promise<Canvas> {
  const { size, components, fonts } = container;
  if (fonts) for (const [name, path] of Object.entries(fonts)) registerFont(path, { family: name });

  canvas ??= createCanvas(...size);
  const ctx = canvas.getContext("2d");
  for (const component of components)
    switch (component.type) {
      case CanvasComponentType.Container: {
        const { offset, size } = component;
        const result = await drawFromContainer(component);
        ctx.drawImage(result, ...offset, ...size);
        break;
      }
      case CanvasComponentType.Text: {
        drawText(ctx, component, true);
        break;
      }
      case CanvasComponentType.Operation: {
        ctx.save();
        component.operation(ctx);
        ctx.restore();
        break;
      }
      default: {
        await drawImage(ctx, component, true);
        break;
      }
    }

  return canvas;
}

export async function drawImage(
  context: CanvasRenderingContext2D,
  option: ImageOption,
  keep?: boolean,
): Promise<CanvasRenderingContext2D> {
  if (keep) context.save();
  init(context, option);
  const { type, offset } = option;

  // if option is ImageLoadOption:
  if (type === CanvasComponentType.File) {
    const { size } = option;
    const buffer = await readFile(option.path);
    const image = await loadImage(buffer);
    context.drawImage(image, ...offset, ...size);
    if (keep) context.restore();
    return context;
  }

  context.beginPath();
  switch (type) {
    case CanvasComponentType.Rectangle: {
      const { size } = option;
      context.rect(...offset, ...size);
      break;
    }
    case CanvasComponentType.Round: {
      const { size, radii } = option;
      context.roundRect(...offset, ...size, radii);
      break;
    }
    case CanvasComponentType.Arc: {
      const { radius, angle, counterClockWise } = option;
      context.arc(...offset, radius, ...angle, counterClockWise);
      break;
    }
    case CanvasComponentType.Ellipse: {
      const { radius, rotation, angle, counterClockWise } = option;
      context.ellipse(...offset, ...radius, rotation, ...angle, counterClockWise);
      break;
    }
  }

  const { color, stroke } = option;
  if (stroke) {
    context.strokeStyle = typeof stroke === "boolean" ? "#000000" : resolveColor(context, stroke);
    context.stroke();
  } else {
    context.fillStyle = resolveColor(context, color);
    context.fill();
  }
  if (keep) context.restore();
  return context;
}

export function drawText(
  context: CanvasRenderingContext2D,
  option: TextOption,
  keep?: boolean,
): CanvasRenderingContext2D {
  if (keep) context.save();
  const { text, offset, font, fontSize, fontWeight, color, maxWidth, textAlign, stroke } = option;
  init(context, option);
  context.fillStyle = resolveColor(context, color);

  const resolvedSize = typeof fontSize === "number" ? fontSize + "px" : (fontSize ?? "10px");
  context.font = `${fontWeight ?? "normal"} ${resolvedSize} ${font || "sans-serif"}`;
  context.textAlign = textAlign ?? "start";

  if (stroke) {
    context.strokeStyle = typeof stroke === "boolean" ? "#000000" : resolveColor(context, stroke);
    context.strokeText(text, ...offset, maxWidth);
  } else {
    context.fillStyle = resolveColor(context, color);
    context.fillText(text, ...offset, maxWidth);
  }
  if (keep) context.restore();
  return context;
}

export function init(
  context: CanvasRenderingContext2D,
  option: ImageOption | TextOption,
): CanvasRenderingContext2D {
  const { alpha, shadow } = option;
  context.shadowColor = shadow?.color ?? "rgba(0, 0, 0, 0.00)";
  context.shadowBlur = shadow?.blur ?? 0;
  const [sx, sy] = shadow?.offset ?? [0, 0];
  context.shadowOffsetX = sx;
  context.shadowOffsetY = sy;

  context.globalAlpha = alpha ?? 1;
  return context;
}
export function resolveColor(
  context: CanvasRenderingContext2D,
  color?: CanvasColorResolvable,
): string | CanvasGradient | CanvasPattern {
  if (!color || typeof color === "string") return color ?? "#000000";

  const defaults = {
    x0: 0,
    y0: 0,
    r0: 0,
    x1: 0,
    y1: 0,
    r1: 0,
  };
  const { x0, y0, r0, x1, y1, r1, timestamp } = Object.assign(defaults, color);
  const gradient =
    "r0" in color
      ? context.createRadialGradient(x0, y0, r0, x1, y1, r1)
      : context.createLinearGradient(x0, y0, x1, y1);
  for (const { offset, color } of timestamp) gradient.addColorStop(offset, color);

  return gradient;
}
