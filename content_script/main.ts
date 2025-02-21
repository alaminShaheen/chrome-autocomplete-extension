import {MessageTypes, TextFieldInfo} from "../shared/types";
import {activeTextField, completionOverlay, initializeTextFieldTracking} from "./onMessageHandlers";
import {isTextField} from "../shared/utils.ts";

const registerEventListeners = () => {
	// Listen for text input events
	document.addEventListener('input', async (e) => {
		const target = e.target as HTMLElement;
		if (isTextField(target)) {
			const textInfo: TextFieldInfo = {
				text: (target as HTMLInputElement | HTMLTextAreaElement).value,
				cursorPosition: (target as HTMLInputElement | HTMLTextAreaElement).selectionStart || 0
			};

			console.log("sending message", {
				type: MessageTypes.REQUEST_COMPLETION,
				body: {textInfo}
			})

			// Request completion from background script
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

	// Handle Tab key for completion
	document.addEventListener('keydown', (e) => {
		const completionTextSpan = document.getElementById("completion-text");
		const currentTextSpan = document.getElementById("current-text");

		if (e.key === 'Tab' && completionTextSpan?.innerText) {
			e.preventDefault();
			applyCompletion((currentTextSpan?.innerText || "") + completionTextSpan.innerText);
		}
	});
}

const showCompletion = (completion: string) => {
	if (completionOverlay && activeTextField) {
		// Update the padding to match current text length
		const currentText = (activeTextField as HTMLInputElement | HTMLTextAreaElement).value;
		// completionOverlay.style.paddingLeft = `${currentText.length}ch`;
		const currentTextSpan = document.getElementById("current-text");
		const completionTextSpan = document.getElementById("completion-text");

		if (currentTextSpan) currentTextSpan.innerText = currentText;

		if (completionTextSpan) completionTextSpan.innerText = completion;

		// completionOverlay.innerText = completion;
		console.log(currentText + completion);
	}
}

const applyCompletion = (fullText: string) => {
	const completionTextSpan = document.getElementById("completion-text");
	const currentTextSpan = document.getElementById("current-text");
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