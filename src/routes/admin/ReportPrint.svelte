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
    results:[],
    print:false,
    fm:7

};

let generate=async()=>{
    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'reports',filter:{coid:data.cycles[data.cIndex]._id,fm:data.fm},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    data.reports= await response.json();


    // ignore any F7 pupil in F6 - will have to manaully update this from the client and save the PDF as a correct ID.
    let f=$groups.find(el=>el.fm===data.fm);
    console.log(f);
    if(f) {
        response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'results',filter:{lv:f.lv,yr:f.yr},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        data.results= await response.json();

    }
    





    /*
    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'results',filter:{coid:data.cycles[data.cIndex]._id,fm:data.fm},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    data.reports= await response.json();
    */



};

onMount(async () => {
    console.log('/admin ReportPrint.svelte');
    console.log(status);


    let f=$config.view.find((/** @type {{ context: any; }} */ el)=>el.context===data.view.context);
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

    /** @type {any}*/
    let filter={"tag.archive":false};
    filter["tag."+data.context]=true;
    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'assessments',filter:filter ,projection:{_id:1,g:1,sc:1,sl:1,ss:1,dt:1,ds:1,n:1,tag:1,lv:1,yr:1}}),
        headers: {'content-type': 'application/json'}
    });
    data.assessments= await response.json();
    console.log(data.assessments);

    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'reports',filter:{coid:data.cycles[data.cIndex]._id},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    let reports= await response.json();
   
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
    <div class="col is-vertical-align">
        <fieldset>
            <legend>Year group</legend>           
            <select  id="Year" bind:value={data.fm}>
            <optgroup label="Year">
                    {#each $config.year as item,index}
                        <option value={item.fm}>{item.fm}</option>
                    {/each}
            </optgroup>
            </select>
        </fieldset>
    </div>
    <div class="col is-vertical-align">
        <button class="button dark" on:click={generate}>Generate Report Data</button>
    </div>
</div>

<style>

</style>