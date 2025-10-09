import { pdfjs } from 'react-pdf';

class PdfWorkerManager {
    private activeComponents = new Set<string>();
    private worker: any = null;

    registerComponent(componentId: string) {
        this.activeComponents.add(componentId);
    }

    unregisterComponent(componentId: string) {
        this.activeComponents.delete(componentId);

        // If no more components are using the worker, terminate it
        if (this.activeComponents.size === 0) {
            this.terminateWorker();
        }
    }

    private terminateWorker() {
        try {
            if (pdfjs.GlobalWorkerOptions.workerSrc) {
            }
        } catch (error) {
        }
    }

    getActiveComponentsCount(): number {
        return this.activeComponents.size;
    }
}

export const pdfWorkerManager = new PdfWorkerManager();