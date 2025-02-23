import {Message, MessageTypes, TextFieldInfo} from "../shared/types";
import {activeTextField, completionOverlay, initializeTextFieldTracking} from "./onMessageHandlers";
import {debounce, isTextField} from "../shared/utils.ts";

const registerEventListeners = () => {
	const requestCompletion = debounce(async (messageBody: Message["body"]) => {
		console.log("sending message", {
			type: MessageTypes.REQUEST_COMPLETION,
			body: messageBody,
		})

		const response = await chrome.runtime.sendMessage<Message>({
			type: MessageTypes.REQUEST_COMPLETION,
			body: messageBody,
		});

		console.log("🔄 Received response:", response);

		if (response?.completion) {
			showCompletion(response.completion);
		}
	}, 500)

	document.addEventListener('input', async (e) => {
		const target = e.target as HTMLElement;
		if (isTextField(target)) {
			const textValue = (target as HTMLTextAreaElement).value;
			updateCurrentText(textValue);
			if (textValue) {
				const labelElement = document.querySelector<HTMLLabelElement>(`label[for="${target.id}"]`);
				const textInfo: TextFieldInfo = {
					text: textValue,
					cursorPosition: (target as HTMLInputElement | HTMLTextAreaElement).selectionStart || 0,
				};
				requestCompletion({
					textInfo,
					metadata: {
						url: window.location.hostname,
						label: labelElement?.innerText
					}
				});
			}
		}
	});

	document.addEventListener('keydown', (e) => {
		const completionTextSpan = completionOverlay?.querySelector(".completion-text") as HTMLSpanElement;
		const currentTextSpan = completionOverlay?.querySelector(".current-text") as HTMLSpanElement;

		if (e.key === 'Tab' && completionTextSpan?.innerText) {
			e.preventDefault();
			void applyCompletion((currentTextSpan?.innerText || ""), completionTextSpan.innerText);
		}
	});
}

const updateCurrentText = (currentText: string) => {
	if (completionOverlay) {
		const currentTextSpan = completionOverlay.querySelector(".current-text") as HTMLSpanElement;
		if (currentTextSpan) {
			currentTextSpan.textContent = currentText;
		}
		// Clear completion while waiting for new prediction
		const completionTextSpan = completionOverlay.querySelector(".completion-text") as HTMLSpanElement;
		if (completionTextSpan) {
			completionTextSpan.textContent = '';
		}
	}
}

const showCompletion = (completion: string) => {
	if (completionOverlay && activeTextField) {
		const currentText = (activeTextField as HTMLTextAreaElement).value;
		const currentTextSpan = completionOverlay.querySelector(".current-text") as HTMLSpanElement;
		const completionTextSpan = completionOverlay.querySelector(".completion-text") as HTMLSpanElement;

		if (currentTextSpan) currentTextSpan.innerText = currentText;

		if (completionTextSpan) completionTextSpan.innerText = completion;

		console.log(currentText + completion);
	}
}

const applyCompletion = async (currentText: string, completionText: string) => {
	const completionTextSpan = completionOverlay?.querySelector(".completion-text") as HTMLSpanElement;
	const currentTextSpan = completionOverlay?.querySelector(".current-text") as HTMLSpanElement;

	if (activeTextField) {
		activeTextField.focus();

		// Get current cursor position
		// const cursorPos = activeTextField.selectionStart || activeTextField.value.length;

		// Simulate inserting the completion text using execCommand
		document.execCommand('insertText', false, completionText);

		// Trigger input event to notify any state changes
		activeTextField.dispatchEvent(new Event('input', { bubbles: true }));
	}
	if (currentTextSpan) currentTextSpan.innerText = currentText + completionText;
	if (completionTextSpan) completionTextSpan.innerText = "";
}

(() => {
	initializeTextFieldTracking();
	registerEventListeners();
})();