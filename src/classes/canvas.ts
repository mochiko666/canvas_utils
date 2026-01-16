import type { CanvasRenderingContext2D } from "canvas";
import type { PathLike } from "node:fs";
import { CanvasComponentType } from "../enums/canvas.js";
import type {
  AnyCanvasBuilder,
  AnyCanvasComponent,
  CanvasColorResolvable,
  CanvasContainer,
  CanvasFontWeight,
  DrawOption,
  ImageLoadOption,
  ImageOption,
  ImageOptionArc,
  ImageOptionEllipse,
  ImageOptionRectangle,
  ImageOptionRoundRectangle,
  MappedComponentTypes,
  OperationOption,
  ShadowOption,
  TextOption,
} from "../types/canvas.js";
import type { RequireOneWith } from "../types/utils.js";

abstract class CanvasComponentBuilder<DataType extends AnyCanvasComponent> {
  /**
   * Creates a new component builder from its corresponding data.
   * @param data The component data to create the builder with.
   */
  public constructor(public data: Partial<DataType> = {}) {}
  /**
   * Curried {@link Object.assign}.
   * @param data The source object from which to copy properties.
   * @returns The builder with the data merged. So you can chain methods like below;
   * ```ts
   * const root = new RootBuilder()
   *   .assign( { size: [666, 666] } )
   *   .addContainers((builder) => builder.setSize(60, 60));
   * ```
   */
  public assign(data?: Partial<DataType>): this {
    Object.assign(this.data, data);
    return this;
  }
  /**
   * @returns The component corresponding to the builder type.
   */
  abstract build(): DataType;
}
export class ContainerBuilder extends CanvasComponentBuilder<CanvasContainer> {
  /**
   * The components of the container.
   */
  public components: AnyCanvasBuilder[];
  public constructor({ components, ...data }: Partial<CanvasContainer> = {}) {
    super({ type: CanvasComponentType.Container, ...data });
    this.components = components?.map((component) => createComponentBuilder(component)) ?? [];
  }
  /**
   * Sets the offset for this container.
   * @param x The x-axis coordinate of the offset.
   * @param y The y-axis coordinate of the offset.
   */
  public setOffset(x: number, y: number): this {
    return this.assign({ offset: [x, y] });
  }
  /**
   * Sets the size for this container.
   * @param width The horizontal length.
   * @param height The vertical length.
   */
  public setSize(width: number, height: number): this {
    return this.assign({ size: [width, height] });
  }
  /**
   * Sets the fonts for this container.
   * @remarks The text components within this container can use custom fonts registered here.
   * @param fonts The fonts to use.
   */
  public setFonts(fonts: Record<string, string>): this {
    return this.assign({ fonts });
  }
  /**
   * Adds the fonts for this container.
   * @remarks The text components within this container can use custom fonts registered here.
   * @param fonts The fonts to add to this container.
   */
  public addFonts(fonts: Record<string, string>): this {
    this.data.fonts = Object.assign(this.data.fonts ?? {}, fonts);
    return this;
  }
  /**
   * Adds a font for this container.
   * @remarks The text components within this container can use custom fonts registered here.
   * @param family The family name of the font.
   * @param path The path for the font file.
   */
  public addFont(family: string, path: string): this {
    return this.addFonts({ [family]: path });
  }

