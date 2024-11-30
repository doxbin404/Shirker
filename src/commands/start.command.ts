import { Telegraf } from 'telegraf';
import { Command } from './command.class.js';
import { IClientContext } from '../context/context.interface.js';
import prisma from '../prisma/prisma.js';

export class StartCommand extends Command {
	constructor(client: Telegraf<IClientContext>) {
		super(client);
	}

	async execute(): Promise<void> {
		this.client.start(async (ctx) => {
			try {
				const telegramUserId = ctx.from.id.toString();

				const user = await prisma.user.findUnique({
					where: { telegramUserId },
				});

				if (user) {
					await ctx.reply(`Привет, ${user.firstName}`);
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
				await ctx.reply('Произошла ошибка. Попробуйте повторить позже.');
				return;
			}
		});

		this.client.action('register', async (ctx) => {
			try {
				await ctx.deleteMessage(ctx.session.messageId);
				const message = await ctx.reply('Введите ваше ФИО:', {
					reply_markup: {
						inline_keyboard: [],
					},
				});
				ctx.session.userDataRegistration = {};
				ctx.session.messageId = message.message_id;
				return ctx.session.registrationStep = 'fullName';
			}
			catch (error) {
				return console.error(error);
			}
		});

		this.client.on('text', async (ctx) => {
			try {
				if (!ctx.session.registrationStep) return;

				const userData = ctx.session.userDataRegistration || {};
				userData.telegramUserId = ctx.from.id.toString();
				userData.telegramUsername = ctx.from.username || '';

				switch (ctx.session.registrationStep) {
				case 'fullName': {
					const fullName = ctx.message.text;
					ctx.session.messageAuthorId = ctx.message.message_id;

					const [lastName, firstName, middleName] = fullName.split(' ');
					userData.firstName = firstName;
					userData.middleName = middleName;
					userData.lastName = lastName;

					await ctx.deleteMessage(ctx.session.messageId);
					await ctx.deleteMessage(ctx.session.messageAuthorId);

					const message = await ctx.reply('Введите ваш номер телефона:', {
						reply_markup: {
							keyboard: [[{ text: 'Отправить номер телефона', request_contact: true }]],
							one_time_keyboard: true,
							resize_keyboard: true,
						},
					});

					ctx.session.messageId = message.message_id;
					ctx.session.registrationStep = 'phoneNumber';
					break;
				}
				case 'phoneNumber': {
					userData.phoneNumber = ctx.message.text;
					ctx.session.messageAuthorId = ctx.message.message_id;

					await ctx.deleteMessage(ctx.session.messageId);
					await ctx.deleteMessage(ctx.session.messageAuthorId);

					const message = await ctx.reply('Введите ваш день рождения:', {
						reply_markup: {
							inline_keyboard: [],
						},
					});

					ctx.session.messageId = message.message_id;
					ctx.session.registrationStep = 'birthday';
					break;
				}
				case 'birthday': {
					userData.birthday = ctx.message.text;
					ctx.session.messageAuthorId = ctx.message.message_id;

					await ctx.deleteMessage(ctx.session.messageId);
					await ctx.deleteMessage(ctx.session.messageAuthorId);
					userData.missedLessons = 0;
					userData.visitedLessons = 0;
					userData.settings = [];
					userData.createdAt = new Date();
					userData.updatedAt = new Date();
					const createdUser = await prisma.user.create({ data: userData });

					await ctx.reply(`Привет, ${createdUser.firstName} ${createdUser.middleName}`);

					delete ctx.session.registrationStep;
					delete ctx.session.userDataRegistration;
					delete ctx.session.messageId;
					delete ctx.session.messageAuthorId;
					break;
				}
				}
			}
			catch (error) {
				console.error(error);
			}
		});

		this.client.on('contact', async (ctx) => {
			try {
				if (ctx.session.registrationStep === 'phoneNumber') {
					const phoneNumber = ctx.message.contact.phone_number;
					ctx.session.messageAuthorId = ctx.message.message_id;

					const userData = ctx.session.userDataRegistration || {};
					userData.phoneNumber = phoneNumber;

					await ctx.deleteMessage(ctx.session.messageId);
					await ctx.deleteMessage(ctx.session.messageAuthorId);
					const message = await ctx.reply('Введите ваш день рождения:');

					ctx.session.messageId = message.message_id;
					return ctx.session.registrationStep = 'birthday';
				}
			}
			catch (error) {
				console.error(error);
			}
		});
	}
}