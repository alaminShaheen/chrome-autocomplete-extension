export enum MessageTypes {
	REQUEST_COMPLETION = 'REQUEST_COMPLETION',
	APPLY_COMPLETION = 'APPLY_COMPLETION'
}

export interface TextFieldInfo {
	text: string;
	cursorPosition: number;
}

export interface Message {
	type: MessageTypes;
	body?: {
		textInfo?: TextFieldInfo;
		completion?: string;
		metadata?: {
			url?: string;
			label?: string;
		}
	};
}