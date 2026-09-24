# Ten-class traffic-sign detector

This folder defines the transfer-learning path for exactly five Japan and five Philippines classes. The application uses Gemini on Vertex AI for prototype visual recognition until a YOLO weights file passes held-out validation; there are no trained weights in this repository yet.

## Licensed sources

- Japan: [Ritsumeikan Japanese Road Signs](https://universe.roboflow.com/ritsumeikan/japanese-road-signs), 195 real road images, object detection, CC BY 4.0. Its public labels are broad (`Warning`, `Information`, `Mandatory`, `Prohibitory`) except `Speed Limit 30`. Manually inspect and relabel the four exact selected Japanese categories. Do not map every broad `Prohibitory` box to one exact class.
- Philippines: [Philippine Traffic Sign Dataset](https://universe.roboflow.com/nos-workspace-vsodn/philippine-traffic-sign-dataset-9kz1e-qvpnr-jirzn), 5,895 images, YOLOv11 object detection, CC BY 4.0. It directly includes `50kph_speed_limit`, `no_parking`, `no_uturn`, and `pedestrian_crossing`. Its published class list has no stop class, so add licensed, annotated real Philippines stop photographs before training.

The exact class manifest and source status are in `data/sign_classes.json`. Roboflow downloads require an account/API key. Keep that key outside Git.

## Dataset rules

Place YOLO images and labels under `ml/dataset/{images,labels}/{train,val,test}`. Split by original capture sequence or source image before augmentation so near duplicates never cross splits. Use actual road photographs. Keep sign-preserving brightness, exposure, blur, small rotation, perspective, scale, crop, and noise variation. Do not mirror signs, heavily rotate them, or alter colors until the rule meaning changes.

```powershell
py -3.12 -m venv .venv-yolo
.venv-yolo\Scripts\python -m pip install -r ml\requirements.txt
.venv-yolo\Scripts\python ml\audit_dataset.py ml\dataset
.venv-yolo\Scripts\python ml\train_yolo.py
.venv-yolo\Scripts\python ml\validate_yolo.py ml\runs\wayfarer-signs-v1\weights\best.pt
```

`audit_dataset.py` blocks training unless every class appears in train, validation, and test, meets the minimum count, has valid YOLO boxes, and has no byte-identical image leakage across splits. `train_yolo.py` starts from pretrained YOLO11n weights and uses restrained sign-preserving augmentation. Record per-class precision, recall, mAP50, mAP50-95, confusion matrix, and the held-out variation matrix before connecting weights to live camera inference.
