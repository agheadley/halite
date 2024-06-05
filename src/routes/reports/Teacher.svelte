<script>

    import { onMount } from 'svelte';
    import {groups} from '$lib/store'

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
        index:0,
        groups:[]
    };

    onMount(async () => {
       console.log('reports/Teacher.svelte mounted');
       data.groups=[];
       for(let item of status.reports.filter((/** @type {{ author: { tid: any; type: string; }; type: string; }} */ el)=>el.author.tid===status.user && el.type==='A' && el.author.type==='teacher')) {
            if(!data.groups.find((/** @type {{ fm: any; g: any; }} */ el)=>el.fm===item.fm && el.g===item.g))
                data.groups.push({g:item.g,fm:item.fm,sl:item.sl,sc:item.sc,ss:item.ss});
       }
       console.log(data.groups);
    });

</script>


<div class="row">
    <div class="col is-vertical-align">
        <h4>Teacher Comments </h4>
    </div>
    <div class="col is-vertical-align">

        <select  id="Groups" bind:value={data.index}>
            <optgroup label="Groups">
                    {#each data.groups as item,index}
                        <option value={index}>{item.g}</option>
                    {/each}
            </optgroup>
          </select>
 
    </div>
    <div class="col is-vertical-align">
        &nbsp;
    </div>

</div>


<style>

</style>