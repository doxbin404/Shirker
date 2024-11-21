import { Context } from 'telegraf';

export interface SessionData {
	test: boolean;
}

export interface IClientContext extends Context {
	session: SessionData;
}