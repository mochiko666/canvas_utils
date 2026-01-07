import type { CanvasRenderingContext2D } from "canvas";
import type { PathLike } from "node:fs";
import { CanvasComponentType } from "../enums/canvas.js";
import type {
  AnyCanvasComponent,
  CanvasColorResolvable,
  CanvasContainer,
  CanvasFontWeight,
  CanvasRoot,
  ComponentOrBuilder,
  ContainerComponentBuilder,
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
  public constructor(public data: Partial<DataType> = {}) {}
  /**
   * Curried {@link Object.assign}.
   * @param data The source object from which to copy properties.
   * @returns The builder with the data merged. So you can chain methods like;
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
  abstract build(): DataType;
}
export class RootBuilder extends CanvasComponentBuilder<CanvasRoot> {
  public containers: ContainerBuilder[];
  public constructor({ containers, ...data }: Partial<CanvasRoot> = {}) {
    super({ type: CanvasComponentType.Root, ...data });
    this.containers = containers?.map((c) => resolveBuilder(c, ContainerBuilder)) ?? [];
  }
  public setSize = (width: number, height: number): this => this.assign({ size: [width, height] });
  public setContainers(...containers: ComponentOrBuilder<CanvasComponentType.Container>[]): this {
    this.containers = containers.map((c) => resolveBuilder(c, ContainerBuilder));
    return this;
  }
  public addContainers(...containers: ComponentOrBuilder<CanvasComponentType.Container>[]): this {
    this.containers.push(...containers.map((c) => resolveBuilder(c, ContainerBuilder)));
    return this;
  }
  /**
   * Removes, replaces, or inserts containers for this root component.
   *
   * @param start - The index to start removing, replacing or inserting containers.
   * @param deleteCount - The amount of containers to remove.
   * @param components - The containers to set.
   */
  public spliceContainers(
    start: number,
    deleteCount: number,
    ...items: ComponentOrBuilder<CanvasComponentType.Container>[]
  ): this {
    this.containers.splice(
      start,
      deleteCount,
      ...items.map((c) => resolveBuilder(c, ContainerBuilder))
    );
    return this;
  }
  public build = (): CanvasRoot => ({
    type: CanvasComponentType.Root,
    size: [0, 0],
    ...this.data,
    containers: this.containers.map((container) => container.build()),
  });
}
export class ContainerBuilder extends CanvasComponentBuilder<CanvasContainer> {
  public components: ContainerComponentBuilder[];
  public constructor({ components, ...data }: Partial<CanvasContainer> = {}) {
    super({ type: CanvasComponentType.Container, ...data });
    this.components = components?.map((component) => createComponentBuilder(component)) ?? [];
  }
  public setOffset = (x: number, y: number): this => this.assign({ offset: [x, y] });
  public setSize = (width: number, height: number): this => this.assign({ size: [width, height] });
  public setFonts = (fonts: Record<string, string>): this => this.assign({ fonts });
  public addFonts(fonts: Record<string, string>): this {
    this.data.fonts = Object.assign(this.data.fonts ?? {}, fonts);
    return this;
  }
  public addFont = (family: string, path: string): this => this.addFonts({ [family]: path });
  public addRectComponents(
    ...components: ComponentOrBuilder<CanvasComponentType.Rectangle>[]
  ): this {
    this.components.push(...components.map((c) => resolveBuilder(c, RectComponentBuilder)));
    return this;
  }
  public addRoundComponents(...components: ComponentOrBuilder<CanvasComponentType.Round>[]): this {
    this.components.push(...components.map((c) => resolveBuilder(c, RoundRectComponentBuilder)));
    return this;
  }
  public addArcComponents(...components: ComponentOrBuilder<CanvasComponentType.Arc>[]): this {
    this.components.push(...components.map((c) => resolveBuilder(c, ArcComponentBuilder)));
    return this;
  }
  public addEllipseComponents(
    ...components: ComponentOrBuilder<CanvasComponentType.Ellipse>[]
  ): this {
    this.components.push(...components.map((c) => resolveBuilder(c, EllipseComponentBuilder)));
    return this;
  }
  public addFileComponents(...components: ComponentOrBuilder<CanvasComponentType.File>[]): this {
    this.components.push(...components.map((c) => resolveBuilder(c, FileComponentBuilder)));
    return this;
  }
  public addTextComponents(...components: ComponentOrBuilder<CanvasComponentType.Text>[]): this {
    this.components.push(...components.map((c) => resolveBuilder(c, TextComponentBuilder)));
    return this;
  }
  public addOperationComponents(
    ...components: ComponentOrBuilder<CanvasComponentType.Operation>[]
  ): this {
    this.components.push(...components.map((c) => resolveBuilder(c, OperationComponentBuilder)));
    return this;
  }
  public setComponents = (...components: DrawOption[]): this => this.assign({ components });
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
    ...items: (DrawOption | ContainerComponentBuilder)[]
  ): this {
    this.components.splice(
      start,
      deleteCount,
      ...items.map((item) => createComponentBuilder(item))
    );
    return this;
  }
  public build = (): CanvasContainer => ({
    type: CanvasComponentType.Container,
    offset: [0, 0],
    size: [0, 0],
    ...this.data,
    components: this.components.map((component) => component.build()),
  });
}
abstract class CanvasOptionBuilder<
  OptionType extends ImageOption | TextOption
