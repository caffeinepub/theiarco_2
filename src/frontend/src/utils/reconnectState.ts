// Shared reconnect state utility for tracking "Actor not available" errors
type ReconnectListener = () => void;

class ReconnectState {
  private listeners: Set<ReconnectListener> = new Set();
  private hasError = false;

  setError(hasError: boolean) {
    if (this.hasError !== hasError) {
      this.hasError = hasError;
      this.notify();
    }
  }

  getError(): boolean {
    return this.hasError;
  }

  subscribe(listener: ReconnectListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export const reconnectState = new ReconnectState();
