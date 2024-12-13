export function getGreetingByTime(offsetHours = 4) {
	const now = new Date();
	const localTime = new Date(now.getTime() + offsetHours * 3600000);
	const hours = localTime.getHours();

	if (hours >= 5 && hours < 12) return 'Доброе утро';
	if (hours >= 12 && hours < 18) return 'Добрый день';
	if (hours >= 18 && hours < 23) return 'Добрый вечер';

	return 'Доброй ночи';
}