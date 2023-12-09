// /*global chrome*/
import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const defaultOptions = {
	sidebarIsClosed: false
};

const initialValue = browser
	? JSON.parse(window.localStorage.getItem('options')!) ?? defaultOptions
	: defaultOptions;

const options = writable<typeof defaultOptions>(initialValue as typeof defaultOptions);

options.subscribe((value) => {
	// chrome.storage.sync.set(
	// 	{
	// 		options: value
	// 	},
	// 	() => console.log('Options saved')
	// );
	if (browser) {
		window.localStorage.setItem('options', JSON.stringify(value));
	}
});

export default options;
