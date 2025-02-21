import {isTextField} from "../shared/utils.ts";

// Track active text field
export let activeTextField: HTMLElement | null = null;
export let completionOverlay: HTMLElement | null = null;

export const initializeTextFieldTracking = () => {
	// Monitor all text inputs and textareas
	document.addEventListener('focusin', (e) => {
		const target = e.target as HTMLElement;
		if (isTextField(target)) {
			console.log(target)
			activeTextField = target;
			createCompletionOverlay(target);
		}
	});

	document.addEventListener('focusout', () => {
		if (completionOverlay) {
			completionOverlay.remove();
			completionOverlay = null;
		}
		activeTextField = null;
	});
}

export const createCompletionOverlay = (textField: HTMLElement) => {
	// Get position and styles of the text field
	const rect = textField.getBoundingClientRect();
	const styles = window.getComputedStyle(textField);

	const currentSpanElement = document.createElement("span");
	currentSpanElement.style.backgroundColor = "transparent";
	currentSpanElement.style.color = "transparent";
	currentSpanElement.id = "current-text";

	const completionSpanElement = document.createElement("span");
	completionSpanElement.id = "completion-text";
	completionSpanElement.style.color = "gray";

	completionOverlay = document.createElement('div');
	completionOverlay.id = 'completion-overlay';
	completionOverlay.style.zIndex = '1000';
	completionOverlay.style.position = 'absolute';
	completionOverlay.style.left = `${rect.left}px`;
	completionOverlay.style.top = `${rect.top}px`;
	completionOverlay.style.width = `${rect.width}px`;
	completionOverlay.style.height = `${rect.height}px`;

	completionOverlay.style.overflowWrap = styles.overflowWrap;
	completionOverlay.style.overflow = styles.overflow;

	// Copy more text-related styles
	completionOverlay.style.font = styles.font;
	completionOverlay.style.fontSize = styles.fontSize;
	completionOverlay.style.lineHeight = styles.lineHeight;
	completionOverlay.style.padding = styles.padding;
	completionOverlay.style.paddingTop = styles.paddingTop;
	completionOverlay.style.paddingBottom = styles.paddingBottom;
	completionOverlay.style.textIndent = styles.textIndent;
	completionOverlay.style.whiteSpace = styles.whiteSpace;
	completionOverlay.style.wordBreak = styles.wordBreak;
	completionOverlay.style.wordSpacing = styles.wordSpacing;
	completionOverlay.style.letterSpacing = styles.letterSpacing;
	completionOverlay.style.textIndent = styles.textIndent;
	completionOverlay.style.boxSizing = styles.boxSizing;
	// Add text-indent to match the input
	completionOverlay.append(currentSpanElement, completionSpanElement);
	// Important: this makes the completion text start where the current text ends
	// completionOverlay.style.paddingLeft = `${(textField as HTMLInputElement).value.length}ch`;

	document.body.appendChild(completionOverlay);
}