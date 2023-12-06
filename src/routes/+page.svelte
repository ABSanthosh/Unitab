<script lang="ts">
	import Cat from '../components/Cat.svelte';
	import Sidebar from '../components/Sidebar.svelte';


</script>

<main class="Home">
	<Sidebar />
	<!-- <Cat />   -->
</main>

<style lang="scss">
	.Home {
		@include box();
		@include make-flex($dir: row, $just: space-between, $align: flex-end);
	}
</style>
