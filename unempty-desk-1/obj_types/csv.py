from typing import TypedDict


class Row(TypedDict):
    start_time: int
    duration: int
    laptop: 0 | 1
    ipad: 0 | 1
    mouse: 0 | 1
    bag: 0 | 1
