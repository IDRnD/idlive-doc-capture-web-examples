export class EventFPSCounter extends EventTarget {
    private eventTimestamps: number[] = [];
    private fps: number = 0;

    public onEvent(): void {
        const now = Date.now();
        this.eventTimestamps.push(now);

        this.eventTimestamps = this.eventTimestamps.filter(timestamp => now - timestamp < 1000);

        this.fps = this.eventTimestamps.length;

        const fpsEvent = new CustomEvent('fps', { detail: this.fps });
        this.dispatchEvent(fpsEvent);
    }
}
