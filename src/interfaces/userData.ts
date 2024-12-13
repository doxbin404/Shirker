export interface IUserData {
    telegramUserId: string;
    telegramUsername: string;
    firstName: string;
    middleName?: string;
    lastName: string;
    phoneNumber: string;
    birthday: string;
    missedLessons: number;
    visitedLessons: number;
    settings: Array<{ key: string; value: string | number | boolean }>;
    createdAt: Date;
    updatedAt: Date;
}
