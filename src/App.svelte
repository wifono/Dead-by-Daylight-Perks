<script>
	import Router from 'svelte-spa-router';
	import Home from './Home.svelte';
	import Report from './Reports.svelte';
	import Navig from './components/Navig.svelte';
	import About from './About.svelte';
</script>

<Navig />

<Router routes={{
	'/' : Home,
	'/reports' : Report,
	'/about': About

}} />