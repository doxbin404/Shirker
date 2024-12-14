import { Telegraf } from 'telegraf';
import { UserService } from './userService.js';
import { ScheduleService } from './scheduleService.js';
import { IClientContext } from '../context/context.interface.js';
import { escapeMarkdown } from '../utils/utils.js';

export class AdminService {
	private userService: UserService;
	public scheduleService: ScheduleService;

	constructor(private client: Telegraf<IClientContext>) {
		this.userService = new UserService();
		this.scheduleService = new ScheduleService();
	}

	public async showAdminMenu(ctx: IClientContext) {
		try {
			if (await this.checkAdminPermission(ctx)) {
				const countUsers = await this.userService.countUsers();

				const message = `*Панель администратора*\n\n*Количество пользователей в системе:* ${countUsers} человек\n**`;

				return await ctx.reply(escapeMarkdown(message), {
					reply_markup: {
						inline_keyboard: [
							[{ text: 'Отправить новость', callback_data: 'sendNews' }],
							[{ text: 'Список пользователей', callback_data: 'listUsers' }],
							[{ text: 'Заблокировать пользователя', callback_data: 'blockUser' }],
							[{ text: 'Разблокировать пользователя', callback_data: 'unblockUser' }],
							[{ text: 'Посещаемость группы', callback_data: 'attendance' }],
							[{ text: 'Расписание', callback_data: 'manageSchedule' }],
							[{ text: 'Статистика посещаемости', callback_data: 'attendanceStats' }],
							[{ text: 'Экспорт данных', callback_data: 'exportData' }],
						],
					},
					parse_mode: 'MarkdownV2',
				});
			}
		}
		catch (error) {
			console.error('Error showing admin menu:', error);
		}
	}

	public async sendNews(ctx: IClientContext, newsText: string) {
		try {
			if (await this.checkAdminPermission(ctx)) {
				await ctx.deleteMessage(ctx.session.messageId);

				const channelId = process.env.NEWS_CHANNEL_ID;

				if (channelId) {
					await this.client.telegram.sendMessage(channelId, newsText);
				}
				else {
					console.error('Channel ID is not set. Please check your environment variables.');
				}

				const users = await this.userService.userList();

				if (users?.length === 0 || users === undefined) {
					return await ctx.reply('Список пользователей пуст.');
				}

				for (const user of users) {
					try {
						if (user.telegramUserId === ctx.from!.id.toString()) continue;
						await this.client.telegram.sendMessage(user.telegramUserId, newsText);
					}
					catch (error) {
						console.error(`Failed to send message to user ${user.telegramUserId}:`, error);
					}
				}
				const answerMessage = await ctx.reply('Новость успешно отправлена всем пользователям и в канал группы.');

				return setTimeout(() => {
					ctx.deleteMessage(answerMessage.message_id);
				}, 5000);
			}
		}
		catch (error) {
			console.error('Error sending news:', error);
			return await ctx.reply('Произошла ошибка при отправке новости.');
		}
	}


	private async checkAdminPermission(ctx: IClientContext) {
		try {
			const admin = await this.userService.findAdminByTelegramId(ctx.from!.id.toString());

			if (admin) {
				return true;
			}
			else {
				return await ctx.reply('❌ У вас нет прав для использования данной команды.', { parse_mode: 'MarkdownV2' });
			}
		}
		catch (error) {
			console.error('Error checking admin permission:', error);
			return false;
		}
	}
}