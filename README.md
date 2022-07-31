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
