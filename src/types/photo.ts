export interface PhotoItem {
  id: string;
  src: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
}

export interface PhotoState {
  x: number;
  y: number;
  rotation: number;
  zIndex: number;
}

export interface PhotoWallData {
  photos: PhotoItem[];
  lastUpdated: number;
}
