import { type Canvas, type CanvasRenderingContext2D } from "canvas";
import type { CanvasContainer, CanvasRoot, ImageOption, TextOption } from "../types/canvas.js";
export declare function drawFromRoot(root: CanvasRoot): Promise<Canvas>;
export declare function drawFromContainer(container: CanvasContainer): Promise<Canvas>;
export declare function init(context: CanvasRenderingContext2D, option: ImageOption | TextOption): CanvasRenderingContext2D;
export declare function drawImage(context: CanvasRenderingContext2D, option: ImageOption, keep?: boolean): Promise<CanvasRenderingContext2D>;
export declare function drawText(context: CanvasRenderingContext2D, option: TextOption, keep?: boolean): CanvasRenderingContext2D;
//# sourceMappingURL=canvas.d.ts.map