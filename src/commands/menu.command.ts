import { Telegraf } from 'telegraf';
import { Command } from './command.class.js';
import { IClientContext } from '../context/context.interface.js';
import { MenuService } from '../services/menuService.js';
import { UserService } from '../services/userService.js';
import { RegistrationService } from '../services/registrationService.js';

export class MenuCommand extends Command {
	private menuService: MenuService;
	private userService: UserService;
	private registrationService: RegistrationService;

	constructor(client: Telegraf<IClientContext>) {
		super(client);
		this.menuService = new MenuService(client);
		this.registrationService = new RegistrationService(client);
		this.userService = new UserService();
	}

	async execute(): Promise<void> {
		this.client.command('menu', async (ctx) => {
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
				return ctx.reply('Произошла ошибка. Попробуйте повторить позже.');
			}
		});
	}
};