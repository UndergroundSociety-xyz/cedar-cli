```
 ____ ____ ____ ____ ____
||c |||e |||d |||a |||r ||
||__|||__|||__|||__|||__||
|/__\|/__\|/__\|/__\|/__\|
```
# Documentation

---
- Introduction
- Benchmarks
- How to
    - Step, Resources and Attributes
    - The config file
        - Metadata
        - Options
        - Steps
        - Resources
---
## Introduction
Cedar is a conditional NFT generator for the Solana blockchain. It's part of [Underground Society's Cedar Toolkit](https://github.com/UndergroundSociety-xyz).
It composes and generates images from layers, with their associated json metadata file. These json files follow [Metaplex](https://docs.metaplex.com/programs/token-metadata/token-standard)'s NFT standard.

This project has been inspired by [Hashlips Art Engine](https://github.com/HashLips/hashlips_art_engine), which is fine but is lacking some features regarding multi-layering and conditions.
We wanted to be able to have some attributes only if some other attributes were present for example. Or force a second layer which wouldn't be an attribute:
like hair, split in 2 layers because of some hats (you would have part of the hair underneath the hat and the other part on top).

The project uses [Sharp](https://sharp.pixelplumbing.com/) under the hood, which is a great image generation and handling library.
It is faster than [Node Canvas](https://github.com/Automattic/node-canvas) (used in Hashlips) and offers way more options like blending modes.

## Benchmarks

| Machine specs                             | Supply | Nb of Layers | Generation time |
|:------------------------------------------|-------:|-------------:|----------------:|
| Macbook Pro 15" 2016 - Core i7 - RAM 16GB |   1000 |            5 |             12s |

## How to

In order to use Cedar you have to provide 2 things:
1. Some assets upon which you want to generate some NFTs
2. A valid config file

Assets are essentially the different layers that you will be using. Png format is supported right now but more should be in a near future.
You can store them wherever you want, the way you want. I suggest that you put them in an `assets` folder in the project root directory, though.

Before we enter the config file part, I'll explain how this works so you understand how to fill that config file.

### Resources and Attributes
One good thing compare to other generation software, is that your assets are decoupled from how they will be rendered in Cedar.
This means that you don't have to name them, and store them in a particular way, and that lets you add attributes that are not visible.
Like "family" or "faction" etc etc.

On the other hand, to accomplish that, we have to specify the Resources to tell Cedar what to do with your assets.
These _Resources_ belong to a step and may have an Attribute, or not. They may also have a link to an asset, or not.
There's more: Resources can also be optional, and each Attribute can be weighted by its rarity.

Let's take an example:

> My resulting image, will be composed by a **Background**, and a **Shape**
> The backgrounds can be blue, red and green, and the shapes can be square, circle or triangle.
> I also want circles on a blue background to have an extra attribute, which would be of type "level" and value "over 9000"

To do that, we have 3 steps:
1. Background
2. Shape
3. Level

And each of these steps have some Resources:
1. Background:
    - blue
    - green
    - red
2. Shape:
    - square
    - circle
    - triangle
3. Level
    - over 9000

Level is the only one that is optional, but it's also the only Resource not to have a link to an asset !
It needs a restriction though, we only want to put it on NFTs that have a blue background and a circle shape.

The config file is essentially the specification of these steps, Resources and Attributes, plus all the metadata and config options

### The config file
Just so you know, Underground Society is offering the generation of your NFTs via a graphic interface tool as a paid service which is way more convenient.

#### Metadata
```json
{
  "metadata": {
    "collection": {
      "family": "",
      "name": ""
    },
    "creators": [
      {
        "address": "",
        "share": 0
      }
    ],
    "description": "",
    "name": "",
    "sellerFeesBasisPoint": 0,
    "symbol": ""
  },
  ...
}
```
This part represents the metadata for the whole collection. It basically tells how it's called, the percentage of royalties and the creators.

`sellerFeesBasisPoint`, like in Metaplex's standard, represent the amount of royalties taken on each after market sale.
The percentage you're willing to take is multiplied by 100 (for the coma issues): this means if you want to take **8%**, you'll be writing **800**.

Each one of the `creators` is a shareholder. It takes a valid Solana address, and the share of the royalties as a number between 1 and 100.
If you're alone, there's a good chance you'll put 100.

This works basically the same as [Metaplex](https://docs.metaplex.com/programs/token-metadata/token-standard).

#### Options
```json
{
  "options": {
    "supply": 0,
    "namingStrategy": "default",
    "uniqueEditions": true
  },
  ...
}
```

Options are specific to Cedar.
The `supply` is the number of NFTs you're willing to get.

`uniqueEditions`, if true, adds a validation step that ensures all of the generated NFTs are unique.

`namingStrategy` is on `default`, it means each edition will be named like "{name of the collection} #{edition number}" ("Underground Society #4622" for example).
You can use alternative naming strategies.

If you're not a dev, you should just leave it on `default`, but if you're willing to dig a bit in the code, you can check it out [here](/devs/naming-strategies.md).

#### Steps

```json
{
  "name": "",
  "blend": "normal"
}
```

This is a Step.
- `name` is the key Resources will be referring to.
- `blend` is the blending mode of all the resources that will be in that Step (think here as a layer, sort of). [more](https://www.libvips.org/API/current/libvips-conversion.html#VipsBlendMode).

Steps are just here to specify the blending mode and the order layers should be put, from background to foreground.
```json
"steps": [
    {
        "name": "background",
        "blend": "normal"
    },
    {
        "name": "shape.color",
        "blend": "multiply"
    },
    {
        "name": "shape",
        "blend": "normal"
    }
]
```
The above example would mean that we put the background first, the shape.color right above, and the shape on top. Also, the shape.color layer would be blended in "multiply" mode.

#### Resources
```json
{
  "name": "",
  "step": "",
  "uri": "",
  "outcomes": [
    {"step": "", "name": "", "chance": 0 }
  ],
  "restrictions": [
    {"step": "", "name": ""}
  ],
  "attribute": {
    "trait_type": "",
    "value": ""
  }
}
```

This is a Resource.
- `name` is the displayed name in the generated stats file. It also can help readability during debugging. For a background, it could be "blue", "green" etc...
- `step` is the name of the step the Resource is related to. It could be "background", or "shape"
- `uri` is optional. It's the link to the corresponding asset, if there's one.
- `outcomes` is the specification of possible next Resources.
- `restrictions` specify Resources that don't match with this one.
- `attribute` is optional. If the Resource should be an Attribute, you can specify it:
    - `trait_type` is the type of the Attribute. 
    - `value` is the name of the Attribute.

For example, imagine you have a collection with 2 Backgrounds, 2 Shapes and 4 Shape Colors

> - background:blue
> - background:red
> - shape:triangle
> - shape:circle
> - shape-color:triangle-green
> - shape-color:triangle-yellow
> - shape-color:circle-green
> - shape-color:circle-yellow

Obviously, shape colors should match with their associated shapes. Let's add that you want blue backgrounds with yellow shapes, and red backgrounds with green shapes.
Outcomes let you do that and you can associate a probability:
- `shape:triangle` should outcome `shape-color:triangle-yellow` with chance `5000` and `shape-color:triangle-green` with chance `5000`
- `shape:circle` should outcome `shape-color:circle-yellow` with chance `5000` and `shape-color:circle-green` with chance `5000`
- `shape-color:triangle-green` and `shape-color:circle-green` should outcome `background:red` with chance `10000`
- `shape-color:triangle-yellow` and `shape-color:circle-yellow` should outcome `background:blue` with chance `10000`

Chances are your percentage times 100 (5000 is 50%).
The sum of outcomes chances should be equal to 10000 if an outcome is required. If this is not the case you have 2 solutions:
1. The sum is below 10k: every once in a while (10k - sum chances), there won't be any outcome. This means this is "the end of the path", there will be no more Resources and Cedar will skip to another edition.
2. Add a Resource belonging to another step so that every once in a while, it'll jump to this one. Beware circular references.

You can now visualize the "paths" that you just built:
- `shape:triangle` has a 50% chance to lead to a `shape-color:triangle-yellow` which has 100% chance to lead to a `background:blue`

The order of the Resources in the path has no incidence on how the layers (if there are) will be composed. That's the `steps` array's purpose.

For really complex use cases, restrictions exist. Imagine a "path" like `step1:resource1 => step2:resource2 => step3:resource3 => step4:resource4`. 
Maybe there's a way to think your path the right way, but if you never want the `step4:resource4` to happen with `step1:resource3` for example, you can add the restriction directly in the Resource like:
```json
{
  "name": "resource4",
  "step": "step4",
  "uri": "assets/step4/resource4.png",
  "restrictions": [
    {"step": "step1", "name": "resource3"}
  ],
  "attribute": {
    "trait_type": "Fourth Step",
    "value": "Fourth Resource"
  }
}
```

This will ensure that no matter what outcome has lead to this Resource, if a `step1:resource1` has already been picked for this edition, `step4:resource4` will never happen.