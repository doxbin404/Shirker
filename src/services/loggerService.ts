import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ILogger } from '../interfaces/interfaces.js';

type LogMeta = Record<string, unknown>;

export class LoggerService implements ILogger {
	private logger: winston.Logger;

	constructor() {
		this.logger = winston.createLogger({
			level: 'info',
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.json(),
			),
			transports: [
				new winston.transports.Console(),
				new DailyRotateFile({
					filename: 'logs/application-%DATE%.log',
					datePattern: 'YYYY-MM-DD',
					zippedArchive: true,
					maxSize: '20m',
					maxFiles: '14d',
				}),
			],
		});
	}

	public info(message: string, meta?: LogMeta): void {
		this.logger.info(message, meta);
	}

	public error(message: string, meta?: LogMeta): void {
		this.logger.error(message, meta);
	}

	public warn(message: string, meta?: LogMeta): void {
		this.logger.warn(message, meta);
	}

	public debug(message: string, meta?: LogMeta): void {
		this.logger.debug(message, meta);
	}
}