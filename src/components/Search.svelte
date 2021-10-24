<script>
    export let searchTerm;

</script>

<div class="search">

    <input 
        type="text"
        id="search-field"
        placeholder="Type"
        autocomplete="off"
        bind:value={searchTerm}
        on:input/>

</div>


<style>
    input {
        background: rgb(65, 65, 65);
        max-width: 15rem;
        
        font-size: 2.5rem;
        color: rgb(240, 240, 240);
        font-family: "Amatic SC", cursive;
        text-align: center;

        border:none;
        border-radius: 1rem;

    }

    input:hover {
        color: rgb(179, 0, 0);
        transition: all .2s ease-in;
}</style>