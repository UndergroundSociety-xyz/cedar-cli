```
 ____ ____ ____ ____ ____
||c |||e |||d |||a |||r ||
||__|||__|||__|||__|||__||
|/__\|/__\|/__\|/__\|/__\|
```

# Cedar Solana NFT Generator

## Setup

### Requirements
`node ^v16.15.0`

### Installation

Run `yarn` to install the dependencies.

Then duplicate the sample config:
```shell
cp config.sample.json config.json
```

## Running

Just run `yarn start` to run the app. 

You will then find your NFTs in the `output` folder. Each NFT is made of a PNG file +
a JSON file.

Logs are in `var/logs`

App cache files (for statistics etc) are in `.cache` 

Run `yarn start --help` to see options.

```
Cedar Solana NFT generator

Options:
  -V, --version   output the version number
  -q, --quiet     Quiet mode: no console output (default: false)
  -m, --metadata  No images, metadata cache files only (default: false)
  -h, --help      display help for command

```

For more information see [docs](docs/docs.md)

## License

This app is under AGPL-3.0 License. See [LICENSE](LICENSE) for more information.