import {isTextField} from "../shared/utils.ts";

export let activeTextField: HTMLElement | null = null;
export let completionOverlay: HTMLElement | null = null;

export const initializeTextFieldTracking = () => {
	document.addEventListener('focusin', (e) => {
		const target = e.target as HTMLElement;
		if (isTextField(target)) {
			if (completionOverlay) {
				if ((completionOverlay as any).cleanup) {
					(completionOverlay as any).cleanup();
				}
				completionOverlay.remove();
			}
			activeTextField = target;
			createCompletionOverlay(target);
		}
	});

	document.addEventListener('focusout', () => {
		if (completionOverlay) {
			if ((completionOverlay as any).cleanup) {
				(completionOverlay as any).cleanup();
			}
			completionOverlay.remove();
			completionOverlay = null;
		}
		activeTextField = null;
	});
}

const createCompletionOverlay = (textField: HTMLElement) => {
	const updatePosition = () => {
		const rect = textField.getBoundingClientRect();
		if (completionOverlay) {
			completionOverlay.style.left = `${rect.left}px`;
			completionOverlay.style.top = `${rect.top}px`;
			completionOverlay.style.width = `${rect.width}px`;
			completionOverlay.style.height = `${rect.height}px`;
		}
	};

	const styles = window.getComputedStyle(textField);

	const currentSpanElement = document.createElement("span");
	currentSpanElement.style.backgroundColor = "transparent";
	currentSpanElement.style.color = "transparent";
	currentSpanElement.classList.add("current-text");

	const completionSpanElement = document.createElement("span");
	completionSpanElement.classList.add("completion-text");
	completionSpanElement.style.color = "gray";

	completionOverlay = document.createElement('div');
	completionOverlay.classList.add('completion-overlay');
	completionOverlay.style.zIndex = '1000';

	updatePosition();

	completionOverlay.style.font = styles.font;
	completionOverlay.style.fontSize = styles.fontSize;
	completionOverlay.style.lineHeight = styles.lineHeight;
	completionOverlay.style.padding = styles.padding;
	completionOverlay.style.paddingTop = styles.paddingTop;
	completionOverlay.style.paddingBottom = styles.paddingBottom;
	completionOverlay.style.textIndent = styles.textIndent;
	completionOverlay.style.whiteSpace = styles.whiteSpace;
	completionOverlay.style.overflowWrap = styles.overflowWrap;
	completionOverlay.style.wordBreak = styles.wordBreak;
	completionOverlay.style.overflow = styles.overflow;
	completionOverlay.style.wordSpacing = styles.wordSpacing;
	completionOverlay.style.letterSpacing = styles.letterSpacing;
	completionOverlay.style.boxSizing = styles.boxSizing;

	completionOverlay.append(currentSpanElement, completionSpanElement);
	document.body.appendChild(completionOverlay);

	window.addEventListener('scroll', updatePosition, true);
	window.addEventListener('resize', updatePosition);

	const cleanup = () => {
		window.removeEventListener('scroll', updatePosition, true);
		window.removeEventListener('resize', updatePosition);
	};

	(completionOverlay as any).cleanup = cleanup;
}