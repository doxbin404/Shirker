import { Telegraf } from 'telegraf';
import { Command } from './command.class.js';
import { IClientContext } from '../context/context.interface.js';

export class StartCommand extends Command {
	constructor(client: Telegraf<IClientContext>) {
		super(client);
	}

	async execute(): Promise<void> {
		this.client.start(async (ctx) => {
			try {
				await ctx.reply('Привет! Это бот для учебной группы.');
			}
			catch (error) {
				console.error(error);
				await ctx.reply('Произошла ошибка. Попробуйте повторить позже.');
				return;
			}
		});
	}
}