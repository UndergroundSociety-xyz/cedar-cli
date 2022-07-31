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