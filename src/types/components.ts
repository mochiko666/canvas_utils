import type {
  CanvasFillRule,
  CanvasLineCap,
  CanvasLineJoin,
  CanvasRenderingContext2D,
  CanvasTextBaseline,
  DOMMatrix,
  GlobalCompositeOperation,
} from "canvas";
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
import type { Projection, RequireOne, RequireOneWith } from "./utils.js";
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
export type CanvasColorResolvable = string | GradientOption | PatternOption;
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
   * The x-axis coordinate of the start point.
   * @default 0
   */
  x0?: number;
  /**
   * The y-axis coordinate of the start point.
   * @default 0
   */
  y0?: number;
  /**
   * The x-axis coordinate of the end point.
   * @default 0
   */
  x1?: number;
  /**
   * The y-axis coordinate of the end point.
   * @default 0
   */
  y1?: number;
  stops: GradientColorStops[];
}
export interface RadialGradientOption extends LinearGradientOption {
  /**
   * The radius of the start circle. Must be non-negative and finite.
   * @default 0
   */
  r0?: number;
  /**
   * The radius of the end circle. Must be non-negative and finite.
   * @default 0
   */
  r1?: number;
}
export interface GradientColorStops {
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
export type CanvasPatternRepetition = "repeat" | "repeat-x" | "repeat-y" | "no-repeat" | "" | null;
export interface PatternOption {
  path: PathLike;
  repetition: CanvasPatternRepetition;
  transform?: DOMMatrix;
}
export interface BaseComponent<ComponentType extends CanvasComponentType> {
  /**
   * The type of the option. See {@link CanvasComponentType}.
   */
  type: ComponentType;
}
export interface BaseDrawComponent<ComponentType extends CanvasComponentType>
  extends BaseComponent<ComponentType>, Offset {
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
   * The type of compositing operation to apply when drawing new shapes. \
   * This may be any of the following values:
   * * `"source-over"` New Shapes are drawn on top of the existing canvas content.
   * * `"source-in"` The new shape is drawn only where both the new shape and the destination canvas overlap. Everything else is made transparent.
   * * `"source-out"` The new shape is drawn where it doesn't overlap the existing canvas content.
   * * `"source-atop"` The new shape is only drawn where it overlaps the existing canvas content.
   * * `"destination-over"` New shapes are drawn behind the existing canvas content.
   * * `"destination-in"` The existing canvas content is kept where both the new shape and existing canvas content overlap. Everything else is made transparent.
   * * `"destination-out"` The existing content is kept where it doesn't overlap the new shape.
   * * `"destination-atop"` The existing canvas is only kept where it overlaps the new shape. The new shape is drawn behind the canvas content.
   * * `"lighter"` Where both shapes overlap, the color is determined by adding color values.
   * * `"copy"` Only the new shape is shown.
   * * `"xor"` Shapes are made transparent where both overlap and drawn normal everywhere else.
   * * `"multiply"` The pixels of the top layer are multiplied with the corresponding pixels of the bottom layer. A darker picture is the result.
   * * `"screen"` The pixels are inverted, multiplied, and inverted again. A lighter picture is the result (opposite of `multiply`)
   * * `"overlay"` A combination of `multiply` and `screen`. Dark parts on the base layer become darker, and light parts become lighter.
   * * `"darken"` Retains the darkest pixels of both layers.
   * * `"lighten"` Retains the lightest pixels of both layers.
   * * `"color-dodge"` Divides the bottom layer by the inverted top layer.
   * * `"color-burn"` Divides the inverted bottom layer by the top layer, and then inverts the result.
   * * `"hard-light"` Like `overlay`, a combination of `multiply` and `screen` — but instead with the top layer and bottom layer swapped.
   * * `"soft-light"` A softer version of `hard-light`. Pure black or white does not result in pure black or white.
   * * `"difference"` Subtracts the bottom layer from the top layer — or the other way round — to always get a positive value.
   * * `"exclusion"` Like `difference`, but with lower contrast.
   * * `"hue"` Preserves the luma and chroma of the bottom layer, while adopting the hue of the top layer.
   * * `"saturation"` Preserves the luma and hue of the bottom layer, while adopting the chroma of the top layer.
   * * `"color"` Preserves the luma of the bottom layer, while adopting the hue and chroma of the top layer.
   * * `"luminosity"` Preserves the hue and chroma of the bottom layer, while adopting the luma of the top layer.
   * @default "source-over"
   */
  composite?: GlobalCompositeOperation;
  /**
   * Used to scale, rotate, translate (move), and skew the context.
   */
  transforms?: CanvasTransformOption[];
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
export type CanvasTransformOption =
  | TranslateOption
  | RotateOption
  | ScaleOption
  | RequireOne<TransformOption>
  | MatrixOption;
export interface TranslateOption {
  /**
   * Distance to move. Positive values are to the right, and negative to the left.
   */
  translate: Vector2D;
}
export interface RotateOption {
  /**
   * The rotation angle, clockwise in radians.
   */
  angle: number;
}
export interface ScaleOption {
  /**
   * Scaling factor in the horizontal / vertical direction. \
   * A negative value flips pixels across the vertical / horizontal axis. \
   * A value of 1 results in no scaling.
   */
  scale: Vector2D;
}
export interface TransformOption {
  /**
   * The cell in the first row and first column of the matrix.
   * @default 0
   */
  a: number;
  /**
   * The cell in the second row and first column of the matrix.
   * @default 0
   */
  b: number;
  /**
   * The cell in the first row and second column of the matrix.
   * @default 0
   */
  c: number;
  /**
   * The cell in the second row and second column of the matrix.
   * @default 0
   */
  d: number;
  /**
   * The cell in the first row and third column of the matrix.
   * @default 0
   */
  e: number;
  /**
   * The cell in the second row and third column of the matrix.
   * @default 0
   */
  f: number;
}
export interface MatrixOption {
  /**
   * The transformation matrix to set.
   */
  matrix: DOMMatrix;
}
export interface BaseImageComponent<ComponentType extends CanvasComponentType>
  extends BaseDrawComponent<ComponentType>, Size {}
export type DrawOption = ShapeOption | ImageOption | TextOption;
export type DrawComponent = CanvasContainer | DrawOption;
export type AnyCanvasComponent = DrawComponent | OperationOption;
export interface CanvasContainer extends BaseImageComponent<CanvasComponentType.Container> {
  /**
   * The components of the container.
   */
  components: AnyCanvasComponent[];
  /**
   * The mapping from font families (names) to the paths for the font file.
   */
  fonts?: Record<string, string>;
}

export type CanvasOptionType = Exclude<CanvasComponentType, CanvasComponentType.Container>;
export interface BaseOption<OptionType extends CanvasOptionType>
  extends BaseDrawComponent<OptionType>, Color {
  /**
   * Whether to stroke (outline) the shapes or not. (The color is `black`.) \
   * If an option is given, the shapes are stroked with it.
   */
  stroke?: boolean | StrokeOption;
}
export interface StrokeOption extends Color {
  /**
   * The line width, in coordinate space units. \
   * Zero, negative, Infinity, and NaN values are ignored.
   * @default 1.0
   */
  width?: number;
  /**
   * The shape used to draw the end points of lines. \
   * One of the following:
   * * `"butt"` The ends of lines are squared off at the endpoints.
   * * `"round"` The ends of lines are rounded.
   * * `"square"` The ends of lines are squared off by adding a box with an equal width and half the height of the line's thickness.
   * @default "butt"
   */
  cap?: CanvasLineCap;
  /**
   * The shape used to join two line segments where they meet. \
   * There are three possible values for this property:
   * * `"round"` Rounds off the corners of a shape by filling an additional sector of disc centered at the common endpoint of connected segments. The radius for these rounded corners is equal to the line width.
   * * `"bevel"` Fills an additional triangular area between the common endpoint of connected segments, and the separate outside rectangular corners of each segment.
   * * `"miter"` Connected segments are joined by extending their outside edges to connect at a single point, with the effect of filling an additional lozenge-shaped area. This setting is affected by the `miterLimit` property.
   * @default "miter"
   */
  join?: CanvasLineJoin;
  /**
   * An array of values that specify alternating lengths of lines and gaps which describe the pattern.
   * @default [] (Solid)
   */
  dash?: number[];
  /**
   * The offset of the line dash.
   * @default 0.0
   */
  dashOffset?: number;
  /**
   * The miter limit ratio, in coordinate space units. \
   * Zero, negative, `Infinity`, and NaN values are ignored.
   * @default 10.0
   */
  miterLimit?: number;
}
export interface BaseShapeOption<
  OptionType extends CanvasOptionType,
> extends BaseOption<OptionType> {
  /**
   * Whether or not to turn the shape path into the clipping region. \
   * If a fill rule is given, the shape is clipped by the rule.
   */
  clip: boolean | CanvasFillRule;
}
export interface BaseSizedShapeOption<OptionType extends CanvasOptionType>
  extends BaseOption<OptionType>, Size {}

export type ShapeOption = RectangleOption | RoundRectangleOption | ArcOption | EllipseOption;
export interface RectangleOption extends BaseSizedShapeOption<CanvasComponentType.Rectangle> {}
export interface RoundRectangleOption extends BaseSizedShapeOption<CanvasComponentType.Round> {
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

export interface BaseCircleOption<
  ComponentType extends CanvasComponentType.Arc | CanvasComponentType.Ellipse,
> extends BaseOption<ComponentType> {
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
export interface ArcOption extends BaseCircleOption<CanvasComponentType.Arc> {
  /**
   * The arc's radius. Must be positive.
   */
  radius: number;
}
export interface EllipseOption extends BaseCircleOption<CanvasComponentType.Ellipse> {
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
export interface ImageOption extends BaseImageComponent<CanvasComponentType.File> {
  /**
   * The path for the image file.
   */
  path: PathLike;
}
export interface TextOption extends BaseOption<CanvasComponentType.Text> {
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
  /**
   * The text baseline used when drawing text. \
   * Possible values:
   * * `"top"` The text baseline is the top of the em square.
   * * `"hanging"` The text baseline is the hanging baseline. (Used by Tibetan and other Indic scripts.)
   * * `"middle"` The text baseline is the middle of the em square.
   * * `"alphabetic"` The text baseline is the normal [alphabetic baseline](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Typography).
   * * `"ideographic"` The text baseline is the ideographic baseline; this is the bottom of the body of the characters, if the main body of characters protrudes beneath the alphabetic baseline. (Used by Chinese, Japanese, and Korean scripts.)
   * * `"bottom"` The text baseline is the bottom of the bounding box. This differs from the ideographic baseline in that the ideographic baseline doesn't consider descenders.
   * @default "alphabetic"
   */
  textBaseline?: CanvasTextBaseline;
  /**
   * The text direction used to draw text.
   * Possible values:
   * * `"ltr"` The text direction is left-to-right.
   * * `"rtl"` The text direction is right-to-left.
   * @remarks `"inherit"` keyword is Not supported as of now.
   * @default "ltr"
   */
  direction?: "ltr" | "rtl";
  /**
   * The language of the canvas drawing context.
   * This property can take one of the following string values:
   * * A [BCP 47 language tag](https://developer.mozilla.org/en-US/docs/Glossary/BCP_47_language_tag) representing the language of the canvas context.
   * * An empty string (""), which can be set to specify that the canvas context has no language.
   * @remarks `"inherit"` keyword is Not supported as of now.
   * @default ""
   */
  lang?: string;
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
