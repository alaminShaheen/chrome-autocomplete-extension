export const isTextField = (element: HTMLElement): boolean => {
	return element.tagName === 'TEXTAREA';
}

export function debounce<T extends (...args: Parameters<T>) => ReturnType<T>>(func: T, wait: number): (...args: Parameters<T>) => void {
	let timeout: NodeJS.Timeout | null = null;

	return (...args: Parameters<T>) => {
		if (timeout) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => {
			func(...args);
			timeout = null;
		}, wait);
	};
}