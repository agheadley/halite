<script>

import { onMount } from 'svelte';
import {groups,teachers,config,alert,pupils} from '$lib/store';
import * as html from '$lib/html';

/** @type {any}*/
export let status;

/** @type {any}*/
let data={
    user:'',
    tIndex:0,
    pupils:[],
    all:false,
    cycles:[],
    cIndex:0
};

let selectAll=()=>{
    for(let item of data.pupils) item.select=data.all;
    data.pupils=data.pupils;
};


let update=async()=>{
        data.user=status.teachers[data.tIndex].tid;

        let response = await fetch('/edge/distinct', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',match:{coid:status.cycle._id,"pupil.tg":data.user},aggregate:['fm','pupil']}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        
        console.log(res);
       
        if(res[0]) {
            data.pupils=[];
            for(let item of res) {
                if(!data.pupils.find((/** @type {{ fm: any; pid: any; }} */ el)=>el.fm===item.fm && el.pid===item.pupil.pid)) {
                    data.pupils.push({pid:item.pupil.pid,sn:item.pupil.sn,pn:item.pupil.pn,tg:item.pupil.tg,hse:item.pupil.hse,fm:item.fm,select:false,report:{}});
                }
            }
            data.pupils=data.pupils.sort((/** @type {{ sn: string; pn: string; }} */ a,/** @type {{ sn: any; pn: any; }} */ b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn) );
        
        } else data.pupils=[];

        console.log(data.pupils);


        /*
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',filter:{type:'P',coid:status.cycle._id,"author.tid":data.user},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        data.reports=res[0] ? res.sort((a,b)=>a.pupil.sn.localeCompare(b.pupil.sn) || a.pupil.pn.localeCompare(b.pupil.pn) ) :[];
        */
        
       


        console.log(data);
    };

    let printSelected=async()=>{

        // analsyse each report on the fly and add to a count, to decide when to break page, if commnets, length can be thought about the break can be calculated ?


        let content='<p>Hello!</p>'
        const url = URL.createObjectURL(new Blob([html.start+content+html.end], { type: "text/html" }));
        const win = window.open(url);	

    };
    
    onMount(async () => {
    console.log('reports/View.svelte mounted');
    data.user=status.user;
    data.tIndex=status.teachers.findIndex((/** @type {{ tid: any; }} */ el)=>el.tid===data.user);

    let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'cycles',filter:{},projection:{}}),
            headers: {'content-type': 'application/json'}
    });
    let res= await response.json();
    //console.log(res);

    data.cycles=res.sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>b.index-a.index);
    data.cIndex=0;


    await update();

    });


</script>



<div class="row">
    <div class="col is-vertical-align">
        <h4>View / Print Reports</h4>
    </div>
    <div class="col is-vertical-align">
        <fieldset>
            <legend>Select Tutor</legend>
           
        <select  id="Tutor" bind:value={data.tIndex} on:change={update}>
            <optgroup label="Tutor">
                    {#each status.teachers as item,index}
                        <option value={index}>({item.tid}) {item.pn} {item.sn}</option>
                    {/each}
            </optgroup>
          </select>
          </fieldset>
 
    </div>
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
        <button class="button dark" on:click={printSelected}>Print View</button>
    </div>
</div>

<div class="row">
    <div class="col is-vertical-align">
        {#if data.pupils[0]}
            <table>
                <thead>
                    <tr>
                        <td><input type=checkbox bind:checked={data.all} on:change={selectAll}></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        
                    </tr>
                </thead>
                <tbody>

                
            {#each data.pupils as row,rowIndex}
                    <tr>
                        <td><input type=checkbox bind:checked={row.select}></td>
                       
                        <td>{row.pn} {row.sn}</td>
                        <td>{row.fm}</td>
                        <td>{row.tg}</td>
                        <td>{row.hse}</td>
                    </tr>
            {/each}
            </tbody>
            </table>
            

        {:else}
            <p>No pupil reports found for this tutor</p>
        {/if}
    </div>
</div>


<style>

</style>