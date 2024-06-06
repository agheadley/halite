<script>



/** @type {{valid:boolean,min:number,max:number,ec:string,ep:string,txt:string,_id:string}}} */ 
export let data;


</script>

<textarea class={data.txt.length<data.min || data.txt.length>data.max ? 'comment red' : 'comment green'} bind:value={data.txt}></textarea>
{data.txt.length}
<style>



.comment {
        width:60rem;
        height:10rem;
    }

.red {
    background:rgba(178,34,34,0.15);
   
}

.green {
    background:rgba(34,139,34,0.15);
}

.small {
    font-size:1rem;
}


</style>