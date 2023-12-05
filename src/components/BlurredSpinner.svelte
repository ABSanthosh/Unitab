<script lang="ts">
	import Spinner from './Spinner.svelte';

	export let zIndex = 10;
</script>

<div class="BlurredSpinner" style="z-index: {zIndex}">
	<Spinner />
</div>

<style lang="scss">
	.BlurredSpinner {
		top: 0;
		left: 0;
		@include box();
		position: absolute;
		@include make-flex();
		border-radius: inherit;
		background: rgba(0, 0, 0, 0.49);
		backdrop-filter: blur(15px);
	}
</style>
