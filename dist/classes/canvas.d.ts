import type { CanvasRenderingContext2D } from "canvas";
import type { PathLike } from "node:fs";
import { CanvasComponentType } from "../enums/canvas.js";
import type { AnyCanvasComponent, CanvasColorResolvable, CanvasContainer, CanvasFontWeight, CanvasRoot, ComponentOrBuilder, ContainerComponentBuilder, DrawOption, ImageLoadOption, ImageOption, ImageOptionArc, ImageOptionEllipse, ImageOptionRectangle, ImageOptionRoundRectangle, OperationOption, ShadowOption, TextOption } from "../types/canvas.js";
import type { RequireOneWith } from "../types/utils.js";
declare abstract class CanvasComponentBuilder<DataType extends AnyCanvasComponent> {
    data: Partial<DataType>;
    constructor(data?: Partial<DataType>);
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
    assign(data?: Partial<DataType>): this;
    abstract build(): DataType;
}
export declare class RootBuilder extends CanvasComponentBuilder<CanvasRoot> {
    containers: ContainerBuilder[];
    constructor({ containers, ...data }?: Partial<CanvasRoot>);
    setSize: (width: number, height: number) => this;
    setContainers(...containers: ComponentOrBuilder<CanvasComponentType.Container>[]): this;
    addContainers(...containers: ComponentOrBuilder<CanvasComponentType.Container>[]): this;
    /**
     * Removes, replaces, or inserts containers for this root component.
     *
     * @param start - The index to start removing, replacing or inserting containers.
     * @param deleteCount - The amount of containers to remove.
     * @param components - The containers to set.
     */
    spliceContainers(start: number, deleteCount: number, ...items: ComponentOrBuilder<CanvasComponentType.Container>[]): this;
    build: () => CanvasRoot;
}
export declare class ContainerBuilder extends CanvasComponentBuilder<CanvasContainer> {
    components: ContainerComponentBuilder[];
    constructor({ components, ...data }?: Partial<CanvasContainer>);
    setOffset: (x: number, y: number) => this;
    setSize: (width: number, height: number) => this;
    setFonts: (fonts: Record<string, string>) => this;
    addFonts(fonts: Record<string, string>): this;
    addFont: (family: string, path: string) => this;
    addRectComponents(...components: ComponentOrBuilder<CanvasComponentType.Rectangle>[]): this;
    addRoundComponents(...components: ComponentOrBuilder<CanvasComponentType.Round>[]): this;
    addArcComponents(...components: ComponentOrBuilder<CanvasComponentType.Arc>[]): this;
    addEllipseComponents(...components: ComponentOrBuilder<CanvasComponentType.Ellipse>[]): this;
    addFileComponents(...components: ComponentOrBuilder<CanvasComponentType.File>[]): this;
    addTextComponents(...components: ComponentOrBuilder<CanvasComponentType.Text>[]): this;
    addOperationComponents(...components: ComponentOrBuilder<CanvasComponentType.Operation>[]): this;
    setComponents: (...components: DrawOption[]) => this;
    /**
     * Removes, replaces, or inserts components for this container.
     *
     * @param start - The index to start removing, replacing or inserting components.
     * @param deleteCount - The amount of components to remove.
     * @param components - The components to set.
     */
    spliceComponents(start: number, deleteCount: number, ...items: (DrawOption | ContainerComponentBuilder)[]): this;
    build: () => CanvasContainer;
}
declare abstract class CanvasOptionBuilder<OptionType extends ImageOption | TextOption> extends CanvasComponentBuilder<OptionType> {
    setOffset(x: number, y: number): this;
    setAlpha(alpha: number): this;
    setShadow(shadow: RequireOneWith<ShadowOption, "color">): this;
}
export declare class RectComponentBuilder extends CanvasOptionBuilder<ImageOptionRectangle> {
    setSize: (width: number, height: number) => this;
    setColor: (color: CanvasColorResolvable) => this;
    setStroke: (stroke: boolean | CanvasColorResolvable) => this;
    build: () => ImageOptionRectangle;
}
export declare class RoundRectComponentBuilder extends CanvasOptionBuilder<ImageOptionRoundRectangle> {
    setSize: (width: number, height: number) => this;
    setColor: (color: CanvasColorResolvable) => this;
    setStroke: (stroke: boolean | CanvasColorResolvable) => this;
    setRadii: (radii: number | number[]) => this;
    build: () => ImageOptionRoundRectangle;
}
export declare class ArcComponentBuilder extends CanvasOptionBuilder<ImageOptionArc> {
    setColor: (color: CanvasColorResolvable) => this;
    setStroke: (stroke: boolean | CanvasColorResolvable) => this;
    setRadius: (radius: number) => this;
    setAngle: (start: number, end: number) => this;
    setCounterClockWise: (counterClockWise: boolean) => this;
    build: () => ImageOptionArc;
}
export declare class EllipseComponentBuilder extends CanvasOptionBuilder<ImageOptionEllipse> {
    setColor: (color: CanvasColorResolvable) => this;
    setStroke: (stroke: boolean | CanvasColorResolvable) => this;
    setRadius: (major: number, minor: number) => this;
    setRotation: (rotation: number) => this;
    setAngle: (start: number, end: number) => this;
    setCounterClockWise: (counterClockWise: boolean) => this;
    build: () => ImageOptionEllipse;
}
export declare class FileComponentBuilder extends CanvasOptionBuilder<ImageLoadOption> {
    setSize: (width: number, height: number) => this;
    setPath: (path: PathLike) => this;
    build: () => ImageLoadOption;
}
export declare class TextComponentBuilder extends CanvasOptionBuilder<TextOption> {
    constructor(data?: Partial<TextOption>);
    setColor: (color: CanvasColorResolvable) => this;
    setStroke: (stroke: boolean | CanvasColorResolvable) => this;
    setText: (text: string) => this;
    setFontFamily: (font: string) => this;
    setFontSize: (fontSize: string | number) => this;
    setFontWeight: (fontWeight: CanvasFontWeight) => this;
    setFont: (font: string, fontSize: string | number, fontWeight: CanvasFontWeight) => this;
    setMaxWidth: (maxWidth: number) => this;
    setTextAlign: (textAlign: CanvasTextAlign) => this;
    build: () => TextOption;
}
export declare class OperationComponentBuilder extends CanvasComponentBuilder<OperationOption> {
    setOperation: (operation: (ctx: CanvasRenderingContext2D) => void) => this;
    build: () => OperationOption;
}
export {};
//# sourceMappingURL=canvas.d.ts.map