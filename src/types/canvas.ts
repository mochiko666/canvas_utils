import type { CanvasRenderingContext2D } from "canvas";
import type { PathLike } from "fs";
import type {
  ArcComponentBuilder,
  ContainerBuilder,
  EllipseComponentBuilder,
  FileComponentBuilder,
  OperationComponentBuilder,
  RectComponentBuilder,
  RoundRectComponentBuilder,
  TextComponentBuilder,
} from "../classes/canvas.js";
import type { CanvasComponentType } from "../enums/canvas.js";
import type { Projection, RequireOneWith } from "./utils.js";
import type { Vector2D } from "./vector.js";

export interface Offset {
  /**
   * The coordinates of the staring point to draw, in pixels.
   * @default [0, 0]
   */
  offset: Vector2D;
}
export interface Size {
  /**
   * The size of the image.
   * @default [0, 0]
   */
  size: Vector2D;
}
export type CanvasColorResolvable = string | GradientOption;
export interface Color {
  /**
   * The color, gradient, or pattern to use inside shapes. \
   * One of the following:
   * * A string parsed as CSS [`<color>`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value)
   * value.
   * * A [`CanvasGradient`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient) object
   * (a linear or radial gradient).
   * * A [`CanvasPattern`](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern) object (a repeating image).
   * @default "#000000" (Black)
   */
  color?: CanvasColorResolvable;
}
export type GradientOption = LinearGradientOption | RadialGradientOption;
export interface LinearGradientOption {
  /**
   * @default 0
   */
  x0?: number;
  /**
   * @default 0
   */
  y0?: number;
  /**
   * @default 0
   */
  x1?: number;
  /**
   * @default 0
   */
  y1?: number;
  timestamp: GradientTimestamps[];
}
export interface RadialGradientOption extends LinearGradientOption {
  /**
   * @default 0
   */
  r0?: number;
  /**
   * @default 0
   */
  r1?: number;
}
export interface GradientTimestamps {
  /**
   * A number between `0` and `1`, inclusive, representing the position of the color stop. \
   * `0` represents the start of the gradient and `1` represents the end.
   */
  offset: number;
  /**
   * A CSS [`<color>`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value) value representing the color of the stop.
   */
  color: string;
}
export interface BaseComponent<ComponentType extends CanvasComponentType> {
  /**
   * The type of the option. See {@link CanvasComponentType}.
   */
  type: ComponentType;
}

export type DrawOption = ImageOption | TextOption | OperationOption;
export type AnyCanvasComponent = CanvasContainer | DrawOption;
export interface CanvasContainer
  extends BaseComponent<CanvasComponentType.Container>, Offset, Size {
  /**
   * The components of the container.
   */
  components: AnyCanvasComponent[];
  /**
   * The mapping from font families (names) to the paths for the font file.
   */
  fonts?: Record<string, string>;
}

export interface ShadowOption extends Offset {
  /**
   * The color of shadows.
   * @default "rgba(0, 0, 0, 0.00)"
   */
  color: string;
  /**
   * The amount of blur applied to shadows. @default 0 (no blur)
   */
  blur: number;
}
export type CanvasOptionType = Exclude<CanvasComponentType, CanvasComponentType.Container>;
export interface BaseDrawOption<OptionType extends CanvasOptionType>
  extends BaseComponent<OptionType>, Offset, Color {
  /**
   * The alpha (transparency) value that is applied to shapes and images before they are drawn onto the canvas. \
   * A number between `0.0` (fully transparent) and `1.0` (fully opaque), inclusive.
   * @default 1.0 (Opaque)
   */
  alpha?: number;
  /**
   * The option how shadows are drawn. \
   * Shadows are only drawn if the `color` property is set to a non-transparent value. \
   * One of the `blur`, `offsetX`, or `offsetY` properties must be non-zero, as well.
   */
  shadow?: RequireOneWith<ShadowOption, "color">;
  /**
   * Whether to stroke (outline) the shapes or not. (The color is `black`.) \
   * If a color is given, the shapes are stroked with it.
   */
  stroke?: boolean | CanvasColorResolvable;
}

export interface BaseImageOption<T extends CanvasOptionType> extends BaseDrawOption<T>, Size {}

