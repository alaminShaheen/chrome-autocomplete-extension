import {Message, MessageTypes, TextFieldInfo} from "../shared/types";

const registerEventListeners = () => {
	chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
		switch (message.type) {
			case MessageTypes.REQUEST_COMPLETION: {
				handleCompletion(message.body?.textInfo).then((completion) => {
					console.log("📩 sending response:", completion);
					sendResponse({ completion }); // Ensure response is sent
				}).catch((error) => {
					console.error("❌ Error handling completion:", error);
					sendResponse({ completion: "" });
				});
				return true;
			}
			default:
				return false;
		}
	});
}

async function handleCompletion(textInfo?: TextFieldInfo) {
	if (!textInfo) return '';

	// Here you would integrate with your AI service
	// This is a placeholder that you'd replace with actual AI API calls
	return 'sample completion';
}

(() => {
	registerEventListeners();
})();