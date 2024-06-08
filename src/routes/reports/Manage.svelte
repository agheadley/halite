<script>
import { onMount } from 'svelte';
import {teachers,config} from '$lib/store';
    
/** @type {any}*/
export let data;


/** @type {any}*/
export let status;


let list={name:'',max:15};


onMount(async () => {
        console.log('/reports Manage.svelte');
      
        
});

</script>

<div class="row">


<div class="col">
        <p><span class="tag">CREATE REPORTS</span></p>

</div>


<div class="col">
<p><span class="tag">SAVE/EDIT LISTS</span></p>
<div>
        <fieldset>
                <legend>List Name (max{list.max})</legend>
                <p class="grouped">
                        <input type=text bind:value={list.name}/>
                        <button class="button dark">Save</button>
                </p>
        </fieldset>
</div>
<div>
        <fieldset>
                <legend>Filter</legend>
                <p class="grouped">
                   {#each data.years as y,yIndex}
                        {y.fm}<input type=checkbox bind:checked={y.filter}>
                   {/each}
                </p>
                <p class="grouped">
                  {#each data.gnds as g,gIndex}
                    {g.gnd}<input type=checkbox bind:checked={g.filter}>
                  {/each}
                        <button class="button outline small">Select All</button>
                        <button class="button outline small">Clear</button>
                        
                </p>
        </fieldset>
</div>
<div>
        Gnd filter, select clear
</div>
<table class="striped small">
        <tbody>
                {#each data.pupils as row,rowIndex}
                        {#if data.gnds.filter((/** @type {{ filter: boolean; }} */ el)=>el.filter===true).map((/** @type {{ gnd: any; }} */ el)=>el.gnd).includes(row.gnd) && data.years.filter((/** @type {{ filter: boolean; }} */ el)=>el.filter===true).map((/** @type {{ fm: any; }} */ el)=>el.fm).includes(row.fm)}
                        <tr>
                                <td><input type=checkbox bind:checked={row.select}/></td>
                                <td>{row.pn} {row.sn}</td>
                                <td>{row.fm}</td>
                                <td>{row.hse}</td>
                        </tr>
                        {/if}
                {/each}
        </tbody>
</table>


</div>


</div>

<style>

.small {
        font-size:1.2rem;
}
</style>