import {Message, MessageTypes} from "../shared/types";

const registerEventListeners = () => {
	chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
		switch (message.type) {
			case MessageTypes.REQUEST_COMPLETION: {
				handleCompletion(message.body).then((completion) => {
					console.log("📩 sending response:", completion);
					sendResponse({completion});
				}).catch((error) => {
					console.error("❌ Error handling completion:", error);
					sendResponse({completion: ""});
				});
				return true;
			}
			default:
				return false;
		}
	});
}

async function handleCompletion(messageBody?: Message["body"]) {
	if (!messageBody?.textInfo) return '';
	const {textInfo} = messageBody;

	try {
		let lastSentences: string[] = []
		if (textInfo.cursorPosition === textInfo.text.length) {
			const segmenter = new Intl.Segmenter('en', {granularity: 'sentence'});
			const allSentences = Array.from(segmenter.segment(textInfo.text), segment => segment.segment);
			lastSentences = lastSentences.concat(allSentences.slice(0, Math.min(3, allSentences.length)));
			console.log({lastSentences: lastSentences.join("")});
		}

		const messages = [{
			role: "system",
			content: "You are an AI assistant providing brief, contextual text completions. " +
				"Complete the user's current sentence naturally, keeping the completion concise."
		}]

		if (messageBody.metadata?.url) {
			messages.push({
				role: "user",
				content: `User is typing on ${messageBody.metadata.url}.`
			})
		}

		if (messageBody.metadata?.label) {
			messages.push({
				role: "user",
				content: `User is typing on a textarea labelled "${messageBody.metadata.label}."`
			})
		}

		messages.push({
			role: "user",
			content: `Complete this text naturally, only provide the completion part, add any extra space or punctuations in the beginning if required and do no include additional quotes.: "${lastSentences.join('')}".`
		})

		const response = await fetch("https://api.openai.com/v1/chat/completions", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"Authorization": `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}` // Replace with your API key
			},
			body: JSON.stringify({
				model: "gpt-4o-mini",
				messages,
				max_tokens: 50,
				temperature: 0.7,
				presence_penalty: 0.6, // Encourage novel completions
				frequency_penalty: 0.5  // Reduce repetition
			})
		});

		const data = await response.json();
		console.log("🤖 AI Response:", data);

		return data.choices?.[0]?.message?.content || '';
	} catch (error) {
		console.error("❌ Error calling AI API:", error);
		return '';
	}
}


(() => {
	registerEventListeners();
})();