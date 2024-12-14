import { Telegraf } from 'telegraf';
import { Command } from './commands/command.class.js';
import { IConfigService } from './config/config.interface.js';
import { ConfigService } from './config/config.service.js';
import { IClientContext } from './context/context.interface.js';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { ServiceBox } from './services/boxService.js';
import { LoggerService } from './services/loggerService.js';
import { ILogger } from './interfaces/interfaces.js';
import LocalSession from 'telegraf-session-local';
import prisma from './prisma/prisma.js';
import chalk from 'chalk';
import path from 'node:path';
import fs from 'node:fs';

const IBox = new ServiceBox();
const BoxContents = IBox.createBox();
class Client {
	private boxContents = BoxContents;
	private logger: ILogger;

	client: Telegraf<IClientContext>;
	commands: Command[] = [];

	constructor(private readonly configService: IConfigService, logger: ILogger) {
		this.client = new Telegraf<IClientContext>(this.configService.get('TELEGRAM_BOT_TOKEN'));
		this.client.use(
			new LocalSession({ database: 'sessions.json' }).middleware(),
		);
		this.logger = logger;
	}

	public async init() {
		IBox.addItem(this.boxContents, { name: `${chalk.bold.cyan('Telegraf.js')}`, value: 'v4.16.3\n' });

		await this.loadCommands();
		await this.connectPrisma();

		for (const command of this.commands) {
			command.execute();
		}

		IBox.showBox(this.boxContents, { borderColor: 'white', borderStyle: 'round', dimBorder: true, padding: 1, margin: 1 });
		await this.client.launch();
	}

	private async loadCommands() {
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
				IBox.addItem(this.boxContents, { name: commandClass.name, value: `${chalk.bold.green('Loaded')}` });
				this.logger.info(`Command ${commandClass.name} loaded`);
			}
		}
	}

	private async connectPrisma() {
		try {
			await prisma.$connect();
			IBox.addItem(this.boxContents, { name: `${chalk.bold.hex('#16A394')('Prisma Client')}`, value: `${chalk.bold.green('Connected')}` });
			this.logger.info('Prisma Client connected');
		}
		catch (error) {
			console.error(error);
			IBox.addItem(this.boxContents, { name: `${chalk.bold.hex('#16A394')('Prisma Client')}`, value: `${chalk.bold.red('Error')}` });
			this.logger.error('Prisma Client connection error', { error });
		}
	}
}
const logger = new LoggerService();
const client = new Client(new ConfigService(), logger);
client.init();