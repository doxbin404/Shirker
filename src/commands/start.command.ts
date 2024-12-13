import { Telegraf } from 'telegraf';
import { Command } from './command.class.js';
import { IClientContext } from '../context/context.interface.js';
import { RegistrationService } from '../services/registrationService.js';
import { UserService } from '../services/userService.js';
import { LoggerService } from '../services/loggerService.js';
import { MenuService } from '../services/menuService.js';

export class StartCommand extends Command {
	private registrationService: RegistrationService;
	private userService: UserService;
	private loggerService: LoggerService;
	private menuService: MenuService;

	constructor(client: Telegraf<IClientContext>) {
		super(client);
		this.registrationService = new RegistrationService(client);
		this.userService = new UserService();
		this.loggerService = new LoggerService();
		this.menuService = new MenuService(client);
	}

	async execute(): Promise<void> {
		this.client.start(async (ctx) => {
			try {
				const user = await this.userService.findUserByTelegramId(ctx.from.id.toString());

				if (user) {
					await this.menuService.showMenu(ctx);
				}
				else {
					await ctx.deleteMessage(ctx.message.message_id);
					await this.registrationService.startRegistration(ctx);
				}
			}
			catch (error) {
				console.error(error);
				await ctx.reply('Произошла ошибка. Попробуйте повторить позже.');
				this.loggerService.error('Error executing start command:', { error });
			}
		});

		this.client.action('register', async (ctx) => {
			try {
				await this.registrationService.handleRegistrationAction(ctx);
			}
			catch (error) {
				console.error(error);
				await ctx.reply('Произошла ошибка при регистрации. Попробуйте повторить позже.');
				this.loggerService.error('Error executing register action:', { error });
			}
		});

		this.client.on('text', async (ctx) => {
			try {
				await this.registrationService.handleTextMessage(ctx);
			}
			catch (error) {
				console.error(error);
				await ctx.reply('Произошла ошибка при обработке текста. Попробуйте повторить позже.');
				this.loggerService.error('Error executing text message:', { error });
			}
		});

		this.client.on('contact', async (ctx) => {
			try {
				await this.registrationService.handleContactMessage(ctx);
			}
			catch (error) {
				console.error(error);
				await ctx.reply('Произошла ошибка при обработке контакта. Попробуйте повторить позже.');
				this.loggerService.error('Error executing contact message:', { error });
			}
		});
	}
}
