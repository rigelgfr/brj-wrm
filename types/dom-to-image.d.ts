declare module 'dom-to-image' {
    export interface Options {
      width?: number;
      height?: number;
      bgcolor?: string;
      style?: object;
      quality?: number;
      filter?: (node: Node) => boolean;
      // Add the scale property that the library supports but is missing from @types
      scale?: number;
    }
  
    export function toPng(node: HTMLElement, options?: Options): Promise<string>;
    export function toJpeg(node: HTMLElement, options?: Options): Promise<string>;
    export function toBlob(node: HTMLElement, options?: Options): Promise<Blob>;
    export function toPixelData(node: HTMLElement, options?: Options): Promise<Uint8Array>;
    export function toSvg(node: HTMLElement, options?: Options): Promise<string>;
  }