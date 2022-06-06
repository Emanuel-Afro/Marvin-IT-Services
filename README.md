[![Moleculer](https://badgen.net/badge/Powered%20by/Moleculer/0e83cd)](https://moleculer.services)

# troedr - a node-trading-toolkit
A lightweight trading toolkit based on ccxt tardis-dev and moleculer

## Features
- [ ] Open and manage synthetic orders from the via CLI or from the node.js service
- [ ] Trading using special chart resolutions (down to tick level thanks to [tardis-dev](https://tardis.dev/) - kudos to tardis!!)
- [ ] Fetch your data (orders, balances) from the exchange
- [ ] Deploy your strategies basend on TA or oderbook events
- [ ] Stream the data via websocket to your own web-client

## Supported Exchanges:
- [x] Binance Spot
- [x] Binance Futures
- [ ] FTX

## Inspiration from and thanks to
* https://github.com/askmike/gekko
* https://gitlab.com/Ichimikichiki/ichibot-client-app
* https://github.com/freqtrade/freqtrade/
* https://github.com/DeviaVir/zenbot
* https://github.com/coinbase/coinbase-pro-trading-toolkit

### Disclaimer
This is NOT a sure-fire profit machine. Use it AT YOUR OWN RISK.

## Usage
Start the project with `npm run dev` command. 

In the terminal, try the following commands:
- `nodes` - List all connected nodes.
- `actions` - List all registered service actions.

## Services

## Mixins
- **db.mixin**: Database access mixin for services. Based on [moleculer-db](https://github.com/moleculerjs/moleculer-db#readme)

## Useful links

* Moleculer website: https://moleculer.services/
* Moleculer Documentation: https://moleculer.services/docs/0.14/

## NPM scripts

- `npm run dev`: Start development mode (load all services locally with hot-reload & REPL)
- `npm run start`: Start production mode (set `SERVICES` env variable to load certain services)
- `npm run cli`: Start a CLI and connect to production. Don't forget to set production namespace with `--ns` argument in script
- `npm run lint`: Run ESLint
- `npm run ci`: Run continuous test mode with watching
- `npm test`: Run tests & generate coverage report
- `npm run dc:up`: Start the stack with Docker Compose
- `npm run dc:down`: Stop the stack with Docker Compose
