

export type CameraDetection = {
  bbox: [number, number, number, number];
  label: string;
  confidence: number;
  status: 'recognized' | 'candidate';
};

export type RecognitionStatus = 'waiting' | 'recognized' | 'candidate' | 'unknown' | 'error';

export type CameraPanelProps = {
  active: boolean;
  parked: boolean;
  onSample: (imageDataUrl: string) => Promise<void>;
  onCapture: (imageDataUrl: string) => void | Promise<void>;
  detection?: CameraDetection | null;
  recognitionStatus?: RecognitionStatus;
};

/** Internal only. */
export type CameraStatus =
  | 'idle'
  | 'loading'
  | 'live'
  | 'denied'
  | 'no-camera'
  | 'error';
