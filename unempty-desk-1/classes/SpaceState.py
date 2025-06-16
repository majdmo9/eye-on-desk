import threading


class SpaceState:
    def __init__(self):
        self.lock = threading.Lock()
        self.status = "available"
        self.person_inside = False
        self.student_id = -1
        self.start_time = None
        self.end_time = None
        self.record_logged = False
        self.duration_minutes = 0
        self.detected_items = [0, 0, 0, 0]

    def set_status(self, new_status: str):
        with self.lock:
            self.status = new_status

    def get_status(self):
        with self.lock:
            return self.status

    def is_available(self):
        return self.status == "available"
