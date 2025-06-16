from shapely.geometry import Polygon, Point


class PolygonWrapper:
    def __init__(self, points):
        self.polygon = Polygon(points)

    def update(self, new_points):
        self.polygon = Polygon(new_points)

    def contains(self, point):
        return self.polygon.contains(Point(point))

    # Optional: add more forwards like .intersects(), .area, etc.
