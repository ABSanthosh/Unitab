<script lang="ts">
	import options from '$lib/OptionStore';
	import AnalogClock from '../components/Clocks/AnalogClock.svelte';

	import Cat from '../components/Cat.svelte';
	import Sidebar from '../components/Sidebar.svelte';
	// import Grid from 'svelte-grid';
	// import gridHelp from 'svelte-grid/build/helper/index.mjs';

	$: isClosed = $options.sidebarIsClosed;
</script>

<main class="Home" style="grid-template-columns: {isClosed ? '315px 1fr' : '0fr 1fr'};">
	<Sidebar />
	<div class="Home__tiles">
		<AnalogClock />
		<!-- <Cat /> -->
	</div>
</main>

<style lang="scss">
	.Home {
		@include box();
		gap: 20px;
		display: grid;
		transition: all 0.3s ease;

		&__tiles {
			gap: 20px;
			@include box(auto);
			max-width: 100%;
			max-height: 100%;
			@include make-flex($align: flex-end, $just: flex-end);
			// display: grid;
			// justify-items: end;
			// align-items: end;

			// grid-template-columns: repeat(auto-fill, 315px);
			// justify-content: end;
			// grid-auto-rows: 315px;

		}
		transition: 500ms;
	}
</style>
