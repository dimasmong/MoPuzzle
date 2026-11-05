export interface DiagnosticEvent {
  type: string;
  timestamp: number;
  data?: any;
}

class DiagnosticsTracker {
  private events: DiagnosticEvent[] = [];
  private maxEvents = 100;

  public log(type: string, data?: any): void {
    const entry: DiagnosticEvent = {
      type,
      timestamp: Date.now(),
      data
    };
    this.events.push(entry);
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
    if (typeof window !== 'undefined' && (window as any).__MOPUZZLE_DEBUG__) {
      console.log(`[MoPuzzle Diag] ${type}`, data || '');
    }
  }

  public getEvents(): DiagnosticEvent[] {
    return [...this.events];
  }

  public getLastEvent(type?: string): DiagnosticEvent | undefined {
    if (!type) return this.events[this.events.length - 1];
    for (let i = this.events.length - 1; i >= 0; i--) {
      if (this.events[i].type === type) return this.events[i];
    }
    return undefined;
  }

  public clear(): void {
    this.events = [];
  }
}

export const Diagnostics = new DiagnosticsTracker();
if (typeof window !== 'undefined') {
  (window as any).__MOPUZZLE_DIAGNOSTICS__ = Diagnostics;
}
