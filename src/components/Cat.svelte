<script lang="ts">
	import { onMount } from 'svelte';
	import BlurredSpinner from './BlurredSpinner.svelte';

	$: imgSrc = { url: '', title: '', sub: '', permalink: '' };

	$: tooLong = false;
	onMount(() => {
		setTimeout(() => {
			tooLong = true;
		}, 2500);
	});

	async function getCat() {
		const subs = [
			'Catswithjobs',
			'catpics',
			'catpictures',
			'catsinboxes',
			'CatsInBusinessAttire',
			'CatsInHats',
			'funnycats'
		];
		const sub = subs[Math.floor(Math.random() * subs.length)];
		const base = 'https://www.reddit.com/r/' + sub + '/random.json';

		// https://stackoverflow.com/questions/29246444/fetch-how-do-you-make-a-non-cached-request
		const res = await fetch(base, { cache: 'no-store' });
		const json = await res.json();
		const data = json[0].data.children[0].data;

		if (data.gallery_data) {
			const media_id = data.gallery_data.items[0].media_id;
			return {
				sub,
				title: data.title,
				url: `https://i.redd.it/${media_id}.jpg`,
				permalink: data.permalink
			};
		}

		return { sub, url: data.url, title: data.title, permalink: data.permalink };
	}

	onMount(async () => {
		imgSrc = await getCat();
	});
</script>

<div class="CatBox" style="background-image: url({imgSrc.url})">
	<BlurredSpinner zIndex={-2} />
	{#if tooLong}
		<h2 class="CatBox--tooLong">
			<em>Can't find a free cat, refresh the page!</em>
		</h2>
	{/if}
	{#if imgSrc.url}
		<div class="CatBox__details">
			<h4>
				<a href="https://reddit.com{imgSrc.permalink}" target="_blank">
					r/{imgSrc.sub}
				</a>
			</h4>
			<h2 title={imgSrc.title}>{imgSrc.title}</h2>
		</div>
	{/if}
</div>

<style lang="scss">
	.CatBox {
		color: #e4e4e4;
		position: relative;
		border-radius: 20px;
		background-size: cover;
		@include box(400px, 400px);
		background-position: center;
		@include make-flex($just: flex-end);
		box-shadow: 0 0 20px 1px #00000087;

		&--tooLong {
			z-index: -1;
		}

		&:hover {
			.CatBox__details {
				opacity: 1;
			}
		}

		&__details {
			padding: 20px;
			overflow: hidden;
			position: relative;
			@include box(100%, 130px);
			border-radius: 0 0 20px 20px;

			opacity: 0;
			transition: opacity 0.3s ease-in-out;

			&::after {
				content: '';
				position: absolute;
				left: -30;
				z-index: -1;
				bottom: -50px;
				@include box(111%, 100%);
				background: rgba(0, 0, 0, 0.87);
				filter: blur(17.149999618530273px);
				border-radius: 0px 0px 20px 20px;
			}

			@include make-flex($align: flex-start, $just: flex-end);
			gap: 10px;
			z-index: 1;
			h4 {
				font-size: 14px;
				font-weight: 400;
				a {
					color: #c0c0c0;
					text-decoration: underline;
					&:hover {
						color: #e4e4e4;
					}
				}
			}
			h2 {
				font-size: 16px;
				font-weight: 500;
				max-width: 100%;
				overflow: hidden;
				white-space: nowrap;
				text-overflow: ellipsis;
			}
		}
	}
</style>
