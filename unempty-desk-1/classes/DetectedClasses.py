class DetectedClasses:
    def __init__(self):
        self.detected_classes = set()

    def append_class(self, class_name: str):
        self.detected_classes.add(class_name)

    def get_classes(self):
        return self.detected_classes

    def clear(self):
        self.detected_classes = set()
