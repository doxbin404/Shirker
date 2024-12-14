import { Telegraf } from 'telegraf';
import { Command } from './command.class.js';
import { IClientContext } from '../context/context.interface.js';
import { AdminService } from '../services/adminService.js';
import { LoggerService } from '../services/loggerService.js';
import { escapeMarkdown } from '../utils/utils.js';
import { DayOfWeek, WeekType, TeacherStatus } from '@prisma/client';

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

		this.client.action('listUsers', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				return await this.adminService.listUsers(ctx);
			}
			catch (error) {
				console.error('Error executing adminMenu command:', error);
				this.loggerService.error('Error executing adminMenu command:', { error });
				const replyMessage = await ctx.reply('При выполнении команды меню администратора произошла ошибка.');
				return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
			}
		});

		this.client.action('blockUser', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				const inputMessage = await ctx.reply('Введите Telegram ID пользователя:');
				ctx.session.messageId = inputMessage.message_id;
				ctx.session.awaitingUserId = true;
			}
			catch (error) {
				console.error('Error executing adminMenu command:', error);
				this.loggerService.error('Error executing adminMenu command:', { error });
				const replyMessage = await ctx.reply('При выполнении команды меню администратора произошла ошибка.');
				return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
			}
		});

		this.client.action('unblockUser', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				const inputMessage = await ctx.reply('Введите Telegram ID пользователя:');
				ctx.session.messageId = inputMessage.message_id;
				ctx.session.awaitingUserIdUnblock = true;
			}
			catch (error) {
				console.error('Error executing adminMenu command:', error);
				this.loggerService.error('Error executing adminMenu command:', { error });
				const replyMessage = await ctx.reply('При выполнении команды меню администратора произошла ошибка.');
				return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
			}
		});

		this.client.action('attendance', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				await this.adminService.attendaceGroup(ctx);
			}
			catch (error) {
				console.error('Error executing adminMenu command:', error);
				this.loggerService.error('Error executing adminMenu command:', { error });
				const replyMessage = await ctx.reply('При выполнении команды меню администратора произошла ошибка.');
				return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
			}
		});

		this.client.action('manageSchedule', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				await this.adminService.manageSchedule(ctx);
			}
			catch (error) {
				console.error('Error executing adminMenu command:', error);
				this.loggerService.error('Error executing adminMenu command:', { error });
				const replyMessage = await ctx.reply('При выполнении команды меню администратора произошла ошибка.');
				return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
			}
		});

		this.client.action('exportData', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				await this.adminService.exportData(ctx);
			}
			catch (error) {
				console.error('Error executing adminMenu command:', error);
				this.loggerService.error('Error executing adminMenu command:', { error });
				const replyMessage = await ctx.reply('При выполнении команды меню администратора произошла ошибка.');
				return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
			}
		});

		this.client.action('addScheduleItem', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				await this.adminService.addScheduleItem(ctx);
			}
			catch (error) {
				console.error('Error executing addScheduleItem action:', error);
				this.loggerService.error('Error executing addScheduleItem action:', { error });
				const replyMessage = await ctx.reply('При добавлении предмета в расписание произошла ошибка.');
				return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
			}
		});

		this.client.action('updateScheduleItem', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				await this.adminService.updateScheduleItem(ctx);
			}
			catch (error) {
				console.error('Error executing updateScheduleItem action:', error);
				this.loggerService.error('Error executing updateScheduleItem action:', { error });
				const replyMessage = await ctx.reply('При изменении предмета в расписании произошла ошибка.');
				return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
			}
		});

		this.client.action('deleteScheduleItem', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				await this.adminService.deleteScheduleItem(ctx);
			}
			catch (error) {
				console.error('Error executing deleteScheduleItem action:', error);
				this.loggerService.error('Error executing deleteScheduleItem action:', { error });
				const replyMessage = await ctx.reply('При удалении предмета из расписания произошла ошибка.');
				return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
			}
		});

		this.client.action('viewSchedule', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				await this.adminService.viewSchedule(ctx);
			}
			catch (error) {
				console.error('Error executing viewSchedule action:', error);
				this.loggerService.error('Error executing viewSchedule action:', { error });
				const replyMessage = await ctx.reply('При просмотре расписания произошла ошибка.');
				return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
			}
		});

		this.client.action('addTeacher', async (ctx) => {
			try {
				await ctx.answerCbQuery();
				await this.adminService.addTeacher(ctx);
			}
			catch (error) {
				console.error('Error executing addTeacher action:', error);
				this.loggerService.error('Error executing addTeacher action:', { error });
				const replyMessage = await ctx.reply('При добавлении преподавателя произошла ошибка.');
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
			if (ctx.session.awaitingUserId) {
				await ctx.deleteMessage(ctx.session.messageId);
				const telegramUserId = parseInt(ctx.message.text);
				await ctx.deleteMessage(ctx.message.message_id);

				const messageReason = await ctx.reply('Введите причину блокировки:');
				ctx.session.messageId = messageReason.message_id;

				ctx.session.awaitingReason = true;
				ctx.session.userIdToBlock = telegramUserId;
				delete ctx.session.awaitingUserId;
			}
			else if (ctx.session.awaitingReason && ctx.from.is_bot === false) {
				await ctx.deleteMessage(ctx.session.messageId);
				const reasonText = ctx.message.text;
				await ctx.deleteMessage(ctx.message.message_id);

				delete ctx.session.awaitingReason;

				return await this.adminService.blockUser(ctx, ctx.session.userIdToBlock, reasonText);
			}
			if (ctx.session.awaitingUserIdUnblock) {
				await ctx.deleteMessage(ctx.session.messageId);
				const telegramUserId = parseInt(ctx.message.text);
				await ctx.deleteMessage(ctx.message.message_id);
				delete ctx.session.awaitingUserIdUnblock;
				return await this.adminService.unblockUser(ctx, telegramUserId);
			}
			if (ctx.session.awaitingScheduleData) {
				try {
					const data = ctx.message.text.split(',').map((item) => item.trim());
					if (
						(ctx.session.scheduleAction === 'add' && data.length !== 8) ||
						(ctx.session.scheduleAction === 'update' && data.length !== 9) ||
						(ctx.session.scheduleAction === 'view' && data.length !== 1)
					) {
						const replyMessage = await ctx.reply('Неверный формат данных. Попробуйте снова.');
						return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
					}

					const parseTime = (time: string) => {
						const [hours, minutes] = time.split(':').map(Number);
						const now = new Date();
						return new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);
					};

					if (ctx.session.scheduleAction === 'add') {
						const [dayOfWeek, startTime, endTime, subjectName, teacherLastName, classroom, weekType, subgroupId] = data;

						const teacher = await this.adminService.scheduleService.findTeacherByLastName(teacherLastName);
						if (!teacher) {
							const replyMessage = await ctx.reply(`Преподаватель с фамилией "${teacherLastName}" не найден.`);
							return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
						}

						const scheduleData = {
							dayOfWeek: dayOfWeek as DayOfWeek,
							startTime: parseTime(startTime),
							endTime: parseTime(endTime),
							subjectName,
							teacherId: teacher.id,
							classroom,
							weekType: weekType as WeekType,
							subgroupId,
						};

						await this.adminService.scheduleService.addScheduleItem(scheduleData);
						const replyMessage = await ctx.reply('Предмет успешно добавлен в расписание.');
						return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
					}
					else if (ctx.session.scheduleAction === 'update') {
						const [id, dayOfWeek, startTime, endTime, subjectName, teacherLastName, classroom, weekType, subgroupId] = data;

						const teacher = await this.adminService.scheduleService.findTeacherByLastName(teacherLastName);
						if (!teacher) {
							const replyMessage = await ctx.reply(`Преподаватель с фамилией "${teacherLastName}" не найден.`);
							return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
						}

						const scheduleData = {
							dayOfWeek: dayOfWeek as DayOfWeek,
							startTime: parseTime(startTime),
							endTime: parseTime(endTime),
							subjectName,
							teacherId: teacher.id,
							classroom,
							weekType: weekType as WeekType,
							subgroupId,
						};

						await this.adminService.scheduleService.updateScheduleItem(id, scheduleData);
						const replyMessage = await ctx.reply('Предмет успешно обновлен.');
						return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
					}
					else if (ctx.session.scheduleAction === 'view') {
						const subgroupId = data[0];

						const schedule = await this.adminService.scheduleService.getScheduleBySubgroup(subgroupId);
						if (schedule.length === 0) {
							const replyMessage = await ctx.reply('Расписание для данной подгруппы пусто.');
							return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
						}

						const scheduleList = schedule.map((item) => {
							if (!item.teacherId) {
								throw new Error(`Missing teacher property for schedule item: ${item.subjectName}`);
							}

							return `*${item.dayOfWeek}*\n${item.startTime.toLocaleTimeString()} - ${item.endTime.toLocaleTimeString()}\n${item.subjectName} (${item.classroom})\nПреподаватель: ${item.teacherId}\nТип недели: ${item.weekType}`;
						}).join('\n\n');


						return ctx.reply(escapeMarkdown(`*Расписание для подгруппы ${subgroupId}:*\n\n${scheduleList}`), { parse_mode: 'MarkdownV2' });
					}

					delete ctx.session.awaitingScheduleData;
					delete ctx.session.scheduleAction;
				}
				catch (error) {
					console.error('Error processing schedule data:', error);
					const replyMessage = await ctx.reply('Произошла ошибка при обработке данных расписания.');
					return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
				}
			}
			if (ctx.session.awaitingTeacherData) {
				try {
					const data = ctx.message.text.split(',').map((item) => item.trim());
					if (data.length !== 4) {
						const replyMessage = await ctx.reply('Неверный формат данных. Попробуйте снова.');
						return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
					}

					const [lastName, firstName, middleName, status] = data;

					if (!Object.values(TeacherStatus).includes(status as TeacherStatus)) {
						const replyMessage = await ctx.reply('Неверный статус преподавателя. Попробуйте снова.');
						return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
					}

					const teacherData = { firstName, middleName, lastName, status: status as TeacherStatus };

					await this.adminService.scheduleService.createTeacher(teacherData);
					const replyMessage = await ctx.reply('Преподаватель успешно добавлен.');
					delete ctx.session.awaitingTeacherData;
					return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
				}
				catch (error) {
					console.error('Error processing teacher data:', error);
					const replyMessage = await ctx.reply('Произошла ошибка при обработке данных преподавателя.');
					return setTimeout(() => ctx.deleteMessage(replyMessage.message_id), 5000);
				}
			}
		});
	}
}