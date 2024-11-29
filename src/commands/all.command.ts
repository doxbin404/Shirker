import { Telegraf } from 'telegraf';
import { Command } from './command.class.js';
import { IClientContext } from '../context/context.interface.js';
import prisma from '../prisma/prisma.js';

export class AllCommand extends Command {
	constructor(client: Telegraf<IClientContext>) {
		super(client);
	}

	async execute(): Promise<void> {
		this.client.command('all', async (ctx) => {
			try {
				const users = await prisma.user.findMany();

				const mentions: string[] = users.map(user => {
					if (user.telegramUsername) {
						return `@${user.telegramUsername}`;
					}
					else {
						return `[${user.firstName} ${user.lastName}](tg://user?id=${user.telegramUserId})`;
					}
				});

				await ctx.reply(`Упоминание всех участников:\n${mentions.join(' ')}`, { parse_mode: 'Markdown' });
			}
			catch (error) {
				console.error(error);
				return ctx.reply('Произошла ошибка. Попробуйте повторить позже.');
			}
		});
	}
};