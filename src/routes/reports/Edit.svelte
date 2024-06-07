<script>

import {config,alert} from '$lib/store';
import * as util from '$lib/util';
import Cell from '$lib/_Cell.svelte';
import AssessmentTitle from '$lib/_AssessmentTitle.svelte';

/** @type {{valid:boolean,cols:any[],hod:string,log:string,min:number,max:number,ec:string|null,ep:string|null,txt:string|null,_id:string,sal:string}}} */ 
export let data;

/** @type {number}*/
export let index;

/** @type {number}*/
export let next;


/** @type {string}*/
export let user;



// current=document.activeElement ? document.activeElement.id : '';
let save=async()=>{

    data.log=`${user}|${util.getDateTime()}`;



    let response = await fetch('/edge/update', {
        method: 'POST',
        body: JSON.stringify({
            collection:'reports',
            filter:{"_id": { "$oid": data._id } },
            update:{txt:data.txt,ec:data.ec,ep:data.ep,log:data.log}
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
    <table>
        <tbody>
            <tr>
                {#each data.cols as col,colIndex}
                    <td><AssessmentTitle title={col.n} subtitle={col.ds}/></td>
                {/each}
            </tr>
        <tr>
            {#each data.cols as col,colIndex}
                <td><Cell color={true} residual={col.r}>{col.gd}</Cell></td>
            {/each}
        </tr>
        </tbody>
    </table>
   
</div>
<div>
    {#if data.ec!==null || data.ep!==null}
    <div>
        <div class="flex-row start">
            <div>
                {#if data.ec!==null}
                <span class="small">
                    <fieldset id="class" class="is-full-width">
                    <legend>Effort (Class)</legend>
                    <select  id={`a|${index}`} bind:value={data.ec}>
                        <optgroup label="Effort(Class)">
                                {#each $config.report.e.list as item,index}
                                    <option value={item}>{item}</option>
                                {/each}
                        </optgroup>
                    </select>
                    </fieldset>
                </span>
                {/if}
            </div>
            <div>
                {#if data.ep!==null}
                <span class="small">
                    <fieldset id="class" class="is-full-width">
                    <legend>Effort (Prep)</legend>
                    <select  id={`b|${index}`} bind:value={data.ep}>
                        <optgroup label="Effort (Prep)">
                                {#each $config.report.e.list as item,index}
                                    <option value={item}>{item}</option>
                                {/each}
                        </optgroup>
                    </select>
                    </fieldset>
                </span>
                {/if}
            </div>
            <div>
                <span class="small">
                    <fieldset id="class" class="is-full-width" style="height:100%">
                    <legend>HoD Comment</legend>
                        <div>{data.hod}</div>
                    </fieldset>
                </span>
            </div>
        </div>
    </div>
    {/if}
    <div>
        {#if data.txt!==null}
        <textarea  id={`c|${index}`} class={data.txt.length<data.min || data.txt.length>data.max ? 'comment red' : 'comment green'} bind:value={data.txt}/> 
        {/if}
        </div>
    <div>
        <div class="flex-row">
            <div>
                <span class="small">{data.sal}</span>
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


.start {
    justify-content:start;
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