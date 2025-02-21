export const onUpdateBookmark = async (): Promise<void> => {
	await chrome.bookmarks.remove("sagdjshabd");
}

export const onSearchBookmark = async (): Promise<void> => {
	return;
}