export class UpdateQueue {
    protected execPrev: Promise<void> = Promise.resolve();

    /**
     * Adds a function to the queue
     * @param func The function to be executed
     * @returns A function to cancel the update
     */
    public add(func: (...args: any[]) => any): () => void {
        let canceled = false;
        this.execPrev = this.execPrev.then(async () => {
            if (canceled) return;
            func();
            await new Promise(res => setTimeout(res, 2)); // Insert an update cycle
        });

        return () => {
            canceled = true;
        };
    }
}

/**
 * A queue that can be used to make sure not all updates are dispatched at once
 */
export const updateQueue = new UpdateQueue();
