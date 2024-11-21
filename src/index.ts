import { Telegraf } from 'telegraf';
import LocalSession from 'telegraf-session-local';
import { Command } from './commands/command.class.js';
import { IConfigService } from 'config/config.interface.js';
import { ConfigService } from './config/config.service.js';
import { IClientContext } from 'context/context.interface.js';
import { fileURLToPath, pathToFileURL } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

class Client {
	client: Telegraf<IClientContext>;
	commands: Command[] = [];
	constructor(private readonly configService: IConfigService) {
		this.client = new Telegraf<IClientContext>(this.configService.get('TELEGRAM_BOT_TOKEN'));
		this.client.use(
			new LocalSession({ database: 'sessions.json' }).middleware(),
		);
	}

	public async init() {
		await this.loadCommands();
		for (const command of this.commands) {
			command.execute();
		}
		this.client.launch();
	}

	async loadCommands() {
		const __filename = fileURLToPath(import.meta.url);
		const __dirname = path.dirname(__filename);

		const commandsPath = path.resolve(__dirname, 'commands');

		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.command.js'));

		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const commandModule = await import(pathToFileURL(filePath).href);
			const commandClass = Object.values(commandModule)[0];
			if (typeof commandClass === 'function' && commandClass.prototype instanceof Command) {
				this.commands.push(new (commandClass as new (client: Telegraf<IClientContext>) => Command)(this.client));
			}
		}
	}
}

const client = new Client(new ConfigService());
client.init();