<script>
import { onMount } from 'svelte';
import * as file from '$lib/file';
import * as util from '$lib/util';
import {alert,config,groups,teachers,pupils} from '$lib/store';
import Modal from '$lib/_Modal.svelte';

 /** @type {any}*/
 export let status;
/** @type {any}*/
let data={
    user:'',
    tIndex:0,
    pupils:[],
    all:false,
    cycles:[],
    cIndex:0,
    view:{context:'parent',rag:false,chance:false,fb:false},
    context:'parent',
    assessments:[],
    reports:[],
    print:false,

};

onMount(async () => {
    console.log('/admin ReportPrint.svelte');
    console.log(status);


    let f=$config.view.find(el=>el.context===data.view.context);
    data.view={context:'parent',rag:f?f.rag:false,chance:f?f.chance:false,fb:f?f.fb:false};
    console.log(f);

    // get report cycles
    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'cycles',filter:{},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    let res= await response.json();
    //console.log(res);

    data.cycles=res.sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>b.index-a.index);
    data.cIndex=0;
   
});

</script>


<h4>Generate Report Data</h4>

<div class="row">
    <div class="col is-vertical-align">
        <fieldset>
            <legend>Cycle</legend>           
            <select  id="Cycle" bind:value={data.cIndex}>
            <optgroup label="Cycle">
                    {#each data.cycles as item,index}
                        <option value={index}>{item.tt} {item.ts} {item.y}</option>
                    {/each}
            </optgroup>
            </select>
        </fieldset>
    </div>
</div>

<style>

</style>