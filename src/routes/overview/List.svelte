<script>
    import { onMount } from 'svelte';
    import {cohorts,alert} from '$lib/store';
	import * as util from '$lib/util';
    import Modal from '$lib/_Modal.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let control={
        selection:'current',
        lists:[],
        list:{name:'',type:'overview',lv:'',yr:0,user:'',pid:[],dl:'',dt:0},
        valid:false,
        max:15,
        delete:false,
        index:0
    
    };

    
    /**
     * 
     * @param {boolean} tf
     */
    let select=(tf)=>{
        for(let row of status.table) {
            if(row.show || control.selection==='all') row.select=tf;
        }
        status.table=status.table;
    }

    /**
     * 
     * @param {number} index
     */
    let choose=(index)=>{
        for(let row of status.table) {
            if(control.lists[index].pid.includes(row.pid)) {
                row.show=true;
                row.select=true;
            } else {
                row.show=false;
                row.select=false;
            }
        }
    };

    /**
     * 
     * @param {number} index
     */
    let removeOpen=(index)=>{
        control.index=index;
        control.delete=true;
    };
    let remove=async()=>{
        let oid=control.lists[control.index]._id;
        
        let response = await fetch('/edge/delete', {
		    method: 'POST',
		    body: JSON.stringify({collection:'lists',filter:{"_id": { "$oid": oid } }}),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);
        if(res.deletedCount && res.deletedCount===1 ) {
            $alert.msg=`List deleted`;  
        } else {
            $alert.type='error';
            $alert.msg=`Error deleting list`;
        }
        control.delete=false;

        await getLists();
    };

    let create=async()=>{

        control.list.pid=status.table.filter((/** @type {{ select: any; }} */ el)=>el.select).map((/** @type {{ pid: any; }} */ el)=>el.pid);
        control.list.dl=util.getDate();
        control.list.dt=new Date(control.list.dl).getTime();
        control.list.user=status.user;
        control.list.type='overview';
        let c=$cohorts.overview.years.list[$cohorts.overview.years.index];
        control.list.lv=c.lv;
        control.list.yr=c.yr;

        let response = await fetch('/edge/insert', {
		    method: 'POST',
		    body: JSON.stringify({collection:'lists',documents:[control.list]}),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);
        if(res[0]) {
            $alert.msg=`List created`;  
        } else {
            $alert.type='error';
            $alert.msg=`Error creating list`;
        }

        await getLists();
    };

    let validate=()=>{
        control.valid=true;
        control.list.name=control.list.name.replace(/ /g,"_");
        control.list.name=control.list.name.replace(/[^A-Za-z0-9._-]/g,"");
        control.list.name = control.list.name.length && control.list.name.length>control.max ? control.list.name.slice(0,(control.max-1)) : control.list.name;
        if(control.list.name==='') control.valid=false;
  
    };

    let getLists=async()=>{
        let c=$cohorts.overview.years.list[$cohorts.overview.years.index];
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'lists',filter:{lv:c.lv,yr:c.yr,user:status.user},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();

        console.log(res);
        control.lists=res.sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>b.dt-a.dt);
    
        //control.lists=control.lists;
    };

    onMount(async () => {
        console.log('overview/List.svelte mounted');
        getLists();

    });

</script>

{#if control.delete}
    <Modal bind:open={control.delete}>
        <header>
         
                <h4>Delete {control.lists[control.index].name}</h4>
        
        </header>
        <p>Are you sure?</p>
        <p>&nbsp;</p>
       
        <footer>
                <button class="button error" on:click={remove}>Delete</button>
                <button class="button outline" on:click={()=>control.delete=false}>Cancel</button>
        </footer>
    </Modal>
    {/if}

<div class="row">
    <div class="col">
        <h4>My Lists</h4>
    </div>
    <div class="col">
        <button class="button outline" on:click={()=>status.list=false}>Close</button>
    </div>
</div>



<div class="row">
    <div class="col-4">
        <table>
            {#each control.lists as list,listIndex}
    
            <tr>
                    <td><button class="button clear" on:click={()=>choose(listIndex)}>{list.name}</button></td>
                    <td>
                            <button class="button outline icon-only" on:click={()=>removeOpen(listIndex)}>         
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                    </td>
            </tr>
            {/each}

    </table>
    </div>

    <div class="col-8">
        <div class="row">
            <div class="col">
               
                    <fieldset> 
                        <legend>Assessment Name (max {control.max})</legend>
                        <p class="grouped">
                       
                        <input type=text bind:value={control.list.name} class={control.valid ? 'success' : 'error'} on:input={validate}/>
                        <button disabled={!control.valid} class="button dark" on:click={create}>Create</button>
                    </p>
                    </fieldset>
              
               
           
            </div>     
        </div>
        <div class="row">
            <div class="col">
                <div class="tabs">
                    <a href={'#'} class={control.selection==='current' ? 'active' :''} on:click={()=>control.selection='current'}>Selection</a>
                    <a href={'#'} class={control.selection==='all' ? 'active' :''} on:click={()=>control.selection='all'}>All</a>
                </div>
            </div>
            <div class="col">
                <button class="button outline" on:click={()=>select(true)}>Select All</button>
                <button class="button outline" on:click={()=>select(false)}>Clear</button>
            </div>
        </div>
      
       
        <div>&nbsp;</div>
        <div class="responsive">
            <table>
                <thead>
        
                </thead>
                <tbody>
                    {#each status.table as row,rowIndex}
                        {#if row.show || control.selection==='all'}
                        <tr>
                         
                            <td>
                                <input type=checkbox bind:checked={row.select}/>
                            </td>
                            <td>{row.pid}</td>
                            <td>{row.pn} {row.sn}</td>
                            <td>{row.hse}</td>
                            <td>{row.tg}</td>
                        </tr>
                        {/if}
                    {/each}
                </tbody>
            </table>
        </div>
    </div>

</div>







<style>

.responsive {
        overflow-x:auto;
    }

    td {
        padding:0.2rem;
    }


table {
        width:auto;
        line-height:2rem;
    }

</style>