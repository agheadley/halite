<script>
    import { onMount } from 'svelte';
    import {pupils,teachers,config} from '$lib/store';
    import Manage from './Manage.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
        user:'',
        teachers:[],
        tIndex:0,
        reports:[],
        pupils:[],
        years:[],
        gnds:[{gnd:'M',filter:true},{gnd:'F',filter:true}],
        lists:[]
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

        
        data.pupils=$pupils.map(el=>({id:el.id,pid:el.pid,sn:el.sn,pn:el.pn,hse:el.hse,tg:el.tg,fm:el.fm,gnd:el.gnd,select:false,show:true}));
        data.pupils=data.pupils.sort((/** @type {{ sn: string; pn: string; }} */ a,/** @type {{ sn: any; pn: any; }} */ b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn));   


        data.years=$config.year.map((/** @type {{ fm: any; }} */ el)=>({fm:el.fm,filter:true}));
        
        
        await update();
        //await updateReports(); // already handled by update


    });


</script>


<div class="row">
    <div class="col is-vertical-align">
        {#if !data.create}
        <h4>Write Enrichment Reports</h4>
        {:else}
        <h4>Manage Enrichment Reports</h4>
        {/if}
    </div>
    <div class="col is-vertical-align">
        <fieldset>
            <legend>Select Teacher</legend>
            <select  id="Teacher" bind:value={data.tIndex} on:change={update}>
                <optgroup label="Teacher">
                        {#each data.teachers as item,index}
                            <option value={index}>({item.tid}) {item.pn} {item.sn}</option>
                        {/each}
                </optgroup>
              </select>
     
        </fieldset>
        
    </div>
    <div class="col is-vertical-align is-right">
        {#if !data.create}
        <button class="button dark" on:click={()=>data.create=true}>Manage</button>
        {:else}
        <button class="button outline" on:click={()=>data.create=false}>Close</button>
        
        {/if}

    </div>
    
</div>


{#if data.create}
    <Manage bind:data={data} bind:status={status}/>
{/if}



{#if !data.create}

<p>List all status.reports (type=E) here, filtered only by user !</p>



{/if}

<style>


</style>