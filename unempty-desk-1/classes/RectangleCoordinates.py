from dataclasses import dataclass


@dataclass
class RectangleCoordinates:
    def __init__(
        self, x: float = 0, y: float = 0, width: float = 100, height: float = 100
    ):
        self.x = x
        self.y = y
        self.width = width
        self.height = height

    def get_rect_coordinates(self):
        return {
            "x": self.x,
            "y": self.y,
            "width": self.width,
            "height": self.height,
        }

    def set_rect_coordinates(self, x: float, y: float, width: float, height: float):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
