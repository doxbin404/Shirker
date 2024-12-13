import { Context } from 'telegraf';

export interface SessionData {
	registrationStep?: string;
	userDataRegistration?: any;
	messageId?: number;
	messageAuthorId?: number;
	awaitingNewsText?: boolean;
	awaitingUserId?: boolean;
	awaitingReason?: boolean;
	userIdToBlock: number;
	awaitingUserIdUnblock?: boolean;
	awaitingScheduleData?: boolean;
	scheduleAction: any;
	awaitingTeacherData?: boolean;
}

export interface IClientContext extends Context {
	session: SessionData;
}