import { BaseUploader } from './BaseUploader';
import { UploadOptions } from './types';
import { UploadTask } from './UploadTask';

export class UploadManager {
    private queue: UploadTask[] = [];
    private active = 0;

    constructor(private uploader: BaseUploader, private concurrency = 3) { }

    add(options: UploadOptions) {
        const task = new UploadTask(this.uploader, options);
        this.queue.push(task);
        this.process();
        return task;
    }

    private async process() {
        if (this.active >= this.concurrency) return;

        const next = this.queue.find(t => t.state.status === 'queued');
        if (!next) return;

        this.active++;
        await next.start();
        this.active--;
        this.process();
    }
}