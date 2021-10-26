<script>

</script>

    <h2 class="notworking">Reports aren't working right now.</h2>

<div class="reportcontainer">

    <p>If u find bugs like missing image, any other visual<br> 
    or function bug, describe your problem here:</p>

    <form action="" name="reporter" type="submit">

        <div class="name">
            <label for="Username">Username</label>
            <input type="text" id="username" name="username" required>

            <label class="emailname" for="E-mail">E-mail</label>
            <input class="email" type="text" id="email" name="email" required>
        </div>

        <div class="problem">
            <label for="Bug">Describe your problem:</label>
            <input class="bug" type="text" id="bug" name="bug" required>
        </div>
            <input type="submit" value="Submit" method="post">
        
    </form>

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
}


</style>