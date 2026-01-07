import { CanvasComponentType } from "../enums/canvas.js";
class CanvasComponentBuilder {
    data;
    constructor(data = {}) {
        this.data = data;
    }
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
    assign(data) {
        Object.assign(this.data, data);
        return this;
    }
}
export class RootBuilder extends CanvasComponentBuilder {
    containers;
    constructor({ containers, ...data } = {}) {
        super({ type: CanvasComponentType.Root, ...data });
        this.containers = containers?.map((c) => resolveBuilder(c, ContainerBuilder)) ?? [];
    }
    setSize = (width, height) => this.assign({ size: [width, height] });
    setContainers(...containers) {
        this.containers = containers.map((c) => resolveBuilder(c, ContainerBuilder));
        return this;
    }
    addContainers(...containers) {
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
    spliceContainers(start, deleteCount, ...items) {
        this.containers.splice(start, deleteCount, ...items.map((c) => resolveBuilder(c, ContainerBuilder)));
        return this;
    }
    build = () => ({
        type: CanvasComponentType.Root,
        size: [0, 0],
        ...this.data,
        containers: this.containers.map((container) => container.build()),
    });
}
export class ContainerBuilder extends CanvasComponentBuilder {
    components;
    constructor({ components, ...data } = {}) {
        super({ type: CanvasComponentType.Container, ...data });
        this.components = components?.map((component) => createComponentBuilder(component)) ?? [];
    }
    setOffset = (x, y) => this.assign({ offset: [x, y] });
    setSize = (width, height) => this.assign({ size: [width, height] });
    setFonts = (fonts) => this.assign({ fonts });
    addFonts(fonts) {
        this.data.fonts = Object.assign(this.data.fonts ?? {}, fonts);
        return this;
    }
    addFont = (family, path) => this.addFonts({ [family]: path });
    addRectComponents(...components) {
        this.components.push(...components.map((c) => resolveBuilder(c, RectComponentBuilder)));
        return this;
    }
    addRoundComponents(...components) {
        this.components.push(...components.map((c) => resolveBuilder(c, RoundRectComponentBuilder)));
        return this;
    }
    addArcComponents(...components) {
        this.components.push(...components.map((c) => resolveBuilder(c, ArcComponentBuilder)));
        return this;
    }
    addEllipseComponents(...components) {
        this.components.push(...components.map((c) => resolveBuilder(c, EllipseComponentBuilder)));
        return this;
    }
    addFileComponents(...components) {
        this.components.push(...components.map((c) => resolveBuilder(c, FileComponentBuilder)));
        return this;
    }
    addTextComponents(...components) {
        this.components.push(...components.map((c) => resolveBuilder(c, TextComponentBuilder)));
        return this;
    }
    addOperationComponents(...components) {
        this.components.push(...components.map((c) => resolveBuilder(c, OperationComponentBuilder)));
        return this;
    }
    setComponents = (...components) => this.assign({ components });
    /**
     * Removes, replaces, or inserts components for this container.
     *
     * @param start - The index to start removing, replacing or inserting components.
     * @param deleteCount - The amount of components to remove.
     * @param components - The components to set.
     */
    spliceComponents(start, deleteCount, ...items) {
        this.components.splice(start, deleteCount, ...items.map((item) => createComponentBuilder(item)));
        return this;
    }
    build = () => ({
        type: CanvasComponentType.Container,
        offset: [0, 0],
        size: [0, 0],
        ...this.data,
        components: this.components.map((component) => component.build()),
    });
}
class CanvasOptionBuilder extends CanvasComponentBuilder {
    setOffset(x, y) {
        this.data.offset = [x, y];
        return this;
    }
    setAlpha(alpha) {
        this.data.alpha = alpha;
        return this;
    }
    setShadow(shadow) {
        this.data.shadow = shadow;
        return this;
    }
}
export class RectComponentBuilder extends CanvasOptionBuilder {
    setSize = (width, height) => this.assign({ size: [width, height] });
    setColor = (color) => this.assign({ color });
    setStroke = (stroke) => this.assign({ stroke });
    build = () => ({
        type: CanvasComponentType.Rectangle,
        offset: [0, 0],
        size: [0, 0],
        ...this.data,
    });
}
export class RoundRectComponentBuilder extends CanvasOptionBuilder {
    setSize = (width, height) => this.assign({ size: [width, height] });
    setColor = (color) => this.assign({ color });
    setStroke = (stroke) => this.assign({ stroke });
    setRadii = (radii) => this.assign({ radii });
    build = () => ({
        type: CanvasComponentType.Round,
        offset: [0, 0],
        size: [0, 0],
        ...this.data,
    });
}
export class ArcComponentBuilder extends CanvasOptionBuilder {
    setColor = (color) => this.assign({ color });
    setStroke = (stroke) => this.assign({ stroke });
    setRadius = (radius) => this.assign({ radius });
    setAngle = (start, end) => this.assign({ angle: [start, end] });
    setCounterClockWise = (counterClockWise) => this.assign({ counterClockWise });
    build = () => ({
        type: CanvasComponentType.Arc,
        offset: [0, 0],
        radius: 0,
        angle: [0, 0],
        ...this.data,
    });
}
export class EllipseComponentBuilder extends CanvasOptionBuilder {
    setColor = (color) => this.assign({ color });
    setStroke = (stroke) => this.assign({ stroke });
    setRadius = (major, minor) => this.assign({ radius: [major, minor] });
    setRotation = (rotation) => this.assign({ rotation });
    setAngle = (start, end) => this.assign({ angle: [start, end] });
    setCounterClockWise = (counterClockWise) => this.assign({ counterClockWise });
    build = () => ({
        type: CanvasComponentType.Ellipse,
        offset: [0, 0],
        radius: [0, 0],
        rotation: 0,
        angle: [0, 0],
        ...this.data,
    });
}
export class FileComponentBuilder extends CanvasOptionBuilder {
    setSize = (width, height) => this.assign({ size: [width, height] });
    setPath = (path) => this.assign({ path });
    build = () => ({
        type: CanvasComponentType.File,
        path: "",
        offset: [0, 0],
        size: [0, 0],
        ...this.data,
    });
}
export class TextComponentBuilder extends CanvasOptionBuilder {
    constructor(data) {
        super({ type: CanvasComponentType.Text, ...data });
    }
    setColor = (color) => this.assign({ color });
    setStroke = (stroke) => this.assign({ stroke });
    setText = (text) => this.assign({ text });
    setFontFamily = (font) => this.assign({ font });
    setFontSize = (fontSize) => this.assign({ fontSize });
    setFontWeight = (fontWeight) => this.assign({ fontWeight });
    setFont = (font, fontSize, fontWeight) => this.assign({ font, fontSize, fontWeight });
    setMaxWidth = (maxWidth) => this.assign({ maxWidth });
    setTextAlign = (textAlign) => this.assign({ textAlign });
    build = () => ({
        type: CanvasComponentType.Text,
        text: "",
        offset: [0, 0],
        ...this.data,
    });
}
export class OperationComponentBuilder extends CanvasComponentBuilder {
    setOperation = (operation) => this.assign({ operation });
    build = () => ({
        type: CanvasComponentType.Operation,
        operation: (ctx) => undefined,
        ...this.data,
    });
}
const resolveBuilder = (builder, constructor) => typeof builder === "function"
    ? builder(new constructor())
    : builder instanceof CanvasComponentBuilder
        ? builder
        : new constructor(builder);
const builderMap = {
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
function createComponentBuilder(data) {
    if (data instanceof CanvasComponentBuilder)
        return data;
    return new builderMap[data.type](data);
}
//# sourceMappingURL=canvas.js.map