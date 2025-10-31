class MinPriorityQueue<T> {
    private readonly heap: Array<T>;
    private readonly priorityFn: (a: T) => number;
    private readonly keyFn: (a: T) => string;
    private readonly posMap = new Map<string, number>();

    constructor(
        priorityFn: (a: T) => number,
        keyFn: (a: T) => string,
        arr: Array<T> = []
    ) {
        this.priorityFn = priorityFn;
        this.keyFn = keyFn;
        this.heap = arr;

        for (let i = 0; i < this.size(); ++i) {
            this.posMap.set(this.keyFn(this.heap[i]), i);
        }

        for (let i = Math.floor(this.size() / 2) - 1; i >= 0; --i) {
            this.bubbleDown(i);
        }
    }

    private swap(a: number, b: number) {
        const heap = this.heap;
        const keyFn = this.keyFn;

        const [itemA, itemB] = [heap[a], heap[b]];
        const [keyA, keyB] = [keyFn(itemA), keyFn(itemB)];

        this.heap[a] = itemB;
        this.heap[b] = itemA;

        this.posMap.set(keyA, b);
        this.posMap.set(keyB, a);
    }

    insert(val: T) {
        const key = this.keyFn(val);

        if (this.posMap.has(key)) return;

        this.heap.push(val);
        const i = this.size() - 1;
        this.posMap.set(key, i);
        this.bubbleUp(i);
    }

    delMin(): T | undefined {
        if (this.isEmpty()) return undefined;

        const ans = this.heap[0];
        const ansKey = this.keyFn(ans);
        this.posMap.delete(ansKey);

        if (this.size() === 1) {
            this.heap.pop();
            return ans;
        }

        const last = this.heap.pop()!;
        this.heap[0] = last;
        this.posMap.set(this.keyFn(last), 0);
        this.bubbleDown(0);

        return ans;
    }

    decreaseKey(val: T) {
        const key = this.keyFn(val);
        const i = this.posMap.get(key);

        if (i === undefined) return;

        this.bubbleUp(i);
    }

    contains(key: string): boolean {
        return this.posMap.has(key);
    }

    isEmpty(): boolean {
        return this.size() === 0;
    }

    size(): number {
        return this.heap.length;
    }

    private bubbleUp(i: number) {
        const heap = this.heap;
        const priority = this.priorityFn;

        while (i > 0) {
            const parent = Math.floor((i - 1) / 2);

            if (priority(heap[i]) < priority(heap[parent])) {
                this.swap(i, parent);
                i = parent;
            } else {
                break;
            }
        }
    }

    private bubbleDown(i: number) {
        const heap = this.heap;
        const priority = this.priorityFn;
        const size = this.size();

        while (2 * i + 1 < size) {
            const left = 2 * i + 1;
            const right = 2 * i + 2;
            let min = left;

            if (right < size && priority(heap[right]) < priority(heap[min])) {
                min = right;
            }

            if (priority(heap[i]) > priority(heap[min])) {
                this.swap(i, min);
                i = min;
            } else {
                return;
            }
        }
    }
}

export { MinPriorityQueue };