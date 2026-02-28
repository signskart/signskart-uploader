import { BaseUploader } from './BaseUploader';
import { UploadOptions, UploadTaskState } from './types';
import { EventEmitter } from './EventEmitter';

export class UploadTask {
    public state: UploadTaskState;
    public events = new EventEmitter<UploadTaskState>();
    private abortController = new AbortController();
    private retries = 0;

    constructor(
        private uploader: BaseUploader,
        private options: UploadOptions,
        private maxRetries = 2,
        private retryDelay = 500
    ) {
        this.state = {
            id: crypto.randomUUID(),
            progress: 0,
            status: 'queued'
        };
    }

    async start(): Promise<void> {
        this.update({ status: 'uploading' });

        while (this.retries <= this.maxRetries) {
            try {
                const response = await this.uploader.upload(
                    this.options,
                    progress => this.update({ progress }),
                    this.abortController.signal
                );

                this.update({ status: 'success', progress: 100, response });
                return;
            } catch (error: unknown) {
                if (this.abortController.signal.aborted) {
                    this.update({ status: 'cancelled' });
                    return;
                }

                const message = error instanceof Error ? error.message : 'Unknown upload error';

                if (this.retries >= this.maxRetries) {
                    this.update({ status: 'error', error: message });
                    return;
                }

                this.retries++;
                await this.sleep(this.retryDelay * Math.pow(2, this.retries - 1));
            }
        }
    }

    cancel() {
        this.abortController.abort();
        this.update({ status: 'cancelled' });
    }

    private update(update: Partial<UploadTaskState>) {
        this.state = { ...this.state, ...update };
        this.events.emit(this.state);
    }

    private sleep(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}