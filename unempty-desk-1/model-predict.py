from ultralytics import YOLO

model = YOLO("./best.pt")
metrics = model.val(data="./data.yaml", save=True)
print("mAP@0.5:", metrics.box.map50)
