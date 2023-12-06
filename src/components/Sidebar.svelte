<script lang="ts">
	$: isClosed = false;
	$: tabGroups = [
		{
			title: 'Maker space',
			isOpen: false,
			links: [
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				},
				{
					favicon: 'https://www.google.com/favicon.ico',
					title: 'Google',
					url: 'https://www.google.com'
				}
			]
		}
	];
</script>

<aside class="Sidebar" class:closed={isClosed}>
	<button
		class="Sidebar__close"
		class:closed={isClosed}
		data-icon={String.fromCodePoint(60099)}
		on:click={() => (isClosed = !isClosed)}
	/>
	<h2>Spaces</h2>
	<div class="Sidebar__groups">
		{#each tabGroups as group}
			<details
				class="FancyDetails"
				open={group.isOpen}
				on:toggle={() => (group.isOpen = !group.isOpen)}
			>
				<summary>{group.title}</summary>
				<ul>
					{#each group.links as link}
						<li>
							<button
								class="FancyDetails__icon"
								data-icon={String.fromCodePoint(58829)}
								style="--favicon: url({link.favicon});"
								on:click={() => {
									group.links = group.links.filter((l) => l !== link);
								}}
							/>
							<a href={link.url} target="_blank" rel="noopener noreferrer">
								{link.title}
							</a>
						</li>
					{/each}
				</ul>
			</details>
		{/each}
	</div>
</aside>

<style lang="scss">
	.Sidebar {
		gap: 15px;
		padding: 20px;
		color: white;
		position: relative;
		@include box(345px);
		border-radius: 17px;
		border: 1px solid #999;
		backdrop-filter: blur(16px);
		background: rgba(0, 0, 0, 0.3);
		@include make-flex($just: flex-start);
		transition: transform 0.3s ease;

		&.closed {
			transform: translateX(-100%);
		}

		&__close {
			top: 15px;
			right: 15px;
			border: none;
			outline: none;
			cursor: pointer;
			position: absolute;
			border-radius: 6px;
			@include make-flex();
			@include box(30px, 30px);
			transition: transform 0.3s ease;

			&::before {
				font-size: 24px;
				transition: transform 0.3s ease;
			}

			&.closed {
				transform: translateX(60px);
				&::before {
					transform: rotate(180deg);
				}
			}
		}

		& > h2 {
			font-size: 24px;
			font-weight: 600;
			@include box(100%, auto);
		}

		&__groups {
      margin-top: 20px;
			@include make-flex($just: flex-start);
			// @include box(calc(100% + 40px), auto);
			@include box(100%, auto);
			gap: 10px;
			overflow-y: auto;  
			// scrollbar-gutter: stable;
			// padding-right: 28px;
			// margin-left: 18px;
			// padding-left: 7px;

			// direction: rtl;
			// & > * {
			// 	direction: ltr;
			// }
		}
	}
</style>
