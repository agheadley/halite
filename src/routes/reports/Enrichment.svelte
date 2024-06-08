<script>
    import { onMount } from 'svelte';
    import {groups,teachers,config} from '$lib/store';
    import Manage from './Manage.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
        user:'',
        teachers:[],
        tIndex:0,
        reports:[]
    };

    let update=async()=>{

    };

    onMount(async () => {
       console.log('reports/Teacher.svelte mounted');

       data.user=status.user;

       data.teachers=$teachers.sort((a,b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn));
       // testing
       data.teachers=$teachers.sort((a,b)=>a.tid.localeCompare(b.tid));

       data.tIndex=data.teachers.findIndex((/** @type {{ tid: any; }} */ el)=>el.tid===data.user);

      
        await update();
        //await updateReports(); // already handled by update


    });


</script>

{#if data.create}
    <Manage bind:data={data} bind:status={status}/>
{/if}

<div class="row">
    <div class="col is-vertical-align">
        {#if !data.create}
        <h4>Write Enrichment Reports</h4>
        {:else}
        <h4>Manage Enrichment Reports</h4>
        {/if}
    </div>
    <div class="col is-vertical-align">

        <select  id="Teacher" bind:value={data.tIndex} on:change={update}>
            <optgroup label="Teacher">
                    {#each data.teachers as item,index}
                        <option value={index}>({item.tid}) {item.pn} {item.sn}</option>
                    {/each}
            </optgroup>
          </select>
 
    </div>
    <div class="col is-vertical-align is-right">
        {#if !data.create}
        <button class="button dark" on:click={()=>data.create=true}>Manage</button>
        {:else}
        <button class="button outline" on:click={()=>data.create=false}>Close</button>
        
        {/if}

    </div>
    
</div>




{#if !data.create}

<p>List all status.reports (type=E) here, filtered only by user !</p>



{/if}

<style>


</style>