from typing import List, Tuple
from classes.RectangleCoordinates import RectangleCoordinates


def rect_to_polygon_points(rect: RectangleCoordinates) -> List[Tuple[int, int]]:
    x = int(rect["x"])
    y = int(rect["y"])
    width = int(rect["width"])
    height = int(rect["height"])

    return [
        (x, y),  # top-left
        (x + width, y),  # top-right
        (x + width, y + height),  # bottom-right
        (x, y + height),  # bottom-left
    ]
