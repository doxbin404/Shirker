import { IClientContext } from 'context/context.interface';
import { Telegraf } from 'telegraf';

export abstract class Command {
	constructor(public client: Telegraf<IClientContext>) {}
	abstract execute(): void;
}