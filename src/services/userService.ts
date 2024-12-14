import { IUserData } from '../interfaces/interfaces.js';
import prisma from '../prisma/prisma.js';

export class UserService {
	public async findUserByTelegramId(telegramUserId: string) {
		try {
			return prisma.user.findUnique({ where: { telegramUserId } });
		}
		catch (error) {
			console.error('Error finding user by Telegram ID:', error);
		}
	}

	public async findAdminByTelegramId(telegramUserId: string) {
		return prisma.admin.findUnique({ where: { telegramUserId } });
	}

	public async createUser(userData: IUserData) {
		const { middleName = '' } = userData;
		return prisma.user.create({
			data: { ...userData, middleName },
		});
	}

	public async countUsers() {
		try {
			return await prisma.user.count();
		}
		catch (error) {
			console.error('Error counting users:', error);
		}
	}

	public async userList() {
		try {
			return await prisma.user.findMany();
		}
		catch (error) {
			console.error('Error getting user list:', error);
		}
	}

	public async blockUser(blockedByUserId: number, telegramUserId: number, reason: string) {
		try {
			const user = await this.findUserByTelegramId(telegramUserId.toString());

			if (!user || user === undefined) {
				throw new Error('Пользователь не найден');
			}

			return await prisma.blockedUser.create({
				data: {
					userId: user.id,
					reason,
					blockedBy: blockedByUserId,
				 },
			});
		}
		catch (error) {
			console.error('Error blocking user:', error);
		}
	}

	public async unblockUser(telegramUserId: number) {
		try {
			const user = await this.findUserByTelegramId(telegramUserId.toString());

			if (!user || user === undefined) {
				throw new Error('Пользователь не найден');
			}

			return prisma.blockedUser.delete({
				where: {
					userId: user.id,
				},
			});
		}
		catch (error) {
			console.error('Error unblocking user:', error);
		}
	}
}