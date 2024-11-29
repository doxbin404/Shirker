if (user) {
	const message =
    `
    *Привет ${user.firstName} ${user.middleName}*
    *Информация о вас:*
    *Telegram ID:* [${user.telegramUserId}](tg://user?id=${user.telegramUserId})
    *Telegram username*: @${user.telegramUsername}
    *ФИО:* ${user.lastName} ${user.firstName} ${user.middleName}
    *Телефон:* ${user.phoneNumber}
    *День рождения:* ${user.birthday}
    *Ваша статистика:*
    *Пар посещено:* $null
    *Пропущено пар:* $null
    `;

	const testMessage = `*Привет ${user.firstName} ${user.middleName}*\n\n*Информация о вас:*`;
	await ctx.reply(testMessage, {
		reply_markup: {
			inline_keyboard: [
				[{ text: 'Действие 1', callback_data: 'action1' }],
				[{ text: 'Действие 2', callback_data: 'action2' }],
				[{ text: 'Действие 3', callback_data: 'action3' }],
			],
		},
		parse_mode: 'MarkdownV2',
	});
}
else {
	const message = await ctx.reply('Вас нет в базе данных. Хотите зарегистрироваться?', {
		reply_markup: {
			inline_keyboard: [[{ text: 'Зарегистрироваться', callback_data: 'register' }]],
		},
	});
	ctx.session.messageId = message.message_id;
}