> extends CanvasComponentBuilder<OptionType> {
  public setOffset(x: number, y: number): this {
    this.data.offset = [x, y];
    return this;
  }
  public setAlpha(alpha: number): this {
    this.data.alpha = alpha;
    return this;
  }
  public setShadow(shadow: RequireOneWith<ShadowOption, "color">): this {
    this.data.shadow = shadow;
    return this;
  }
}
export class RectComponentBuilder extends CanvasOptionBuilder<ImageOptionRectangle> {
  public setSize = (width: number, height: number): this => this.assign({ size: [width, height] });
  public setColor = (color: CanvasColorResolvable): this => this.assign({ color });
  public setStroke = (stroke: boolean | CanvasColorResolvable): this => this.assign({ stroke });
  public build = (): ImageOptionRectangle => ({
    type: CanvasComponentType.Rectangle,
    offset: [0, 0],
    size: [0, 0],
    ...this.data,
  });
}
export class RoundRectComponentBuilder extends CanvasOptionBuilder<ImageOptionRoundRectangle> {
  public setSize = (width: number, height: number): this => this.assign({ size: [width, height] });
  public setColor = (color: CanvasColorResolvable): this => this.assign({ color });
  public setStroke = (stroke: boolean | CanvasColorResolvable): this => this.assign({ stroke });
  public setRadii = (radii: number | number[]): this => this.assign({ radii });
  public build = (): ImageOptionRoundRectangle => ({
    type: CanvasComponentType.Round,
    offset: [0, 0],
    size: [0, 0],
    ...this.data,
  });
}
export class ArcComponentBuilder extends CanvasOptionBuilder<ImageOptionArc> {
  public setColor = (color: CanvasColorResolvable): this => this.assign({ color });
  public setStroke = (stroke: boolean | CanvasColorResolvable): this => this.assign({ stroke });
  public setRadius = (radius: number): this => this.assign({ radius });
  public setAngle = (start: number, end: number): this => this.assign({ angle: [start, end] });
  public setCounterClockWise = (counterClockWise: boolean): this =>
    this.assign({ counterClockWise });
  public build = (): ImageOptionArc => ({
    type: CanvasComponentType.Arc,
    offset: [0, 0],
    radius: 0,
    angle: [0, 0],
    ...this.data,
  });
}
export class EllipseComponentBuilder extends CanvasOptionBuilder<ImageOptionEllipse> {
  public setColor = (color: CanvasColorResolvable): this => this.assign({ color });
  public setStroke = (stroke: boolean | CanvasColorResolvable): this => this.assign({ stroke });
  public setRadius = (major: number, minor: number): this =>
    this.assign({ radius: [major, minor] });
  public setRotation = (rotation: number): this => this.assign({ rotation });
  public setAngle = (start: number, end: number): this => this.assign({ angle: [start, end] });
  public setCounterClockWise = (counterClockWise: boolean): this =>
    this.assign({ counterClockWise });
  public build = (): ImageOptionEllipse => ({
    type: CanvasComponentType.Ellipse,
    offset: [0, 0],
    radius: [0, 0],
    rotation: 0,
    angle: [0, 0],
    ...this.data,
  });
}
export class FileComponentBuilder extends CanvasOptionBuilder<ImageLoadOption> {
  public setSize = (width: number, height: number): this => this.assign({ size: [width, height] });
  public setPath = (path: PathLike): this => this.assign({ path });
  public build = (): ImageLoadOption => ({
    type: CanvasComponentType.File,
    path: "",
    offset: [0, 0],
    size: [0, 0],
    ...this.data,
  });
}
export class TextComponentBuilder extends CanvasOptionBuilder<TextOption> {
  public constructor(data?: Partial<TextOption>) {
    super({ type: CanvasComponentType.Text, ...data });
  }
  public setColor = (color: CanvasColorResolvable): this => this.assign({ color });
  public setStroke = (stroke: boolean | CanvasColorResolvable): this => this.assign({ stroke });
  public setText = (text: string): this => this.assign({ text });
  public setFontFamily = (font: string): this => this.assign({ font });
  public setFontSize = (fontSize: string | number): this => this.assign({ fontSize });
  public setFontWeight = (fontWeight: CanvasFontWeight): this => this.assign({ fontWeight });
  public setFont = (font: string, fontSize: string | number, fontWeight: CanvasFontWeight): this =>
    this.assign({ font, fontSize, fontWeight });
  public setMaxWidth = (maxWidth: number): this => this.assign({ maxWidth });
  public setTextAlign = (textAlign: CanvasTextAlign): this => this.assign({ textAlign });
  public build = (): TextOption => ({
    type: CanvasComponentType.Text,
    text: "",
    offset: [0, 0],
    ...this.data,
  });
}
export class OperationComponentBuilder extends CanvasComponentBuilder<OperationOption> {
  public setOperation = (operation: (ctx: CanvasRenderingContext2D) => void): this =>
    this.assign({ operation });
  public build = (): OperationOption => ({
    type: CanvasComponentType.Operation,
    operation: (ctx) => undefined,
    ...this.data,
  });
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
  [CanvasComponentType.Root]: RootBuilder,
  [CanvasComponentType.Container]: ContainerBuilder,
  [CanvasComponentType.Rectangle]: RectComponentBuilder,
  [CanvasComponentType.Round]: RoundRectComponentBuilder,
  [CanvasComponentType.Arc]: ArcComponentBuilder,
  [CanvasComponentType.Ellipse]: EllipseComponentBuilder,
  [CanvasComponentType.File]: FileComponentBuilder,
  [CanvasComponentType.Text]: TextComponentBuilder,
  [CanvasComponentType.Operation]: OperationComponentBuilder,
};

function createComponentBuilder<ComponentType extends keyof MappedComponentTypes>(
  data: Extract<AnyCanvasComponent, { type: ComponentType }> | MappedComponentTypes[ComponentType]
): MappedComponentTypes[ComponentType] {
  if (data instanceof CanvasComponentBuilder) return data;
  return new builderMap[data.type](data);
}
