<script>
	import Edit from "./Edit.svelte";
    import Modal from '$lib/_Modal.svelte';

/** @type {any}*/
export let data;

/** @type {{pn:string,sn:string,pid:number,tg:string,hse:string}} */
export let pupil;

/** @type {boolean}*/
export let open;


let edit={open:false,index:0}

let openEdit=(index)=>{
    edit.index=index;
    edit.open=true;
    console.log('editing');
};
</script>


{#if edit.open}
    <Modal bind:open={edit.open}>
        <header>
         
                <h4></h4>
        
        </header>
        <p>Are you sure?</p>
        <p>&nbsp;</p>
       
        <footer>
                <button class="button error" >Delete</button>
                <button class="button outline" on:click={()=>edit.open=false}>Cancel</button>
        </footer>
    </Modal>
    {/if}

<div class="parent">
<div class="row">
    <div class="col">
        <h4>{pupil.pn} {pupil.sn} Reports</h4>
    </div>
</div>

<table>
    <tbody>
        {#each data.a as row,rowIndex}
        <tr>
            <td>
                <div>
                    <span class="small">{row.sl} ({row.sc})</span>
                </div>
                <div>
                    <span class="small">{row.sal}</span>
                </div>
                <div>
                    <span class="small">EC {row.ec} / EP {row.ep}</span>
                </div>
            </td>
            <td>
                <textarea  on:click={()=>openEdit(rowIndex)} class={row.txt.length<row.min || row.txt.length>row.max ? 'comment red small' : 'comment green small'} bind:value={row.txt}/> 
            </td>
        </tr>
        {/each}
 
    </tbody>
</table>
<div class="row">
    <div class="col is-right">
        <button class="button outline" on:click={()=>open=false}>Close</button>
    </div>
</div>
</div>

<style>
    .parent {
        border:1px solid #333;
        border-radius:0.5rem;
        padding:0.5rem;
    }
    .small {
        font-size:1.2rem;
    }

    .comment {
        width:70rem;
        height:7rem;
    }

    .focussed {
        height:14rem;
    }



.red {
    background:rgba(178,34,34,0.15);
   
}

.green {
    background:rgba(34,139,34,0.15);
}

</style>