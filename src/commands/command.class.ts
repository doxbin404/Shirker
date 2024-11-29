import { IClientContext } from 'context/context.interface';
import { Telegraf } from 'telegraf';

export abstract class Command {
	protected client: Telegraf<IClientContext>;

	constructor(client: Telegraf<IClientContext>) {
		this.client = client;
	}

	abstract execute(): void;
}