export interface GalleryPhoto {
  id: string;
  file: string;
  placeholder: string;
  thumb2x: string;
  srcset: string;
  avifSrcset: string;
  preview: string;
  previewWidth: number;
  previewHeight: number;
  previewSrcset: string;
  alt: string;
  width: number;
  height: number;
  scale?: number;
}
