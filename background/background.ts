import {Message, MessageTypes, TextFieldInfo} from "../shared/types";

const registerEventListeners = () => {
	chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
		switch (message.type) {
			case MessageTypes.REQUEST_COMPLETION: {
				handleCompletion(message.body?.textInfo).then((completion) => {
					console.log("📩 sending response:", completion);
					sendResponse({ completion });
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
	// TODO: Make AI requests
	return 'sample completion';
}

(() => {
	registerEventListeners();
})();