import {INamingStrategy} from "./naming";
import {Resource} from "../types/resource";
import {Configuration, OpenAIApi} from "openai";

export class OpenAiTemplateNamingStrategy implements INamingStrategy {

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

    async execute(config: any, resources: Resource[], edition: number): Promise<string> {

        const prompt = `Give me a random gender neutral name`


        const response = await this.openai.createCompletion({
            model: process.env.OPENAI_COMPLETION_MODEL ?? "text-davinci-002",
            prompt: prompt,
            temperature: 0.9,
            presence_penalty: 2.0,
            max_tokens: 6,
        });
        const choices = response?.data?.choices as {text: string, index: number, logprobs: any, "finish_reason": string}[]

        return choices[0].text.replace(/(\r\n|\n|\r)/gm,'')
    }
}