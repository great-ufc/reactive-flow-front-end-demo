# Reactive Flow Front-End demo

A runnable version of the reference implementation in the paper "Reactive Flow Front-End", presented at PLoP 2026. It uses TypeScript and the browser's own APIs, without a UI framework.

The authors of the paper and of this demo are Wilson Castro, Rossana M. C. Andrade, Denise R. A. Carvalho, Tobias N. Freitas, Roberto S. R. de Meneses and Gabriel B. Alves, from the Federal University of Ceará (UFC), and Pedro Almir M. Oliveira, from the Federal Institute of Maranhão (IFMA).

The file src/pattern.ts holds the four listings of the paper, in the order they appear there. The only addition is setRender, because the paper's interface calls a render function that the paper does not define. The file src/main.ts builds the page around the listings.

## The pattern

Reactive Flow Front-End is a design pattern for interactive front-end applications. It is meant for applications in which the screen, the business rules, the state and the calls to external services pile up in the same components. In such code, a change to one of them often breaks another.

The pattern gives each of these concerns its own role.

| Role | What it does |
| --- | --- |
| Reactive Interface | Draws the screen from the current state and turns each user action into a descriptive event. It never calls services or changes the state itself. |
| Flow Orchestrator | Receives each event, decides what happens next, applies events to the state and calls the infrastructure when data is needed. |
| State Modules | Hold the domain model and the status of the operation in progress. The state changes only through pure transitions. |
| Infrastructure Adapters | Talk to APIs and other external services behind a stable contract. |

Information moves in one direction only. Events go down from the interface to the orchestrator, and the only path back up is the notification that the state has changed. Because of this, every screen can be traced back to the events that produced it. The business rules can also be tested without a network or a browser.

The pattern pays off in medium and large applications, and in teams where several people change the same front-end. In a small application, a direct call and a local variable are simpler. Flux, Redux, NgRx, the Elm Architecture and BLoC are well-known architectures that follow the same principles.

## The paper

Castro, W., Andrade, R. M. C., Carvalho, D. R. A., Freitas, T. N., de Meneses, R. S. R., Alves, G. B. and Oliveira, P. A. M. "Reactive Flow Front-End: A Design Pattern for Event-Driven, State-Centric Front-End Architectures". In Proceedings of the 33rd Conference on Pattern Languages of Programs (PLoP 2026).

The paper is not available online yet. This section will link to it once the proceedings are published.

## How to run

Install the dependencies and start the development server.

```sh
npm install
npm run dev
```

Open the address that Vite prints. Add a product to start a flow. The default server latency is 900 ms. Add buttons are disabled while an operation is loading.

The page uses an in-memory repository by default. Add ?http to the address to use HttpCartRepository instead, which needs a backend that answers POST /api/cart/items with a JSON object holding id and name.

The command npm run typecheck checks the types, and npm run build writes the site to dist.

## What the page shows

The page opens with a short explanation of the pattern, its four roles and a few things to try. Below it the example runs in five parts.

- The shop is the Reactive Interface. It has a catalogue, the cart with its total, and the status field of the state.
- Inside the application shows the four roles, the user and the external services. Each numbered message of the paper's sequence diagram lights up the two boxes it connects.
- The state shows what the State Modules hold, with the domain model and the flow status apart, and the history of applied events. Selecting an event rebuilds the state from the events up to it.
- Settings change the latency of the simulated server, force the next request to fail, and set the speed of the animation.
- The message trace lists every message in order, grouped by the click that caused it, with its time.

To see the error path, add the discontinued lamp, or tick "Fail the next request" before adding a product. The animation runs from a queue, so it can finish after the real request. In HTTP mode the latency and failure settings are disabled, because the backend decides them.

## How the code is organized

The file src/pattern.ts holds the paper's four listings and nothing else of substance. Everything around it only observes the paper's code or draws what it observes.

- index.html holds the page and the architecture diagram, written as plain HTML and SVG.
- src/main.ts connects the pieces. It is the place to start reading.
- src/messages.ts lists the roles and the eleven numbered messages of the paper's sequence diagram.
- src/trace.ts records each message as it happens and passes it to the panels.
- src/instrumentation.ts wraps the paper's store, orchestrator and repository so that each call records its message, and then runs the original code.
- src/server.ts plays the external service, with the latency and the forced failure set in Controls.
- src/history.ts keeps the applied events and rebuilds a state from any prefix of them.
- src/catalogue.ts holds the products and their prices.
- src/panels/ holds one file per panel of the page.

