import {IDescriptionStrategy} from "./description";
import {DefaultDescriptionStrategy} from "./default.description-strategy";
import {OrdinalDescriptionStrategy} from "./ordinal.description-strategy";
import {OpenAiDemoDescriptionStrategy} from "./open-ai-demo.description-strategy";

export class DescriptionStrategiesRegistry {
    private static _reg: Map<string, IDescriptionStrategy> = new Map<string, IDescriptionStrategy>([
        ['default', new DefaultDescriptionStrategy()],
        ['ordinal', new OrdinalDescriptionStrategy()],
        ['ai-demo', new OpenAiDemoDescriptionStrategy()],
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