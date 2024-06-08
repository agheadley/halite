<script>
import { onMount } from 'svelte';
import {teachers,config} from '$lib/store';
    
/** @type {any}*/
export let data;


/** @type {any}*/
export let status;

onMount(async () => {
        console.log('/reports Manage.svelte');
      
        
});

</script>

<div class="row">
List management
<div class="col">

</div>


<div class="col">
<p>Pupil Selection and list saving</p>


<table class="striped small">
        <thead>
                <tr>
                        <th colspan="4">
                                Form filter
                        </th>
                </tr>
                <tr>
                        <th colspan="2">
                                Gnd filter
                        </th>
                        <td>Clear</td>
                        <td>Select</td>
                </tr>
        </thead>
        <tbody>
                {#each data.pupils as row,rowIndex}
                        <tr>
                                <td>{row.select}</td>
                                <td>{row.pn} {row.sn}</td>
                                <td>{row.fm}</td>
                                <td>{row.hse}</td>
                        </tr>
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