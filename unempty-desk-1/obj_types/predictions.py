from typing import TypedDict


class RowToPredict(TypedDict):
    start_time: int
    laptop: 0 | 1
    ipad: 0 | 1
    mouse: 0 | 1
    bag: 0 | 1
