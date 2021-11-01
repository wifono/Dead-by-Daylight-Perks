<script>
    export {data} from './Reporter.svelte'
    export {username} from './Reporter.svelte';
    



</script>


<div class="report">
    <div class="header">
        <h1>Bug no. X</h1>
        <h2>Reported: </h2>
    </div>

    <div class="body">
        <div class="description">
            <p></p>
        </div>
    </div>
</div>


<style>
    .report {
        width: 31vw;
        min-width: 31vw;
        min-height: 10%;

        background-color: rgb(82, 82, 82);
        font-family: "Amatic SC", cursive;

        border-radius: 1em;

        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;

        margin: 1rem 0 1rem 0;

        box-shadow: 0 0 1rem;
        text-shadow: 0 0 1rem rgb(31, 31, 31);


    }

    h1 {
        font-size: 2rem;
        padding: 0;
        margin-bottom: 0;
        color: rgb(235, 83, 109);

    }

    .header {
        display: flex;
        align-items: baseline;
        justify-content: space-between;

        width: 90%;

        background: rgb(75, 75, 75);
        padding: 0 5% 0 5%;
        border-radius: 1em 1em 0em 0em;
    }

    .description {
        font-size: 1.5rem;
        color: aliceblue;

        padding: 1rem
    }

</style>