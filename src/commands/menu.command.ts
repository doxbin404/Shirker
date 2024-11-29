import { Telegraf } from 'telegraf';
import { Command } from './command.class.js';
import { IClientContext } from '../context/context.interface.js';
import { escapeMarkdown } from '../utils/utils.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import prisma from '../prisma/prisma.js';

export class MenuCommand extends Command {
	constructor(client: Telegraf<IClientContext>) {
		super(client);
	}

	async execute(): Promise<void> {
		this.client.command('menu', async (ctx) => {
			try {
				const user = await prisma.user.findUnique({
					where: {
						telegramUserId: ctx.from.id.toString(),
					},
				});

				if (user) {
					const message = `*Привет ${user.firstName} ${user.middleName}*\n\n*Информация о вас:*\n*Telegram ID:* [${user.telegramUserId}](tg://user?id=${user.telegramUserId})\n*Telegram username*: @${user.telegramUsername}\n*ФИО:* ${user.lastName} ${user.firstName} ${user.middleName}\n*Телефон:* \\${user.phoneNumber}\n*День рождения:* ${escapeMarkdown(user.birthday)}\n\n*Ваша статистика:*\n*Пар посещено:* $null\n*Пропущено пар:* $null`;
					await ctx.reply(message, {
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
				}
				else {
					const message = await ctx.reply('Вас нет в базе данных. Хотите зарегистрироваться?', {
						reply_markup: {
							inline_keyboard: [[{ text: 'Зарегистрироваться', callback_data: 'register' }]],
						},
					});
					ctx.session.messageId = message.message_id;
				}
			}
			catch (error) {
				console.error(error);
				return ctx.reply('Произошла ошибка. Попробуйте повторить позже.');
			}
		});

		this.client.action('schedule', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				const __filename = fileURLToPath(import.meta.url);
				const __dirname = path.dirname(__filename);
				const filePath = path.resolve(__dirname, '../../image/i.jpg');
				const photo = fs.createReadStream(filePath);
				await ctx.replyWithPhoto({ source: photo });
			}
			catch (error) {
				console.error(error);
			}
		});

		this.client.action('homework', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				await ctx.reply('Вы выбрали Действие 2');
			}
			catch (error) {
				console.error(error);
			}
		});

		this.client.action('settings', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				await ctx.reply('Вы выбрали Действие 3');
			}
			catch (error) {
				console.error(error);
			}
		});
	}
};