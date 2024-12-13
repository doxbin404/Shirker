export function escapeMarkdown(text: string): string {
	const reservedChars = /([`>#+\-=|{}.!])/g;
	return text.replace(reservedChars, '\\$1');
}