import { Telegraf } from 'telegraf';
import { Command } from './command.class.js';
import { IClientContext } from '../context/context.interface.js';
import { AdminService } from '../services/adminService.js';
import { LoggerService } from '../services/loggerService.js';

export class AdminMenuCommand extends Command {
	private adminService: AdminService;
	private loggerService: LoggerService;

	constructor(client: Telegraf<IClientContext>) {
		super(client);
		this.adminService = new AdminService(client);
		this.loggerService = new LoggerService();
	}

	async execute() {
		this.client.command('adminMenu', async (ctx) => {
			try {
				await this.adminService.showAdminMenu(ctx);
			}
			catch (error) {
				console.error('Error executing adminMenu command:', error);
				this.loggerService.error('Error executing adminMenu command:', { error });
				const replyMessage = await ctx.reply('При выполнении команды меню администратора произошла ошибка.');
				return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
			}
		});

		this.client.action('sendNews', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				const inputMessage = await ctx.reply('Введите текст новости:');
				ctx.session.messageId = inputMessage.message_id;
				ctx.session.awaitingNewsText = true;
			}
			catch (error) {
				console.error('Error executing sendNews button:', error);
				this.loggerService.error('Error executing sendNews button:', { error });
				const replyMessage = await ctx.reply('При выполнении команды меню администратора произошла ошибка.');
				return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
			}
		});

		this.client.on('text', async (ctx) => {
			if (ctx.session.awaitingNewsText) {
				try {
					const newsText = ctx.message.text;

					ctx.session.awaitingNewsText = false;
					await ctx.deleteMessage(ctx.message.message_id);
					return await this.adminService.sendNews(ctx, newsText);
				}
				catch (error) {
					console.error('Error sending news:', error);
					this.loggerService.error('Error sending news:', { error });
					const replyMessage = await ctx.reply('Произошла ошибка при отправке новости.');
					return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
				}
			}
		});
	}
}