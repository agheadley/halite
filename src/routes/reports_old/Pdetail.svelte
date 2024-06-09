<script>
	import Edit from "./Edit.svelte";
    import Modal from '$lib/_Modal.svelte';
    import Cell from '$lib/_Cell.svelte';
    import * as util from '$lib/util';
    import {alert} from '$lib/store';

/** @type {any}*/
export let data;

/** @type {string}*/
export let user;

/** @type {{log:string,txt:string,_id:string}}}*/
export let active;

/**
 * 
 * @param {number} index
 */
let openEdit=(index)=>{
    data.detail[index].edit=true;
};


/**
 * 
 * @param {number} index
 */
 let save=async(index)=>{

    data.detail[index].log=`${user}|${util.getDateTime()}`;
    
    console.log('saving',data.detail[index]._id,data.detail[index].title,data.detail[index].tid,data.detail[index].sal);
    
    
    let response = await fetch('/edge/update', {
        method: 'POST',
        body: JSON.stringify({
            collection:'reports',
            filter:{"_id": { "$oid": data.detail[index]._id} },
            update:{txt: data.detail[index].txt,log: data.detail[index].log}
        }),
        headers: {'content-type': 'application/json'}
    });

    let res= await response.json();
            
    if(res.matchedCount===1) {
        $alert.msg=`Saved report`;
        data.detail[index].edit=false;

        active={_id:data.detail[index]._id,log:data.detail[index].log,txt:data.detail[index].txt};

    } else {
        $alert.type='error';
        $alert.msg=`Error saving report`;
    }

    


    
};


console.log(data);

</script>







<table>
    <tbody>
        {#each data.detail as row,rowIndex}
        {#if row.type==='A'}
        {#if rowIndex===0 || (data.detail[rowIndex-1] && (row.ss!==data.detail[rowIndex-1].ss || row.sc!==data.detail[rowIndex-1].sc)) }
        <tr>
          
            <td>
                <span class="small bold">{row.sl} ({row.sc})</span>
             
            </td>
            <td>
                <table>
                    <tbody>
                        <tr>
                            {#each row.cols as col,colIndex}
                                <td><span class="small">{col.ds}</span><Cell color={true} residual={col.r}>{col.gd}</Cell></td>
                            {/each}
                        </tr>
                    </tbody>
                </table>
              
            </td>
        </tr>
        <tr>
            <td></td>
            <td>
            <span class="small">
            <details>
                <summary>HoD Statement</summary>
                <p>{row.hod}</p>
                </details>
            </span>
            </td>
        </tr>
        {/if}
        {/if}
        <tr>
            <td>
                <div>
                    <!--
                    <span class="tag small" tabindex={1} role="button" on:keydown={()=>openEdit(rowIndex)} on:click={()=>openEdit(rowIndex)}>EDIT</span>
                    -->
                    {#if !row.edit}
                    <button class="button dark small" on:click={()=>openEdit(rowIndex)}>Edit</button>
                    {:else}
                    <button disabled={row.txt.length<row.min || row.txt.length>row.max} class="button dark small" on:click={()=>save(rowIndex)}>Save</button>
                    {/if}
                </div>
                <div>
                    {#if row.type==='A'}
                    <span class="small">EC {row.ec} / EP {row.ep}</span>
                    {/if}
                    {#if row.type==='E'}
                    <span class="small bold">{row.sl.toUpperCase()}</span>
                    {/if}
                    {#if row.type==='P'}
                    <span class="small bold">{row.title.toUpperCase()}</span>
                    {/if}
                </div>
                <div>
                    <span class="small">{row.tid}</span>
                </div>
            </td>
            <td>
                <textarea disabled={!row.edit} class={row.txt.length<row.min || row.txt.length>row.max ? 'comment red small' : 'comment green small'} bind:value={row.txt}/> 
                <span class="small">{row.log}</span>
               </td>
        </tr>
        {/each}
 
    </tbody>
</table>
<div class="row">
    
</div>


<style>

    .small {
        font-size:1.2rem;
    }

    .comment {
        width:70rem;
        height:7rem;
    }

    .bold {
        font-weight:600;
    }





.red {
    background:rgba(178,34,34,0.15);
   
}

.green {
    background:rgba(34,139,34,0.15);
}

</style>