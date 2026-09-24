"""Evaluate held-out YOLO data and export an auditable per-object matrix."""
from __future__ import annotations

import argparse
import csv
from pathlib import Path

from ultralytics import YOLO


NORMALIZED = {
    "JP_STOP": "STOP", "PH_STOP": "STOP",
    "JP_MAX_SPEED_30": "MAX_SPEED", "PH_MAX_SPEED_50": "MAX_SPEED",
    "JP_PEDESTRIAN_CROSSING": "PEDESTRIAN_CROSSING", "PH_PEDESTRIAN_CROSSING": "PEDESTRIAN_CROSSING",
    "JP_NO_PARKING": "NO_PARKING", "PH_NO_PARKING": "NO_PARKING",
    "JP_NO_U_TURN": "NO_U_TURN", "PH_NO_U_TURN": "NO_U_TURN",
}


def iou(left: list[float], right: list[float]) -> float:
    x1, y1 = max(left[0], right[0]), max(left[1], right[1])
    x2, y2 = min(left[2], right[2]), min(left[3], right[3])
    intersection = max(0.0, x2 - x1) * max(0.0, y2 - y1)
    left_area = max(0.0, left[2] - left[0]) * max(0.0, left[3] - left[1])
    right_area = max(0.0, right[2] - right[0]) * max(0.0, right[3] - right[1])
    union = left_area + right_area - intersection
    return intersection / union if union else 0.0


def yolo_to_xyxy(values: list[float]) -> list[float]:
    cx, cy, width, height = values
    return [cx - width / 2, cy - height / 2, cx + width / 2, cy + height / 2]


def read_expected(label_path: Path, names: dict[int, str]) -> list[tuple[str, list[float]]]:
    expected: list[tuple[str, list[float]]] = []
    if not label_path.exists():
        return expected
    for line in label_path.read_text(encoding="utf-8").splitlines():
        parts = line.split()
        if len(parts) != 5:
            continue
        class_id = int(parts[0])
        expected.append((names[class_id], yolo_to_xyxy([float(value) for value in parts[1:]])))
    return expected


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("weights", type=Path)
    parser.add_argument("--dataset", type=Path, default=Path("ml/dataset/images/test"))
    parser.add_argument("--labels", type=Path, default=Path("ml/dataset/labels/test"))
    parser.add_argument("--output", type=Path, default=Path("ml/validation-matrix.csv"))
    parser.add_argument("--confidence", type=float, default=0.35)
    parser.add_argument("--minimum-iou", type=float, default=0.5)
    args = parser.parse_args()

    model = YOLO(str(args.weights))
    results = model.predict(source=str(args.dataset), conf=args.confidence, iou=0.5, save=False, stream=True)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    fields = ["image", "country", "expected_class", "predicted_class", "confidence", "normalized_meaning", "box_iou", "result"]
    rows: list[dict[str, str]] = []

    for result in results:
        image_name = Path(result.path).name
        expected = read_expected(args.labels / f"{Path(image_name).stem}.txt", model.names)
        predicted = [
            (model.names[int(box.cls.item())], float(box.conf.item()), [float(value) for value in box.xyxyn.tolist()[0]])
            for box in result.boxes
        ]
        used_predictions: set[int] = set()
        for expected_class, expected_box in expected:
            candidates = [(index, iou(expected_box, box)) for index, (_, _, box) in enumerate(predicted) if index not in used_predictions]
            match_index, box_iou = max(candidates, key=lambda item: item[1], default=(-1, 0.0))
            predicted_class, confidence = (predicted[match_index][0], predicted[match_index][1]) if match_index >= 0 else ("MISSED", 0.0)
            passed = predicted_class == expected_class and box_iou >= args.minimum_iou
            if match_index >= 0:
                used_predictions.add(match_index)
            rows.append({
                "image": image_name,
                "country": expected_class.split("_", 1)[0],
                "expected_class": expected_class,
                "predicted_class": predicted_class,
                "confidence": f"{confidence:.4f}",
                "normalized_meaning": NORMALIZED.get(predicted_class, "UNKNOWN"),
                "box_iou": f"{box_iou:.4f}",
                "result": "PASS" if passed else "FAIL",
            })
        for index, (predicted_class, confidence, _) in enumerate(predicted):
            if index not in used_predictions:
                rows.append({
                    "image": image_name, "country": predicted_class.split("_", 1)[0],
                    "expected_class": "NONE", "predicted_class": predicted_class,
                    "confidence": f"{confidence:.4f}", "normalized_meaning": NORMALIZED.get(predicted_class, "UNKNOWN"),
                    "box_iou": "0.0000", "result": "FAIL",
                })

    with args.output.open("w", newline="", encoding="utf-8") as stream:
        writer = csv.DictWriter(stream, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    failures = sum(row["result"] == "FAIL" for row in rows)
    print(f"Wrote {len(rows)} validation rows to {args.output}; {failures} failed.")
    raise SystemExit(1 if failures or not rows else 0)


if __name__ == "__main__":
    main()
