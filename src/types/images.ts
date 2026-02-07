export interface NewImageData {
  preview: string;
  file: File;
  isCover: boolean;
}

export interface ExistingImageData {
  id: number;
  url: string;
  isCover: boolean;
}