  /**
   * Adds the containers to this root component.
   * @param containers The containers to add.
   */
  public addContainers(
    ...containers: (
      | CanvasContainer
      | ContainerBuilder
      | ((builder: ContainerBuilder) => ContainerBuilder)
    )[]
  ): this {
    this.components.push(...containers.map((c) => resolveBuilder(c, ContainerBuilder)));
    return this;
  }
  /**
   * Adds the rectangle components to this container.
   * @param components The components to add to this container.
   */
  public addRectComponents(
    ...components: (
      | ImageOptionRectangle
      | RectComponentBuilder
      | ((builder: RectComponentBuilder) => RectComponentBuilder)
    )[]
  ): this {
    this.components.push(...components.map((c) => resolveBuilder(c, RectComponentBuilder)));
    return this;
  }
  /**
   * Adds the round rectangle components to this container.
   * @param components The components to add to this container.
   */
  public addRoundComponents(
    ...components: (
      | ImageOptionRoundRectangle
      | RoundRectComponentBuilder
      | ((builder: RoundRectComponentBuilder) => RoundRectComponentBuilder)
    )[]
  ): this {
    this.components.push(...components.map((c) => resolveBuilder(c, RoundRectComponentBuilder)));
    return this;
  }
  /**
   * Adds the arc components to this container.
   * @param components The components to add to this container.
   */
  public addArcComponents(
    ...components: (
      | ImageOptionArc
      | ArcComponentBuilder
      | ((builder: ArcComponentBuilder) => ArcComponentBuilder)
    )[]
  ): this {
    this.components.push(...components.map((c) => resolveBuilder(c, ArcComponentBuilder)));
    return this;
  }
  /**
   * Adds the ellipse components to this container.
   * @param components The components to add to this container.
   */
  public addEllipseComponents(
    ...components: (
      | ImageOptionEllipse
      | EllipseComponentBuilder
      | ((builder: EllipseComponentBuilder) => EllipseComponentBuilder)
    )[]
  ): this {
    this.components.push(...components.map((c) => resolveBuilder(c, EllipseComponentBuilder)));
    return this;
  }
  /**
   * Adds the file components to this container.
   * @param components The components to add to this container.
   */
  public addFileComponents(
    ...components: (
      | ImageLoadOption
      | FileComponentBuilder
      | ((builder: FileComponentBuilder) => FileComponentBuilder)
    )[]
  ): this {
    this.components.push(...components.map((c) => resolveBuilder(c, FileComponentBuilder)));
    return this;
  }
  /**
   * Adds the text components to this container.
   * @param components The components to add to this container.
   */
  public addTextComponents(
    ...components: (
      | TextOption
      | TextComponentBuilder
      | ((builder: TextComponentBuilder) => TextComponentBuilder)
    )[]
  ): this {
    this.components.push(...components.map((c) => resolveBuilder(c, TextComponentBuilder)));
    return this;
  }
  /**
   * Adds the operation components to this container.
   * @param components The components to add to this container.
   */
  public addOperationComponents(
    ...components: (
      | OperationOption
      | OperationComponentBuilder
      | ((builder: OperationComponentBuilder) => OperationComponentBuilder)
    )[]
  ): this {
    this.components.push(...components.map((c) => resolveBuilder(c, OperationComponentBuilder)));
    return this;
  }
  public setComponents(...components: DrawOption[]): this {
    return this.assign({ components });
  }
  /**
   * Removes, replaces, or inserts components for this container.
   *
   * @param start - The index to start removing, replacing or inserting components.
   * @param deleteCount - The amount of components to remove.
   * @param components - The components to set.
   */
  public spliceComponents(
    start: number,
    deleteCount: number,
    ...items: (AnyCanvasComponent | AnyCanvasBuilder)[]
  ): this {
    this.components.splice(
      start,
      deleteCount,
      ...items.map((item) => createComponentBuilder(item))
    );
    return this;
  }
  public build(): CanvasContainer {
    return {
      type: CanvasComponentType.Container,
      offset: [0, 0],
      size: [0, 0],
      ...this.data,
      components: this.components.map((component) => component.build()),
    };
  }
}
abstract class CanvasOptionBuilder<
  OptionType extends ImageOption | TextOption
