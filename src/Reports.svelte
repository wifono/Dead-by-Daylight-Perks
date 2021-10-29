<script>
    import Reporter from "./components/Reporter.svelte";
    import Report from "./components/Report.svelte";

    </script>  

<body class="animate__animated animate__fadeIn">

<header>
    <h1>Bug Report</h1>
</header>


<main>
    <div class="reporter">
        <Reporter />
    </div>

    <div class="reports">
        <Report />
        <Report />
        <Report />
    </div>
</main>
</body>

<style>

    main {
        display: flex;
        flex-direction: row;
        justify-content: center;
        flex-wrap: wrap;

        justify-content:center;
        align-items: flex-start;

         gap: 1rem;
    }

.reports {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 2rem 0 0 0;
}

h1 {
    margin: 1rem;
    font-size: 7rem;
    font-family: "Amatic SC", cursive;
    color: rgb(240, 240, 240);		
    text-shadow: 0 0 .2em rgb(10, 10, 10);
    margin-top: 4.5rem;
 }

 @media screen and (max-width:365px) {
     h1 {
         font-size: 5rem;
     }
 }    
</style>