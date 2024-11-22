import { Context } from 'telegraf';

export interface SessionData {
	test: boolean;
	registrationStep?: string;
	userDataRegistration?: any;
	messageId?: number;
	messageAuthorId?: number;
}

export interface IClientContext extends Context {
	session: SessionData;
}