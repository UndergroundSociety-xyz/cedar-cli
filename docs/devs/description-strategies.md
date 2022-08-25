# Naming strategies

Using the [strategy](https://refactoring.guru/design-patterns/strategy) pattern, you can register a strategy in Cedar for custom description of your NFTs.

Let's check the 'default' description strategy

## Example
```ts
import {Resource} from "../types/resource";
import {IDescriptionStrategy} from "./description";

export class DefaultDescriptionStrategy implements IDescriptionStrategy {

    constructor() {
    }

    name: string = 'default';

    execute(config: any, resources: Resource[], edition: number, name: string): string {

        return config.metadata.description
    }
}
```

As you can see it's fairly simple. It implements a custom interface and returns a string corresponding to the description that will be applied. In this case, it just uses the description from the config file.

## Implementation

```ts
import {Resource} from "../types/resource";
import {IDescriptionStrategy} from "./description";
import {CustomDescriptionGenerator} from "./my-custom-lib"

export class CustomDescriptionStrategy implements IDescriptionStrategy {

    constructor() {
    }

    name: string = 'custom';

    execute(config: any, resources: Resource[], edition: number, name: string): string {

        /* 
        here goes your business logic
        the `resources` parameter is an array of Resources. 
        These belong to the current NFT.
        `edition` is the number of the current NFT.
        `name` is the name of this edition: if you're using a custom naming strategy, you might want to use that.
        
        For example let's assume you have a custom lib for description generation, 
        you could do something like that...
         */
        
        const attributes = resources.filter(r => r.attribute).map(r => r.attribute)
        
        return new CustomDescriptionGenerator().generate(attributes, name)
    }
}
```

All you have to do is create a file in `src/utils`, implement `IDescriptionStrategy`, add a custom name and implement your business logic.

Now you just have to register it.

## Registration

```ts
import {IDescriptionStrategy} from "./description";
import {DefaultDescriptionStrategy} from "./default.description-strategy";

export class DescriptionStrategiesRegistry {
    private static _reg: Map<string, IDescriptionStrategy> = new Map<string, IDescriptionStrategy>([
        ['default', new DefaultDescriptionStrategy()],
    ])

    public static getDefault(): IDescriptionStrategy {
        return this._reg.get('default') ?? new DefaultDescriptionStrategy();
    }

    public static get(name: string): IDescriptionStrategy {
        if (!this._reg.has(name)) {
            throw new Error(`Description strategy ${name} not found`);
        }

        return this._reg.get(name) as IDescriptionStrategy;
    }

    public static set(name: string, strategy: IDescriptionStrategy): void {
        this._reg.set(name, strategy);
    }
}
```

Here is the naming strategies registry. Focus of the first private attribute `_reg`.
You just have to add your custom strategy to this Map.

```ts
private static _reg: Map<string, IDescriptionStrategy> = new Map<string, IDescriptionStrategy>([
    ['default', new DefaultDescriptionStrategy()],
    ['custom', new CustomDescriptionStrategy()],
])
```

Here you go, your strategy is registered. By putting 'custom' in the dedicated Options field in the config file, Cedar will be calling your custom strategy for the description.