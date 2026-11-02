import { byId, prefersReducedMotion } from '../dom';
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
    const delay = delayBySpeed[this.speed.value] ?? delayBySpeed.normal;
    this.highlight(message, delay);
    window.setTimeout(() => this.playNext(), delay);
  }

  private highlight(message: TracedMessage, duration: number): void {
    const { from, to, label } = message.definition;
    const arrow = this.diagram.querySelector<SVGPathElement>(`[data-messages~="${message.number}"]`);

    arrow?.classList.add('active');
    this.diagram.querySelector(`[data-role="${from}"]`)?.classList.add('active');
    this.diagram.querySelector(`[data-role="${to}"]`)?.classList.add('active');

    if (arrow) {
      this.sendDot(arrow, duration);
    }

    this.caption.textContent = `Action ${message.action}, message ${message.number}: ${label}`;
  }

  // Moves a dot from the sender to the receiver along the arrow. Every arrow
  // in index.html is drawn starting at its sender, so the dot always travels
  // in the direction of the message.
  private sendDot(arrow: SVGPathElement, duration: number): void {
    if (duration === 0 || prefersReducedMotion()) {
      return;
    }

    const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    dot.setAttribute('r', '5');
    dot.classList.add('message-dot');
    dot.classList.toggle('notification', arrow.classList.contains('notification'));
    this.diagram.append(dot);

    const length = arrow.getTotalLength();
    const travelTime = duration * 0.8;
    const start = performance.now();

    const step = (now: number): void => {
      const progress = Math.min((now - start) / travelTime, 1);
      const point = arrow.getPointAtLength(length * easeInOut(progress));
      dot.setAttribute('cx', String(point.x));
      dot.setAttribute('cy', String(point.y));

      if (progress < 1 && dot.isConnected) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  private clearHighlight(): void {
    for (const element of this.diagram.querySelectorAll('.active')) {
      element.classList.remove('active');
    }
    for (const dot of this.diagram.querySelectorAll('.message-dot')) {
      dot.remove();
    }
  }
}

// Starts and ends slowly, so the eye can follow where the dot leaves and lands.
function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
}
