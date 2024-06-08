<script>
    import { onMount } from 'svelte';
    import {groups,teachers,config} from '$lib/store';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
        user:'',
        teachers:[],
        tIndex:0
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

<div class="row">
    <div class="col is-vertical-align">
        <h4>Enrichment Reports</h4>
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
</div>

<style>


</style>