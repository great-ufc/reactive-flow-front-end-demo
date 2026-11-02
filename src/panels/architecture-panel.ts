import { byId } from '../dom';
import type { Trace, TracedMessage } from '../trace';

// How long each message stays lit, by the speed chosen in the Controls panel.
const delayBySpeed: Record<string, number> = {
  slow: 1200,
  normal: 650,
  fast: 220,
  instant: 0,
};

// Lights up the arrow and the two roles of each message, one at a time. The
// messages wait in a queue, so the animation may still be running after the
// real code has finished.
export class ArchitecturePanel {
  private readonly diagram = byId('architecture-diagram');
  private readonly caption = byId('animation-caption');
  private readonly queueInfo = byId('animation-queue');
  private readonly queue: TracedMessage[] = [];
  private playing = false;

  constructor(
    trace: Trace,
    private readonly speed: HTMLSelectElement,
  ) {
    trace.subscribe((message) => this.enqueue(message));
  }

  private enqueue(message: TracedMessage): void {
    this.queue.push(message);
    if (!this.playing) {
      this.playNext();
    }
  }

  private playNext(): void {
    this.clearHighlight();

    const message = this.queue.shift();
    this.queueInfo.textContent = this.queue.length > 0 ? `${this.queue.length} messages waiting` : '';

    if (!message) {
      this.playing = false;
      return;
    }

    this.playing = true;
    this.highlight(message);
    const delay = delayBySpeed[this.speed.value] ?? delayBySpeed.normal;
    window.setTimeout(() => this.playNext(), delay);
  }

  private highlight(message: TracedMessage): void {
    const { from, to, label } = message.definition;

    this.diagram.querySelector(`[data-messages~="${message.number}"]`)?.classList.add('active');
    this.diagram.querySelector(`[data-role="${from}"]`)?.classList.add('active');
    this.diagram.querySelector(`[data-role="${to}"]`)?.classList.add('active');

    this.caption.textContent = `Action ${message.action}, message ${message.number}: ${label}`;
  }

  private clearHighlight(): void {
    for (const element of this.diagram.querySelectorAll('.active')) {
      element.classList.remove('active');
    }
  }
}
