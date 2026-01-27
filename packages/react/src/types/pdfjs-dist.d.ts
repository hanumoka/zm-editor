// Type definitions for pdfjs-dist (optional peer dependency)
// This allows dynamic import of pdfjs-dist without requiring it to be installed

declare module 'pdfjs-dist' {
  interface PDFDocumentProxy {
    numPages: number;
    getPage: (pageNumber: number) => Promise<PDFPageProxy>;
    destroy: () => void;
  }

  interface PDFPageProxy {
    getViewport: (options: { scale: number }) => PDFViewport;
    render: (options: {
      canvasContext: CanvasRenderingContext2D;
      viewport: PDFViewport;
    }) => {
      promise: Promise<void>;
    };
  }

  interface PDFViewport {
    width: number;
    height: number;
  }

  interface PDFLoadingTask {
    promise: Promise<PDFDocumentProxy>;
  }

  export function getDocument(
    src: string | { url: string; withCredentials?: boolean }
  ): PDFLoadingTask;

  export const GlobalWorkerOptions: {
    workerSrc: string;
  };

  export const version: string;
}
