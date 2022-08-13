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

You can fill this config file by hand or using the config CLI, it'll guide you through all the steps
```shell
yarn config:generate
```

This command will output a file named `config-YYYY-MM-dd.json`. You can either rename this file using
```shell
mv config-YYYY-MM-dd.json config.json
```
or use the `--config` flag when you run the app.

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

## Demo

A few assets are available in `demo-assets` folder.

Just run :
```shell
cp demo.config.json config.json
```
and :
```shell
yarn start
```

Files will be in the `output` folder.

## License

This app is under AGPL-3.0 License. See [LICENSE](LICENSE) for more information.