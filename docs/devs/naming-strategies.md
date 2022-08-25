# Naming strategies

Using the [strategy](https://refactoring.guru/design-patterns/strategy) pattern, you can register a strategy in Cedar for custom naming of your NFTs.

For example, we use the 'cyberpunk' naming strategy, so that our NFTs are named with real first and lastnames !

## Example
```ts
import {IResource} from "./classes";
import {EGender, Name} from "@undergroundsociety/cybername-gen";
import {INamingStrategy} from "./naming";

export class CyberpunkNamingStrategy implements INamingStrategy {

    constructor() {
    }

    name: string = 'cyberpunk';

    execute(resources: IResource[], edition: number): string {
        const genderValue: string | undefined = resources.find(r => r.step === 'gender')?.attribute?.value

        if (!genderValue) {
            throw new Error('No gender attribute found.')
        }

        const gender = genderValue === 'male' ? EGender.male : EGender.female;

        return new Name(gender).toString()
    }
}
```

This is the cyberpunk naming strategy. As you can see it's fairly simple. It implements a custom interface and returns a string corresponding to the name that will be applied.

## Implementation

```ts
import {IResource} from "./classes";
import {INamingStrategy} from "./naming";
import * as customLib from '@customLib'

export class CustomNamingStrategy implements INamingStrategy {

    constructor() {
    }

    name: string = 'custom-name';

    execute(resources: IResource[], edition: number): string {
        
        /* 
        here goes your business logic
        the `resources` parameter is an array of Resources. 
        These belong to the current NFT.
        `edition` is the number of the current NFT.
        
        For example let's assume you have a custom lib for name generation, 
        you could do something like that...
         */
        
        const firstname = customLib.generateFirstname()
        const lastname = customLib.generateLastname()
        
        return `${firstname} ${lastname}` 
    }
}
```

All you have to do is create a file in `src/utils`, implement `INamingStrategy`, add a custom name and implement your business logic.

Now you just have to register it.

## Registration

```ts
import {INamingStrategy} from "./naming";
import {CyberpunkNamingStrategy} from "./cyberpunk.naming-strategy";
import {DefaultNamingStrategy} from "./default.naming-strategy";

export class NamingStrategiesRegistry {
    private static _reg: Map<string, INamingStrategy> = new Map<string, INamingStrategy>([
        ['default', new DefaultNamingStrategy()],
        ['cyberpunk', new CyberpunkNamingStrategy()]
    ])

    public static getDefault(): INamingStrategy {
        return this._reg.get('default') ?? new DefaultNamingStrategy();
    }

    public static get(name: string): INamingStrategy {
        if (!this._reg.has(name)) {
            throw new Error(`Naming strategy ${name} not found`);
        }

        return this._reg.get(name) as INamingStrategy;
    }

    public static set(name: string, strategy: INamingStrategy): void {
        this._reg.set(name, strategy);
    }
}
```

Here is the naming strategies registry. Focus of the first private attribute `_reg`.
You just have to add your custom strategy to this Map.

```ts
private static _reg: Map<string, INamingStrategy> = new Map<string, INamingStrategy>([
    ['default', new DefaultNamingStrategy()],
    ['cyberpunk', new CyberpunkNamingStrategy()],
    ['custom-name', new CustomNamingStrategy()],
])
```

Here you go, your strategy is registered. By putting 'custom-name' in the dedicated Options field in the config file, Cedar will be calling your custom strategy for the naming.