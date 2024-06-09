<script>

import * as util from '$lib/util';
import {alert} from '$lib/store';
/** @type {any}*/
export let data;

/** @type {number}*/
export let index;

/** @type {number}*/
export let next;


/** @type {string}*/
export let user;



let save=async()=>{

    data.log=`${user}|${util.getDateTime()}`;



    let response = await fetch('/edge/update', {
        method: 'POST',
        body: JSON.stringify({
            collection:'reports',
            filter:{"_id": { "$oid": data._id } },
            update:{txt:data.txt,log:data.log}
        }),
        headers: {'content-type': 'application/json'}
    });

    let res= await response.json();
        
    if(res.matchedCount===1) {
        $alert.msg=`Saved report`;
    } else {
        $alert.type='error';
        $alert.msg=`Error saving report`;
    }


    next=index+1;
};


</script>


<div>
    {#if data.txt!==null}
        <textarea  id={`c|${index}`} class={data.txt.length<data.min || data.txt.length>data.max ? 'comment red' : 'comment green'} bind:value={data.txt}/> 
    {/if}  
</div>
<div>
    <div class="flex-row">
        <div>
            <span class="small">{data.author.sal}</span>
        </div>
        {#if data.txt!==null}
        <div>
            <span class="small">{data.txt.length} / {data.min} [{data.max}]</span>
        </div>
        {/if}
       
        <div>
            <span class="small">{data.log}</span>
        </div>
        <div>
            <button disabled={data.txt!==null && (data.txt.length<data.min || data.txt.length>data.max)} class="button dark small" on:click={save}>Save</button>
        </div>
    </div>
</div>



<style>


.flex-row {
    display:flex;
    flex-direction:row;
    justify-content:space-between;
    width:70rem;
    padding-bottom:0.25rem;
    padding-top:0.25rem;

   
   
}





.comment {
        width:70rem;
        height:14rem;
}



.red {
    background:rgba(178,34,34,0.15);
   
}

.green {
    background:rgba(34,139,34,0.15);
}

.small {
    font-size:1.2rem;
}



</style>