> extends CanvasComponentBuilder<OptionType> {
  /**
   * Sets the offset for this component.
   * @param x The x-axis coordinate of the offset.
   * @param y The y-axis coordinate of the offset.
   */
  public setOffset(x: number, y: number): this {
    this.data.offset = [x, y];
    return this;
  }
  /**
   * Sets the alpha for this component.
   * @param alpha The transparency to use.
   */
  public setAlpha(alpha: number): this {
    this.data.alpha = alpha;
    return this;
  }
  /**
   * Sets the shadow option for this component.
   * @remarks The shadow option must have `color` property. Also either `offset` or `blur` must be set for the shadow to render.
   * @param shadow The shadow option to use.
   */
  public setShadow(shadow: RequireOneWith<ShadowOption, "color">): this {
    this.data.shadow = shadow;
    return this;
  }
}
export class RectComponentBuilder extends CanvasOptionBuilder<ImageOptionRectangle> {
  /**
   * Sets the size for this component.
   * @param width The horizontal length of the rectangle.
   * @param height The vertical length of the rectangle.
   */
  public setSize(width: number, height: number): this {
    return this.assign({ size: [width, height] });
  }
  /**
   * Sets the color for this component.
   * @param color The color to use.
   */
  public setColor(color: CanvasColorResolvable): this {
    return this.assign({ color });
  }
  /**
   * Sets the stroke option for this component.
   * @param stroke Whether to stroke the shape, or the color to stroke with.
   */
  public setStroke(stroke: boolean | CanvasColorResolvable): this {
    return this.assign({ stroke });
  }
  public build(): ImageOptionRectangle {
    return {
      type: CanvasComponentType.Rectangle,
      offset: [0, 0],
      size: [0, 0],
      ...this.data,
    };
  }
}
export class RoundRectComponentBuilder extends CanvasOptionBuilder<ImageOptionRoundRectangle> {
  public setSize(width: number, height: number): this {
    return this.assign({ size: [width, height] });
  }
  /**
   * Sets the color for this component.
   * @param color The color to use.
   */
  public setColor(color: CanvasColorResolvable): this {
    return this.assign({ color });
  }
  /**
   * Sets the stroke option for this component.
   * @param stroke Whether to stroke the shape, or the color to stroke with.
   */
  public setStroke(stroke: boolean | CanvasColorResolvable): this {
    return this.assign({ stroke });
  }
  /**
   * Sets the radii for this component.
   * @param radii The border radius to use.
   */
  public setRadii(radii: number | number[]): this {
    return this.assign({ radii });
  }
  public build(): ImageOptionRoundRectangle {
    return {
      type: CanvasComponentType.Round,
      offset: [0, 0],
      size: [0, 0],
      ...this.data,
    };
  }
}
export class ArcComponentBuilder extends CanvasOptionBuilder<ImageOptionArc> {
  /**
   * Sets the color for this component.
   * @param color The color to use.
   */
  public setColor(color: CanvasColorResolvable): this {
    return this.assign({ color });
  }
  /**
   * Sets the stroke option for this component.
   * @param stroke Whether to stroke the shape, or the color to stroke with.
   */
  public setStroke(stroke: boolean | CanvasColorResolvable): this {
    return this.assign({ stroke });
  }
  /**
   * Sets the radius for this component.
   * @param radius The radius to use.
   */
  public setRadius(radius: number): this {
    return this.assign({ radius });
  }
  /**
   * Sets the angles for this component.
   * @param start The start angle to use.
   * @param end The end angle to use.
   */
  public setAngle(start: number, end: number): this {
    return this.assign({ angle: [start, end] });
  }
  /**
   * Sets the counter-clockwise option for this component.
   * @param counterClockWise Whether to draw the shape counter-clockwise.
   */
  public setCounterClockWise(counterClockWise: boolean): this {
    return this.assign({ counterClockWise });
  }
  public build(): ImageOptionArc {
    return {
      type: CanvasComponentType.Arc,
      offset: [0, 0],
      radius: 0,
      angle: [0, 0],
      ...this.data,
    };
  }
}
export class EllipseComponentBuilder extends CanvasOptionBuilder<ImageOptionEllipse> {
  /**
   * Sets the color for this component.
   * @param color The color to use.
   */
  public setColor(color: CanvasColorResolvable): this {
    return this.assign({ color });
  }
  /**
   * Sets the stroke option for this component.
   * @param stroke Whether to stroke the shape, or the color to stroke with.
   */
  public setStroke(stroke: boolean | CanvasColorResolvable): this {
    return this.assign({ stroke });
  }
  /**
   * Sets the radius for this component.
   * @param major The major-axis radius of the ellipse.
   * @param minor The minor-axis radius of the ellipse.
   */
  public setRadius(major: number, minor: number): this {
    return this.assign({ radius: [major, minor] });
  }
  /**
   * Sets the rotation for this component.
   * @param rotation The rotation to use.
   */
  public setRotation(rotation: number): this {
    return this.assign({ rotation });
  }
  /**
   * Sets the angles for this component.
   * @param start The start angle to use.
   * @param end The end angle to use.
   */
  public setAngle(start: number, end: number): this {
    return this.assign({ angle: [start, end] });
  }
  /**
   * Sets the counter-clockwise option for this component.
   * @param counterClockWise Whether to draw the shape counter-clockwise.
   */
  public setCounterClockWise(counterClockWise: boolean): this {
    return this.assign({ counterClockWise });
  }
  public build(): ImageOptionEllipse {
    return {
      type: CanvasComponentType.Ellipse,
      offset: [0, 0],
      radius: [0, 0],
      rotation: 0,
      angle: [0, 0],
      ...this.data,
    };
  }
}
export class FileComponentBuilder extends CanvasOptionBuilder<ImageLoadOption> {
  /**
   * Sets the size of the image.
   * @param width The horizontal length of the image.
   * @param height The vertical length of the image.
   */
  public setSize(width: number, height: number): this {
    return this.assign({ size: [width, height] });
  }
  /**
   * Sets the file path for this component.
   * @param path The path for the image file.
   */
  public setPath(path: PathLike): this {
    return this.assign({ path });
  }
  public build(): ImageLoadOption {
    return {
      type: CanvasComponentType.File,
      path: "",
      offset: [0, 0],
      size: [0, 0],
      ...this.data,
    };
  }
}
export class TextComponentBuilder extends CanvasOptionBuilder<TextOption> {
  public constructor(data?: Partial<TextOption>) {
    super({ type: CanvasComponentType.Text, ...data });
  }
  /**
   * Sets the color for this component.
   * @param color The color to use.
   */
  public setColor(color: CanvasColorResolvable): this {
    return this.assign({ color });
  }
  /**
   * Sets the stroke option for this component.
   * @param stroke Whether to stroke the text, or the color to stroke with.
   */
  public setStroke(stroke: boolean | CanvasColorResolvable): this {
    return this.assign({ stroke });
  }
  /**
   * Sets the text for this component.
   * @param text The text to draw.
   */
  public setText(text: string): this {
    return this.assign({ text });
  }
  /**
   * Sets the font for this component.
   * @param font The family name of the font.
   */
  public setFontFamily(font: string): this {
    return this.assign({ font });
  }
  /**
   * Sets the font size for this component.
   * @param fontSize The font size to use.
   */
  public setFontSize(fontSize: string | number): this {
    return this.assign({ fontSize });
  }
  /**
   * Sets the font weight for this component.
   * @param fontWeight The boldness of the font.
   */
  public setFontWeight(fontWeight: CanvasFontWeight): this {
    return this.assign({ fontWeight });
  }
  /**
   * Sets the font options for this component.
   * @example
   * ```ts
   * // "sans-serif 30px".
   * const text = new TextComponentBuilder().setFont("sans-serif", 30);
   * ```
   * @remarks To use custom fonts, register the font for the container which contains this text component.
   * ```ts
   * // "myfont 6in bold"
   * const container = new ContainerBuilder()
   *   .addTextComponents((option) => option.setFont("myfont", "6in", "bold"));
   * ```
   * @param font The family name of the font.
   * @param fontSize The size of the font.
   * @param fontWeight The boldness of the text. Defaults to `"normal"`.
   */
  public setFont(
    font: string,
    fontSize: string | number,
    fontWeight: CanvasFontWeight = "normal"
  ): this {
    return this.assign({ font, fontSize, fontWeight });
  }
  /**
   * Sets the max width for this component.
   * @param maxWidth The width limit to use.
   */
  public setMaxWidth(maxWidth: number): this {
    return this.assign({ maxWidth });
  }
  /**
   * Sets the text alignment for this component.
   * @param textAlign The alignment style to use.
   */
  public setTextAlign(textAlign: CanvasTextAlign): this {
    return this.assign({ textAlign });
  }
  public build(): TextOption {
    return {
      type: CanvasComponentType.Text,
      text: "",
      offset: [0, 0],
      ...this.data,
    };
  }
}
export class OperationComponentBuilder extends CanvasComponentBuilder<OperationOption> {
  public constructor(data?: Partial<OperationOption>) {
    super({ type: CanvasComponentType.Operation, ...data });
  }
  /**
   * Sets the operation for this component.
   * @param operation The operation to perform.
   */
  public setOperation(operation: (ctx: CanvasRenderingContext2D) => void): this {
    return this.assign({ operation });
  }
  public build(): OperationOption {
    return {
      type: CanvasComponentType.Operation,
      operation: (ctx) => undefined,
      ...this.data,
    };
  }
}
const resolveBuilder = <
  DataType extends AnyCanvasComponent,
  Builder extends CanvasComponentBuilder<DataType>
