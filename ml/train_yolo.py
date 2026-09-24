"""Fine-tune a small pretrained YOLO detector after the dataset audit passes."""
import json
from pathlib import Path
from ultralytics import YOLO

ROOT = Path(__file__).resolve().parent
AUDIT = ROOT / "dataset-audit.json"
if not AUDIT.exists():
    raise SystemExit("Run ml/audit_dataset.py and resolve every error before training.")
if not json.loads(AUDIT.read_text(encoding="utf-8")).get("ready"):
    raise SystemExit("The latest dataset audit is not ready. Resolve every reported error before training.")

model = YOLO("yolo11n.pt")
model.train(
    data=str(ROOT / "wayfarer-signs.yaml"),
    epochs=80,
    imgsz=640,
    batch=8,
    patience=15,
    seed=2026,
    deterministic=True,
    project=str(ROOT / "runs"),
    name="wayfarer-signs-v1",
    degrees=7.0,
    translate=0.08,
    scale=0.25,
    perspective=0.0005,
    hsv_h=0.01,
    hsv_s=0.25,
    hsv_v=0.25,
    fliplr=0.0,
    flipud=0.0,
    mosaic=0.25,
    mixup=0.0,
    erasing=0.15,
)
