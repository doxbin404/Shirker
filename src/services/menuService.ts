import { Telegraf } from 'telegraf';
import { IClientContext } from '../context/context.interface.js';
import { UserService } from './userService.js';
import { RegistrationService } from './registrationService.js';
import { escapeMarkdown, getGreetingByTime } from '../utils/utils.js';

export class MenuService {
	private userService: UserService;
	private registrationService: RegistrationService;

	constructor(private client: Telegraf<IClientContext>) {
		this.userService = new UserService();
		this.registrationService = new RegistrationService(client);
	}

	async showMenu(ctx: IClientContext) {
		try {
			if (ctx.chat && (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup')) {
				return await ctx.reply(escapeMarkdown('❌ Эта команда не может быть использована в групповом чате. Во избежании публикации личных данных'), { parse_mode: 'MarkdownV2' });
			}

			const user = await this.userService.findUserByTelegramId(ctx.from!.id.toString());

			if (user) {
				const message = `*${getGreetingByTime()} ${user.firstName} ${user.middleName}*\n\n*Информация о вас:*\n*Telegram ID:* [${user.telegramUserId}](tg://user?id=${user.telegramUserId})\n*Telegram username*: @${user.telegramUsername}\n*ФИО:* ${user.lastName} ${user.firstName} ${user.middleName}\n*Телефон:* ${user.phoneNumber}\n*День рождения:* ${user.birthday}\n\n*Ваша статистика:*\n*Пар посещено:* ${user.visitedLessons}\n*Пропущено пар:* ${user.missedLessons}`;

				const menuMessage = await ctx.reply(escapeMarkdown(message), {
					reply_markup: {
						inline_keyboard: [
							[
								{ text: 'Расписание', callback_data: 'schedule' },
								{ text: 'Домашняя работа', callback_data: 'homework' },
								{ text: 'Настройки', callback_data: 'settings' },
							],
						],
					},
					parse_mode: 'MarkdownV2',
				});
				ctx.session.messageId = menuMessage.message_id;
			}
			else {
				return await this.registrationService.startRegistration(ctx);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	async schedule(ctx: IClientContext) {
		try {
			if (ctx.session.messageId) await ctx.deleteMessage(ctx.session.messageId);
			const user = await this.userService.findUserByTelegramId(ctx.from!.id.toString());

			if (user) {
				const message = `
				*Расписание:*\n
				*Дата:* ${new Date().toLocaleDateString()}\n
				*День недели:* ${new Date().toLocaleDateString('ru', { weekday: 'long' })}\n\n

				*Список пар на сегодня:*
				
				`;

				const menuMessage = await ctx.reply(escapeMarkdown(message), {
					reply_markup: {
						inline_keyboard: [
							[
								{ text: 'Расписание', callback_data: 'schedule' },
								{ text: 'Домашняя работа', callback_data: 'homework' },
								{ text: 'Настройки', callback_data: 'settings' },
							],
						],
					},
					parse_mode: 'MarkdownV2',
				});
				ctx.session.messageId = menuMessage.message_id;
			}
			else {
				return await this.registrationService.startRegistration(ctx);
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	async homework(ctx: IClientContext) {
		try {
			if (ctx.chat && (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup')) {
				return await ctx.reply(escapeMarkdown('❌ Эта команда не может быть использована в групповом чате. Во избежании публикации личных данных'), { parse_mode: 'MarkdownV2' });
			}
		}
		catch (error) {
			console.error(error);
		}
	}

	async settings(ctx: IClientContext) {
		try {
			if (ctx.chat && (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup')) {
				return await ctx.reply(escapeMarkdown('❌ Эта команда не может быть использована в групповом чате. Во избежании публикации личных данных'), { parse_mode: 'MarkdownV2' });
			}
		}
		catch (error) {
			console.error(error);
		}
	}
}