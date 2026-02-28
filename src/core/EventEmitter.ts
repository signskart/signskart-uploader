type Listener<T> = (payload: T) => void;

export class EventEmitter<T> {
    private listeners: Listener<T>[] = [];

    subscribe(listener: Listener<T>) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    emit(payload: T) {
        this.listeners.forEach(listener => listener(payload));
    }
}