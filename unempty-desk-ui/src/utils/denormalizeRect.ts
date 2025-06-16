import { Rect } from "@unempty-desk-ui/types/Rect";

export function denormalizeRect(normalized: Rect, width: number, height: number): Rect {
  return {
    x: Math.round(normalized.x * width),
    y: Math.round(normalized.y * height),
    width: Math.round(normalized.width * width),
    height: Math.round(normalized.height * height),
  };
}
