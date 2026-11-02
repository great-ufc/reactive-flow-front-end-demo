# Reactive Flow Front-End demo

A runnable version of the reference implementation in the paper "Reactive Flow Front-End", presented at PLoP 2026. It uses TypeScript and the browser's own APIs, without a UI framework.

The authors of the paper and of this demo are Wilson Castro, Rossana M. C. Andrade, Denise R. A. Carvalho, Tobias N. Freitas, Roberto S. R. de Meneses and Gabriel B. Alves, from the Federal University of Ceará (UFC), and Pedro Almir M. Oliveira, from the Federal Institute of Maranhão (IFMA).

The file src/pattern.ts holds the four listings of the paper, in the order they appear there. The only addition is setRender, because the paper's interface calls a render function that the paper does not define. The file src/main.ts builds the page around the listings.

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

Shop shows the catalogue, cart, total and live flow status. Architecture follows messages through the six roles at the selected animation speed. Message trace groups the numbered messages by user action and records their relative times. State separates the domain model from flow status and lists every applied event. Controls set server latency, arm a request failure and change animation speed. The arrow legend explains calls, state notifications and replies.

Add Discontinued lamp, or select Fail the next request before adding another product, to see the error path. Select an event in Event history to see the state rebuilt by folding the paper's reducer over events 1..k. Back to live returns to the current state. The cart continues to show live state while the state panel shows a past transition. Clearing the message trace leaves event history intact.

The animation queue can finish after the real request. The trace includes message 11 for both loading and final renders because the paper's interface renders on every notification. In HTTP mode, server latency and failure controls are disabled because the backend controls those behaviours.
