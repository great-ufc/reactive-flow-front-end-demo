import { messages, roles, type Message, type Role, Trace } from './trace';
const positions: Record<Role, [number, number]> = { user: [75, 45], ui: [285, 45], flow: [285, 155], state: [105, 275], adapter: [365, 275], api: [365, 395] };
const paths: Record<number, string> = {
  1: 'M145 45 H210', 2: 'M285 75 V125', 3: 'M235 185 L130 245',
  4: 'M75 245 V105 H225 V75', 5: 'M330 185 L365 245', 6: 'M365 305 V365',
  7: 'M390 365 V305', 8: 'M405 245 L350 185', 9: 'M235 185 L130 245',
  10: 'M75 245 V105 H225 V75', 11: 'M210 60 H145',
};
export function architecture(host: HTMLElement, trace: Trace, speed: HTMLSelectElement): void {
  host.innerHTML = `<svg viewBox="0 0 480 435" role="img" aria-label="Live architecture: events flow down, state notifications travel up">
    <defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 L10 5 L0 10z" fill="context-stroke"/></marker></defs>
    ${Object.entries(paths).map(([number, path]) => `<path data-arrow="${number}" d="${path}" class="connection ${number === '7' || number === '8' ? 'reply' : ''}" marker-end="url(#arrow)"/>`).join('')}
    ${Object.entries(positions).map(([role, [x, y]]) => `<g data-role="${role}" class="node ${role}"><rect x="${x - 70}" y="${y - 30}" width="140" height="60" rx="10"/><text x="${x}" y="${y - 4}" text-anchor="middle">${roles[role as Role].split(' ').slice(0, -1).join(' ') || roles[role as Role]}</text><text x="${x}" y="${y + 14}" text-anchor="middle">${roles[role as Role].includes(' ') ? roles[role as Role].split(' ').slice(-1) : ''}</text></g>`).join('')}
    </svg><p class="animation-message" aria-live="off">Add a product to follow a message.</p><p class="muted queue-status"></p>`;
  const queue: Message[] = [];
  let running = false;
  const label = host.querySelector('.animation-message')!;
  const pending = host.querySelector('.queue-status')!;
  const delays: Record<string, number> = { slow: 1200, normal: 650, fast: 220, instant: 0 };
  function play(): void {
    const message = queue.shift();
    host.querySelectorAll('.active').forEach(node => node.classList.remove('active'));
    pending.textContent = `${queue.length} messages queued · animation follows the recorded flow`;
    if (!message) { running = false; return; }
    running = true;
    const [from, to, text] = messages[message.number];
    host.querySelector(`[data-arrow="${message.number}"]`)?.classList.add('active');
    for (const role of [from, to]) host.querySelector(`[data-role="${role}"]`)?.classList.add('active');
    label.textContent = `Action ${message.cycle} · ${message.number} ${text}`;
    window.setTimeout(play, delays[speed.value] ?? 650);
  }
  trace.subscribe(message => { queue.push(message); if (!running) play(); });
}