>(
  builder: DataType | Builder | ((builder: Builder) => Builder),
  constructor: new (data?: Partial<DataType>) => Builder
): Builder =>
  typeof builder === "function"
    ? builder(new constructor())
    : builder instanceof CanvasComponentBuilder
    ? builder
    : new constructor(builder);

const builderMap: {
  [K in keyof MappedComponentTypes]: new (data: any) => MappedComponentTypes[K];
} = {
  [CanvasComponentType.Container]: ContainerBuilder,
  [CanvasComponentType.Rectangle]: RectComponentBuilder,
  [CanvasComponentType.Round]: RoundRectComponentBuilder,
  [CanvasComponentType.Arc]: ArcComponentBuilder,
  [CanvasComponentType.Ellipse]: EllipseComponentBuilder,
  [CanvasComponentType.File]: FileComponentBuilder,
  [CanvasComponentType.Text]: TextComponentBuilder,
  [CanvasComponentType.Operation]: OperationComponentBuilder,
};

const createComponentBuilder = <ComponentType extends keyof MappedComponentTypes>(
  data: Extract<AnyCanvasComponent, { type: ComponentType }> | MappedComponentTypes[ComponentType]
): MappedComponentTypes[ComponentType] => {
  if (data instanceof CanvasComponentBuilder) return data;
  return new builderMap[data.type](data);
};
