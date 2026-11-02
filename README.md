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

Open the address that Vite prints. "Add product" adds an item after 600 ms. "Add broken product" fails after 600 ms, so the error status appears. Both buttons are disabled while an operation is loading.

The page uses an in-memory repository by default. Add ?http to the address to use HttpCartRepository instead, which needs a backend that answers POST /api/cart/items with a JSON object holding id and name.

The command npm run typecheck checks the types, and npm run build writes the site to dist.
