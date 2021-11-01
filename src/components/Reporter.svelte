<script>

    const ENTER_KEY = 13;
    const ESCAPE_KEY = 27;

    let tempId = "4"
    let title = "";
    let username = "";
    let description = "";

    function addReport(event){
        if(event.which === ENTER_KEY) {
            reports.push({
                "id":"tempId",
                "title": title,
                "name": username,
                "description": description,
            })

        reports = reports;
        tempId = tempId +++ 1;
        title = "";
        username = "";
        description = "";

        }

        console.log(tempId);
    }

    /*function deleteReport(id) {
        reports = reports.filter(report => report.id === id);
    }*/


        
  let reports = [
      
  ]

</script>

<div class="reporter">

        

    <div class="reportcontainer">
        <h2 class="notworking">Reports aren't working right now.</h2>

        <p>If u find bugs like missing image, any other visual<br> 
        or function bug, describe your problem here:</p>

        <form on:keydown={addReport}  name="reporter">

            <div class="name">
                <label for="Username">Username</label>
                <input bind:value={username} type="text" id="username" name="username" required>

            </div>

            <div class="title">
                <label for="Title">Title</label>
                <input bind:value={title}  type="text" id="Title" name="Title" required>

            </div>

            <div class="problem">
                <label for="Bug">Describe your problem:</label>
                <textarea bind:value={description} class="bug" type="text" id="bug" name="bug" required></textarea>
            </div>
                <input type="submit" value="Submit">
            
        </form> 

    </div>


<div class="reports">

        {#each reports as report}

            <div class="report">
                <div class="header">
                    <h1> {report.title} </h1>
                    <h2>Reported: {report.name} </h2>
                </div>
            
                <div class="body">
                    <div class="description">
                        <p> {report.description} </p>
                    </div>
                </div>
            </div>      
        {/each}
       
    </div>

</div>

<style>

    .notworking{
        font-family: "Amatic SC", cursive;
        color: red;
        text-shadow: 0 .1em .5em black;
        font-size: 2rem;
        padding: 0;
        margin: .2em;
    }

    p {
        font-family: "Amatic SC", cursive;
        font-size: 2rem;
        color: aliceblue;
        text-align: center;
        text-shadow: 0 .5rem .5rem black;
    }

    .reportcontainer {
        display: flex;
        flex-direction: column;

        justify-content: center;
        align-items: center;

		background: rgba(20, 20, 20, 0.336);
        padding: 1.5rem;
        max-width:30rem;
        margin-bottom: 1em;
        box-shadow: 0 0 2rem rgb(12, 12, 12);

    }

    .reporter {
        display:flex;
        justify-content: center;
        align-items: center;
        flex-direction: row;
        gap: 2rem;

    }

    .reports {
    display: flex;
    flex-direction: column;
    padding: 0;
    margin: 2rem 0 0 0;
}


    form {
        display: flex;
        flex-direction: column;
        text-shadow: 0 .5rem .5rem black;
    }

    label {
        font-size: 2rem;
        font-family: "Amatic SC", cursive;
        color: aliceblue;
        vertical-align:middle;
    }   

    input {
        background: gray;
        font-family:'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;

        border: 0;
        border-radius: .4rem ;
        width: 8rem;
        height: 2rem;
        margin: 0 .2rem 0 0;
    }
    

    input:last-child {
        margin-top: 1.5rem;
        align-self: center;
    }

    .problem {
        display: flex;
        flex-direction: column;
        margin-top: 5rem;
    }

    .bug {
        width: 26rem;
        min-height:5rem;
        margin-top: 1rem;
        padding-left: 2.5rem;
    }

    textarea {
        background-color: gray;
        border-radius: .5rem;
        text-align: left;
        padding: 1rem;
        margin: 0;
    }
    @media screen and (max-width: 536px) {

   .reportcontainer {
       max-width:25rem;
       
   }

   form {
    justify-content: stretch;
    align-items: flex-start;
    flex-direction: column;
    }


   .name {
       display: flex;
       flex-direction: column;
   }
   
   .problem {
       margin-top: 1rem;
       
   }

   .bug {
       width: 20rem;
   }
}



/*_________________________*/

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

    .report h1 {
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

@media screen and (max-width: 455px) {

    p {
        font-size: 1.3rem;
    }
.reportcontainer {
    max-width:23rem;
    
    }   

}

@media screen and (max-width: 422px) {

.reportcontainer {
    max-width:22rem;
    
    }   

}

@media screen and (max-width: 407px) {

.reportcontainer {
    max-width:20rem;
    
    }   
    .bug {
       width: 18rem;
   }
}



@media screen and (max-width: 377px) {

.reportcontainer {
    max-width:19rem;
    
    }   
    .bug {
       width: 16rem;
   }
}


@media screen and (max-width: 357px) {

.reportcontainer {
    max-width:17rem;
    
    }   
    .bug {
       width: 15rem;
   }

   .notworking {
       font-size: 1.6rem;
       text-align: center;
   }
}



</style>