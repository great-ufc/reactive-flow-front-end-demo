import { byId } from '../dom';
import { serverSettings } from '../server';

// Latency and forced failure act on the in-memory server. Speed acts only on
// the animation of the Architecture panel.
export class ControlsPanel {
  readonly animationSpeed = byId<HTMLSelectElement>('animation-speed');
  private readonly latency = byId<HTMLInputElement>('latency');
  private readonly latencyValue = byId<HTMLOutputElement>('latency-value');
  private readonly failNext = byId<HTMLInputElement>('fail-next');

  constructor() {
    this.latency.addEventListener('input', () => {
      serverSettings.latencyMs = Number(this.latency.value);
      this.latencyValue.textContent = `${this.latency.value} ms`;
    });

    this.failNext.addEventListener('change', () => {
      serverSettings.failNextRequest = this.failNext.checked;
    });
  }

  // Called by the server once the forced failure has been used.
  uncheckFailNext = (): void => {
    this.failNext.checked = false;
  };

  showServerMode(usesHttp: boolean): void {
    this.latency.disabled = usesHttp;
    this.failNext.disabled = usesHttp;

    byId('server-mode').textContent = usesHttp
      ? 'HTTP mode: requests go to POST /api/cart/items, so the backend sets latency and failures.'
      : 'In-memory server: latency and the forced failure apply to the next request.';
  }
}
