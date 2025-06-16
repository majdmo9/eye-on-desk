from utils.constants import VIDEO_WIDTH, VIDEO_HEIGHT


def denormalize_rect(normalized):
    return {
        "x": int(normalized["x"] * VIDEO_WIDTH),
        "y": int(normalized["y"] * VIDEO_HEIGHT),
        "width": int(normalized["width"] * VIDEO_WIDTH),
        "height": int(normalized["height"] * VIDEO_HEIGHT),
    }
