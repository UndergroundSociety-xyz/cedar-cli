import {Resource} from "../types/resource";
import {IDescriptionStrategy} from "./description";
import {Configuration, OpenAIApi} from "openai";

export class OpenAiTemplateDescriptionStrategy implements IDescriptionStrategy {

    constructor() {
        require('dotenv').config()
        this.configuration = new Configuration({
            apiKey: process.env.OPENAI_API_KEY,
        })
        this.openai = new OpenAIApi(this.configuration)
    }

    name: string = 'ai-default';
    configuration;
    openai;

    async execute(config: any, resources: Resource[], edition: number, name: string): Promise<string> {
        const prompt = `Tell me the story of ${name}:`

        const response = await this.openai.createCompletion({
            model: process.env.OPENAI_COMPLETION_MODEL ?? "text-davinci-002",
            prompt: prompt,
            temperature: 0.9,
            presence_penalty: 2.0,
            max_tokens: 150,
        });
        const choices = response?.data?.choices as {text: string, index: number, logprobs: any, "finish_reason": string}[]

        return choices[0].text.replace(/(\r\n|\n|\r)/gm,'')
    }
}