<script>
    import Reporter from "./components/Reporter.svelte";
</script>  

<body class="animate__animated animate__fadeIn">

<header>
    <h1>Bug Report</h1>
</header>


<main>
    <Reporter />
</main>
</body>

<style>

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