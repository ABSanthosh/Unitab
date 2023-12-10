import options from '$lib/OptionStore';

export const ssr = false;

export function load() {
	if (localStorage.getItem('options')) {
		options.set({
			...options,
			sidebarIsClosed: JSON.parse(localStorage.getItem('options')!).sidebarIsClosed
		});
	}
	return {
		options: JSON.parse(localStorage.getItem('options')!)
	};
}
