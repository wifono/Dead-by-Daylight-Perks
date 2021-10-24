<script>
	import { scale } from 'svelte/transition';
	import {expoInOut} from 'svelte/easing';
	export let name;
	export let perk_name;
	export let description;
	export let icon_url;
</script>

<div class="perk"
 	transition:scale={{duration: 500, easing:
	expoInOut}}>

	<div class="perkheader">

		<div class="perkname">
			<h2>{perk_name}</h2>
			
		</div>

		<div class="survname"><h3>{name}</h3></div>
	</div>

	<div class="perkmain">
		<div class="description">{description}</div>
		<img src="{icon_url}" alt="{icon_url}">
	</div>
</div>


<style>

	.perk {
		display: flex;
		flex-direction: column;
		align-items: center;

		width: 50rem;

		background: rgba(20, 20, 20, 0.336);

		margin: 0 0 .5em 0;
		font-family: "Amatic SC", cursive;
		
	}

	.perkheader {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	h2 {
		font-size: 4.5rem;
		margin: 1rem 0 -.9rem 0;
		padding: 0;
		color: rgb(133, 45, 216);
		text-shadow: 0 0 .2em rgb(10, 10, 10);
	}

	h3 {
		font-size: 2.5rem;
		margin: 0;
		padding: 0;
		color: rgb(223, 202, 69);
		text-shadow: 0 0 .2em black;

	}

	img {
		width: 20%;
		height: 100%;
		padding: -1em;
	}

	.perkmain {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 1.5em;
	}

	.description {
		font-size:	2rem;
		color: rgb(247, 247, 247);
		width: 80%;
		padding: 1.5em;
		text-shadow: 0 0 1em rgb(27, 27, 27);
	}

</style>

