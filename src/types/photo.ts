export interface PhotoItem {
  id: string;
  src: string;
  srcset?: string;
  avifSrcset?: string;
  sizes?: string;
  preview?: string;
  previewWidth?: number;
  previewHeight?: number;
  previewSrcset?: string;
  alt: string;
  caption?: string;
  width?: number;
  height?: number;
  scale?: number;
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