export type ImageOption =
  | ImageOptionRectangle
  | ImageOptionRoundRectangle
  | ImageOptionArc
  | ImageOptionEllipse
  | ImageLoadOption;
export interface ImageOptionRectangle extends BaseImageOption<CanvasComponentType.Rectangle> {}
export interface ImageOptionRoundRectangle extends BaseImageOption<CanvasComponentType.Round> {
  /**
   * A number or list specifying the radii of the circular arc to be used for the corners of the rectangle. \
   * The number and order of the radii function in the same way as the border-radius CSS property
   * when `width` and `height` are positive:
   * * `all-corners`
   * * `[all-corners]`
   * * `[top-left-and-bottom-right, top-right-and-bottom-left]`
   * * `[top-left, top-right-and-bottom-left, bottom-right]`
   * * `[top-left, top-right, bottom-right, bottom-left]`
   */
  radii?: number | number[];
}

export interface BaseCircleShapes<ComponentType extends CanvasOptionType> extends Omit<
  BaseDrawOption<ComponentType>,
  "size"
> {
  /**
   * The angle at which the shape starts / ends in radians, measured from the positive x-axis. \
   * The format is `[start, end]`.
   */
  angle: Vector2D;
  /**
   * An optional boolean value.
   * If true, draws the shape counter-clockwise between the start and end angles.
   * @default false
   */
  counterClockWise?: boolean;
}
export interface ImageOptionArc extends BaseCircleShapes<CanvasComponentType.Arc> {
  /**
   * The arc's radius. Must be positive.
   */
  radius: number;
}
export interface ImageOptionEllipse extends BaseCircleShapes<CanvasComponentType.Ellipse> {
  /**
   * The ellipse's axis radius. Must be non-negative.
   * The format is `[major, minor]`.
   */
  radius: Vector2D;
  /**
   * The rotation of the ellipse, expressed in radians.
   */
  rotation: number;
}
export interface ImageLoadOption extends Omit<
  BaseImageOption<CanvasComponentType.File>,
  "color" | "stroke"
