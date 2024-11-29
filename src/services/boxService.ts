import boxen, { Options } from 'boxen';

interface ItemOptions {
	name: string;
	value: string;
};

export class ServiceBox {
	public createBox() {
		const array: string[] = [];
		return array;
	}

	public addItem(box: string[], options: ItemOptions) {
		box.push(`${options.name}: ${options.value}`);
	}

	public addItems(box: string[], options: ItemOptions[]) {
		options.forEach((item) => {
			box.push(`${item.name}: ${item.value}`);
		});
	}

	public showBox(box: string[], options: Options) {
		return console.log(boxen(box.join('\n'), options));
	}
}