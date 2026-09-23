

export type CameraPanelProps = {
  active: boolean;
  parked: boolean;
  onSample: (imageDataUrl: string) => Promise<void>;
  onCapture: (imageDataUrl: string) => void;
};

/** Internal only. */
export type CameraStatus =
  | 'idle'
  | 'loading'
  | 'live'
  | 'denied'
  | 'no-camera'
  | 'error';