> {
  /**
   * The path for the image file.
   */
  path: PathLike;
}
export interface TextOption extends BaseDrawOption<CanvasComponentType.Text> {
  /**
   * The text to draw.
   */
  text: string;
  /**
   * A prioritized list of one or more font family names and/or generic family names.
   * * `"<family-name>"`
   * The name of a font family.
   * * `"<generic-name>"`
   * Generic font families are a fallback mechanism, a means of preserving some of the style sheet \
   * author's intent when none of the specified fonts are available. \
   * Generic family names are keywords and must not be quoted. \
   * A generic font family should be the last item in the list of font family names. \
   * The following keywords are defined:
   *   * `"serif"`
   * Glyphs have finishing strokes, flared or tapering ends, or have actual serifed endings. \
   * For example: Lucida Bright, Lucida Fax, Palatino, Palatino Linotype, Palladio, URW Palladio, serif.
   *   * `"sans-serif"`
   * Glyphs have stroke endings that are plain. \
   * For example: Open Sans, Fira Sans, Lucida Sans, Lucida Sans Unicode, Trebuchet MS, Liberation Sans, Nimbus Sans L, sans-serif.
   *   * `"monospace"`
   * All glyphs have the same fixed width. \
   * For example: Fira Mono, DejaVu Sans Mono, Menlo, Consolas, Liberation Mono, Monaco, Lucida Console, monospace.
   *   * `"cursive"`
   * Glyphs in cursive fonts generally have either joining strokes or other cursive characteristics \
   * beyond those of italictypefaces. The glyphs are partially or completely connected, and the \
   * result looks more like handwritten pen or brush writing than printed letter work. \
   * For example: Brush Script MT, Brush Script Std, Lucida Calligraphy, Lucida Handwriting, Apple Chancery, cursive.
   *   * `"fantasy"`
   * Fantasy fonts are primarily decorative fonts that contain playful representations of characters. \
   * For example: Papyrus, Herculanum, Party LET, Curlz MT, Harrington, fantasy.
   *   * `"system-ui"`
   * Glyphs are taken from the default user export interface font on a given platform. \
   * Because typographic traditions vary widely across the world, this generic is provided for \
   * typefaces that don't map cleanly into the other generics.
   *   * `"ui-serif"`
   * The default user export interface serif font.
   *   * `"ui-sans-serif"`
   * The default user export interface sans-serif font.
   *   * `"ui-monospace"`
   * The default user export interface monospace font.
   *   * `"ui-rounded"`
   * The default user export interface font that has rounded features.
   *   * `"fangsong"`
   * A particular style of Chinese characters that are between serif-style Song and cursive-style Kai forms. \
   * This style is often used for government documents.
   * @default "sans-serif"
   */
  font?: string;
  /**
   * The size of the font.
   * * `"<length>"`
   * A positive [\<length>](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length) value.
   * For most font-relative units (such as `em` and `ex`), \
   * the font size is relative to the parent element's font size. \
   * For font-relative units that are root-based (such as `rem`), the font size is relative to the \
   * size of the font used by the <html> (root) element.
   * * `"<percentage>"`
   * A positive [\<percentage>](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/length) value,
   * relative to the parent element's font size.
   * * `<number>`
   * The font size, in pixels.
   */
  fontSize?: string | number;
  /**
   * The weight (or boldness) of the font.
   * * `"normal"` Normal font weight. Same as `400`.
   * * `"bold"` Bold font weight. Same as `700`.
   * * `<number>`  A \<number> value between 1 and 1000, both values included. Higher numbers represent weights \
   * that are bolder than (or as bold as) lower numbers. This allows fine-grain control for [variable fonts](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-weight#variable_fonts). \
   * For non-variable fonts, if the exact specified weight is unavailable, a [fallback weight](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-weight#fallback_weights) algorithm is \
   * used — numeric values that are divisible by 100 correspond to common weight names, as described \
   * in the [Common weight name mapping](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-weight#common_weight_name_mapping).
   * * `"lighter"` One relative font weight lighter than the parent element. Note that only four font weights are \
   * considered for relative weight calculation; see [the Meaning of relative weights](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-weight#meaning_of_relative_weights).
   * * `"bolder"` One relative font weight heavier than the parent element. Note that only four font weights are \
   * considered for relative weight calculation; see [the Meaning of relative weights](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/font-weight#meaning_of_relative_weights).
   * @default "normal"
   */
  fontWeight?: CanvasFontWeight;
  /**
   * The maximum number of pixels wide the text may be once rendered. \
   * If not specified, there is no limit to the width of the text. \
   * However, if this value is provided, the user agent will adjust the kerning, \
   * select a more horizontally condensed font (if one is available or can be generated without loss of quality), \
   * or scale down to a smaller font size in order to fit the text in the specified width.
   */
  maxWidth?: number;
  /**
   * The text alignment used when drawing text. \
   * Possible values:
   * * `"left"` The text is left-aligned.
   * * `"right"` The text is right-aligned.
   * * `"center"` The text is centered.
   * * `"start"` The text is aligned at the normal start of the line \
   * (left-aligned for left-to-right locales, right-aligned for right-to-left locales).
   * * `"end"` The text is aligned at the normal end of the line \
   * (right-aligned for left-to-right locales, left-aligned for right-to-left locales).
   * @default "start"
   */
  textAlign?: CanvasTextAlign;
}
export interface OperationOption extends BaseComponent<CanvasComponentType.Operation> {
  operation: (ctx: CanvasRenderingContext2D) => void;
}
export type CanvasFontWeight = "normal" | "bold" | "lighter" | "bolder" | number;

export interface MappedComponentTypes {
  [CanvasComponentType.Container]: ContainerBuilder;
  [CanvasComponentType.Rectangle]: RectComponentBuilder;
  [CanvasComponentType.Round]: RoundRectComponentBuilder;
  [CanvasComponentType.Arc]: ArcComponentBuilder;
  [CanvasComponentType.Ellipse]: EllipseComponentBuilder;
  [CanvasComponentType.File]: FileComponentBuilder;
  [CanvasComponentType.Text]: TextComponentBuilder;
  [CanvasComponentType.Operation]: OperationComponentBuilder;
}
export type ComponentOrBuilder<ComponentType extends CanvasComponentType> =
  | Extract<AnyCanvasComponent, { type: ComponentType }>
  | MappedComponentTypes[ComponentType]
  | Projection<MappedComponentTypes[ComponentType]>;
export type AnyCanvasBuilder = MappedComponentTypes[CanvasComponentType];
