import type { RGBTuple } from "../types/color.js";

export const makeRGB = ([r, g, b]: RGBTuple): string => `rgb(${r}, ${g}, ${b})`;
export const makeRGBA = ([r, g, b]: RGBTuple, a: number): string => `rgba(${r}, ${g}, ${b}, ${a})`;
