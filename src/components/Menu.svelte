<script>
    export let selectedName;
    export let names;
</script>

<section class="menu-cont">
    <select class="menu" name="menu" id="menu" bind:value={selectedName}>
        <option disabled selected value="">Select</option>
        <option value="All">All perks</option>

        {#each names as name}
        <option value="{name}">{name}</option>
        {/each}
    </select>

</section>

<style>
select {
    background: rgb(65, 65, 65);
    max-width: 15rem;
    
    font-size: 2.5rem;
    color: rgb(240, 240, 240);
    font-family: "Amatic SC", cursive;
    text-align: center;

    border:none;
    border-radius: 1rem;

}

select:hover {
    color: rgb(179, 0, 0);
    transition: all .2s ease-in;
}

@media screen and (max-width:580px) {

    select {
            width: 10rem;
            font-size:3em
        }
			
}

@media screen and (max-width:400px) {

select {
        width: 7rem;
        font-size:2em
    }
        
}

@media screen and (max-width:320px) {
        select {
            width: 4rem;
            font-size:2em
        }
    }
            
</style>