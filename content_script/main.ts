import {MessageTypes, TextFieldInfo} from "../shared/types";
import {activeTextField, completionOverlay, initializeTextFieldTracking} from "./onMessageHandlers";
import {isTextField} from "../shared/utils.ts";

const registerEventListeners = () => {
	document.addEventListener('input', async (e) => {
		const target = e.target as HTMLElement;
		if (isTextField(target) && (target as HTMLTextAreaElement).value) {
			const textInfo: TextFieldInfo = {
				text: (target as HTMLInputElement | HTMLTextAreaElement).value,
				cursorPosition: (target as HTMLInputElement | HTMLTextAreaElement).selectionStart || 0
			};

			console.log("sending message", {
				type: MessageTypes.REQUEST_COMPLETION,
				body: {textInfo}
			})

			const response = await chrome.runtime.sendMessage({
				type: MessageTypes.REQUEST_COMPLETION,
				body: {textInfo}
			});

			console.log("🔄 Received response:", response);

			if (response?.completion) {
				showCompletion(response.completion);
			}
		}
	});

	document.addEventListener('keydown', (e) => {
		const completionTextSpan = completionOverlay?.querySelector(".completion-text") as HTMLSpanElement;
		const currentTextSpan = completionOverlay?.querySelector(".current-text") as HTMLSpanElement;

		if (e.key === 'Tab' && completionTextSpan?.innerText) {
			e.preventDefault();
			applyCompletion((currentTextSpan?.innerText || "") + completionTextSpan.innerText);
		}
	});
}

const showCompletion = (completion: string) => {
	if (completionOverlay && activeTextField) {
		const currentText = (activeTextField as HTMLInputElement | HTMLTextAreaElement).value;
		const currentTextSpan = completionOverlay.querySelector(".current-text") as HTMLSpanElement;
		const completionTextSpan = completionOverlay.querySelector(".completion-text") as HTMLSpanElement;

		if (currentTextSpan) currentTextSpan.innerText = currentText;

		if (completionTextSpan) completionTextSpan.innerText = completion;

		console.log(currentText + completion);
	}
}

const applyCompletion = (fullText: string) => {
	const completionTextSpan = completionOverlay?.querySelector(".completion-text") as HTMLSpanElement;
	const currentTextSpan = completionOverlay?.querySelector(".current-text") as HTMLSpanElement;
	if (activeTextField) {
		(activeTextField as HTMLInputElement | HTMLTextAreaElement).value = fullText;
	}
	if (currentTextSpan) currentTextSpan.innerText = fullText;
	if (completionTextSpan) completionTextSpan.innerText = "";
}

(() => {
	initializeTextFieldTracking();
	registerEventListeners();
})();