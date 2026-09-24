"""Reject an incomplete or leaky WayFarer YOLO dataset before training."""
from __future__ import annotations

import argparse
import hashlib
import json
from collections import Counter, defaultdict
from pathlib import Path

CLASSES = [
    "JP_STOP", "JP_MAX_SPEED_30", "JP_PEDESTRIAN_CROSSING", "JP_NO_PARKING", "JP_NO_U_TURN",
    "PH_STOP", "PH_MAX_SPEED_50", "PH_PEDESTRIAN_CROSSING", "PH_NO_PARKING", "PH_NO_U_TURN",
]
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".webp"}


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("dataset", type=Path)
    parser.add_argument("--minimum-images", type=int, default=20)
    parser.add_argument("--report", type=Path, default=Path("ml/dataset-audit.json"))
    args = parser.parse_args()

    counts: dict[str, Counter[int]] = {}
    hashes: dict[str, list[str]] = defaultdict(list)
    errors: list[str] = []
    for split in ("train", "val", "test"):
        image_dir = args.dataset / "images" / split
        label_dir = args.dataset / "labels" / split
        split_counts: Counter[int] = Counter()
        for image in sorted(p for p in image_dir.glob("**/*") if p.suffix.lower() in IMAGE_SUFFIXES):
            hashes[digest(image)].append(f"{split}/{image.name}")
            label = label_dir / f"{image.stem}.txt"
            if not label.exists():
                errors.append(f"Missing label: {split}/{image.name}")
                continue
            image_classes: set[int] = set()
            for line_number, line in enumerate(label.read_text(encoding="utf-8").splitlines(), 1):
                fields = line.split()
                if len(fields) != 5:
                    errors.append(f"Invalid YOLO row: {label}:{line_number}")
                    continue
                try:
                    class_id = int(fields[0])
                    box = [float(value) for value in fields[1:]]
                except ValueError:
                    errors.append(f"Non-numeric YOLO row: {label}:{line_number}")
                    continue
                if class_id not in range(len(CLASSES)) or any(value < 0 or value > 1 for value in box):
                    errors.append(f"Out-of-range YOLO row: {label}:{line_number}")
                    continue
                image_classes.add(class_id)
            split_counts.update(image_classes)
        counts[split] = split_counts

    for file_hash, locations in hashes.items():
        if len({item.split("/", 1)[0] for item in locations}) > 1:
            errors.append(f"Duplicate image crosses splits: {locations} ({file_hash[:10]})")
    for class_id, class_name in enumerate(CLASSES):
        total = sum(counts[split][class_id] for split in counts)
        if total < args.minimum_images:
            errors.append(f"{class_name} appears in {total} images; minimum is {args.minimum_images}")
        for split in ("train", "val", "test"):
            if counts[split][class_id] == 0:
                errors.append(f"{class_name} is absent from {split}")

    report = {
        "classes": CLASSES,
        "counts": {split: {CLASSES[i]: value for i, value in sorted(counter.items())} for split, counter in counts.items()},
        "errors": errors,
        "ready": not errors,
    }
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(json.dumps(report, indent=2))
    if errors:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
