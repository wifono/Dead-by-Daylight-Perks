<script>

import {onMount}  from 'svelte';

import {bookData} from "./bookData.js";
import Book from "./components/Book.svelte";
import Menu from "./components/Menu.svelte";
import Search from "./components/Search.svelte";
import Logo from "./components/Logo.svelte";
import Or from "./components/Or.svelte";
import Info from "./components/Info.svelte";
import Error from "./components/Error.svelte";

let names =  [];
let selectedName = "";
const getNames = () => {
	for (let bookObj of bookData) {
		if (!names.includes(bookObj.name)) {
			names = [...names, bookObj.name]		
		}
	}
	names = names.sort()
}
onMount(() => getNames());

let filteredBooks = [];
$: if (selectedName) getPerkByName();

// For select menu
const getPerkByName = () => {

	searchTerm = "";

	if (selectedName === 'All') {
		return filteredBooks = bookData;
	
	}
	return filteredBooks = bookData.filter(bookObj => {
		return bookObj.name === selectedName;
	})
}
// Search input
let searchTerm = "";
$: if (searchTerm) selectedName = "";

const searchPerks = () => {
	
		return filteredBooks = bookData.filter(bookObj => {
		let bookTitleLower = bookObj.perk_name.toLowerCase();
		return bookTitleLower.includes(searchTerm.toLowerCase());
	})
}



$:console.log(selectedName, filteredBooks);
$:console.log(searchTerm)
</script>

<header>
	<Logo />
</header>

<div class="navigation">
	<Menu {names} bind:selectedName />
	<Or />
	<Search bind:searchTerm on:input={searchPerks}/>
</div>

<main id="bookshelf">

	{#if  searchTerm.length === 0 && selectedName.length === 0}
	
		<Info />
	
	{:else if filteredBooks.length > 0}
		{#each filteredBooks as {name, perk_name, description, icon_url}}
		<Book 
			{name}
			{perk_name}
			{description}
			{icon_url} />
		{/each}
	{:else if searchTerm && filteredBooks.length === 0}
	<Error />

	{/if}
</main>


<style>
	.navigation {
		width: 50vw;
		display: flex;
		justify-content:space-evenly;
		align-items:baseline;
		margin: 2em 0 .5em 0;
		;
	}

	
    @media screen and (max-width:324px) {
        .navigation {
			margin: 0 0 1em 0;
		}
    }
            

</style>