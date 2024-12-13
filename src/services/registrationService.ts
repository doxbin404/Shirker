import { Telegraf } from 'telegraf';
import { IClientContext } from '../context/context.interface';
import { UserService } from './userService.js';
import { IUserData } from '../interfaces/interfaces.js';

export class RegistrationService {
	private userService: UserService;

	constructor(private client: Telegraf<IClientContext>) {
		this.userService = new UserService();
	}

	async startRegistration(ctx: IClientContext) {
		const message = await ctx.reply('Привет, я вижу ты новый пользователь. Для того чтобы использовать мой функционал тебе нужно зарегистрироваться. Нажимай на кнопку ниже!', {
			reply_markup: {
				inline_keyboard: [[{ text: 'Зарегистрироваться', callback_data: 'register' }]],
			},
		});

		ctx.session.messageId = message.message_id;
	}

	async handleRegistrationAction(ctx: IClientContext) {
		await ctx.deleteMessage(ctx.session.messageId);

		const message = await ctx.reply('Введите ваше ФИО:');
		ctx.session.messageId = message.message_id;

		ctx.session.userDataRegistration = {};
		ctx.session.registrationStep = 'fullName';
	}

	async handleTextMessage(ctx: IClientContext) {
		if (!ctx.session.registrationStep || !ctx.message) return;

		const userData = ctx.session.userDataRegistration;

		userData.telegramUserId = ctx.from?.id?.toString();
		userData.telegramUsername = ctx.from?.username;

		if ('text' in ctx.message) {
			switch (ctx.session.registrationStep) {
			case 'fullName':
				await this.handleFullNameStep(ctx, userData);
				break;
			case 'phoneNumber':
				await this.handlePhoneNumberStep(ctx, userData);
				break;
			case 'birthday':
				await this.handleBirthdayStep(ctx, userData);
				break;
			}
		}
	}

	async handleContactMessage(ctx: IClientContext) {
		if (ctx.message && ctx.session.registrationStep === 'phoneNumber' && 'contact' in ctx.message) {
			const phoneNumber = ctx.message.contact.phone_number;

			ctx.session.messageAuthorId = ctx.message.message_id;
			const userData: Partial<IUserData> = ctx.session.userDataRegistration;

			userData.phoneNumber = phoneNumber;

			await ctx.deleteMessage(ctx.session.messageId);
			await ctx.deleteMessage(ctx.session.messageAuthorId);

			const message = await ctx.reply('Введите ваш день рождения:');

			ctx.session.messageId = message.message_id;
			ctx.session.registrationStep = 'birthday';
		}
		else {
			await ctx.deleteMessage(ctx.session.messageAuthorId);
			return await ctx.reply('Не удалось получить номер телефона. Пожалуйста, попробуйте снова.');
		}
	}

	private async handleFullNameStep(ctx: IClientContext, userData: IUserData) {
		await ctx.deleteMessage(ctx.session.messageId);
		if (!ctx.message || !('text' in ctx.message)) {
			const message = await ctx.reply('Не удалось получить ваше ФИО. Пожалуйста, попробуйте снова.');
			ctx.session.messageId = message.message_id;
			await ctx.deleteMessage(ctx.session.messageAuthorId);
			return;
		}

		const fullName = ctx.message.text.trim();
		if (!fullName || fullName.split(' ').length < 2) {
			const message = await ctx.reply('Пожалуйста, введите ваше ФИО в формате: Фамилия Имя Отчество.');
			ctx.session.messageId = message.message_id;
			await ctx.deleteMessage(ctx.session.messageAuthorId);
			return;
		}

		ctx.session.messageAuthorId = ctx.message.message_id;

		const [lastName, firstName, middleName] = fullName.split(' ');
		userData.firstName = firstName || '';
		userData.middleName = middleName || '';
		userData.lastName = lastName || '';

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
	}

	private async handlePhoneNumberStep(ctx: IClientContext, userData: IUserData) {
		await ctx.deleteMessage(ctx.session.messageId);
		if (!ctx.message || !('text' in ctx.message)) {
			const message = await ctx.reply('Не удалось получить ваш номер телефона. Пожалуйста, попробуйте снова.');
			ctx.session.messageId = message.message_id;
			await ctx.deleteMessage(ctx.session.messageAuthorId);
			return;
		}

		const phoneNumber = ctx.message.text.trim();
		ctx.session.messageAuthorId = ctx.message.message_id;
		if (!phoneNumber || !/^\+?\d{10,15}$/.test(phoneNumber)) {
			const message = await ctx.reply('Пожалуйста, введите корректный номер телефона.');
			ctx.session.messageId = message.message_id;
			await ctx.deleteMessage(ctx.session.messageAuthorId);
			return;
		}

		userData.phoneNumber = phoneNumber;

		await ctx.deleteMessage(ctx.session.messageAuthorId);

		const message = await ctx.reply('Введите ваш день рождения:');
		ctx.session.messageId = message.message_id;

		ctx.session.registrationStep = 'birthday';
	}

	private async handleBirthdayStep(ctx: IClientContext, userData: Partial<IUserData>) {
		await ctx.deleteMessage(ctx.session.messageId);
		if (!ctx.message || !('text' in ctx.message)) {
			const message = await ctx.reply('Пожалуйста, отправьте текстовое сообщение с вашим днем рождения.');
			ctx.session.messageId = message.message_id;
			await ctx.deleteMessage(ctx.session.messageAuthorId);
			return;
		}

		const birthday = ctx.message.text.trim();
		ctx.session.messageAuthorId = ctx.message.message_id;
		if (!birthday || !/^\d{2}\.\d{2}\.\d{4}$/.test(birthday)) {
			const message = await ctx.reply('Пожалуйста, введите дату рождения в формате ДД.ММ.ГГГГ.');
			ctx.session.messageId = message.message_id;
			await ctx.deleteMessage(ctx.session.messageAuthorId);
			return;
		}

		userData.birthday = birthday;
		userData.missedLessons = 0;
		userData.visitedLessons = 0;
		userData.settings = [];
		userData.createdAt = new Date();
		userData.updatedAt = new Date();

		await ctx.deleteMessage(ctx.session.messageAuthorId);

		const createdUser = await this.userService.createUser(userData as IUserData);

		await ctx.reply(`Привет, ${createdUser.firstName} ${createdUser.middleName}`);

		delete ctx.session.registrationStep;
		delete ctx.session.userDataRegistration;
		delete ctx.session.messageId;
		delete ctx.session.messageAuthorId;
	}
}