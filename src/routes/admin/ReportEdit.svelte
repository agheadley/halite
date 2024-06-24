<script>
    import { onMount } from 'svelte';
    import * as file from '$lib/file';
    import * as util from '$lib/util';
    import {alert,config,groups,teachers,pupils,cycles} from '$lib/store';
    import Modal from '$lib/_Modal.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
       index:0,
       fm:0,
       types:{A:true,E:false,P:false},
       reports:[]
    };
    
    
    
    let update=async()=>{
        let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'reports',filter:{coid:$cycles[data.index]._id} ,projection:{}}),
        headers: {'content-type': 'application/json'}
        });
        data.reports= await response.json();
        data.reports=data.reports.sort((/** @type {{ fm: number; type: string; author: { type: string; tid: string; }; sc: string; ss: string; g: string; pupil: { sn: string; pn: string; }; }} */ a,/** @type {{ fm: number; type: any; author: { type: any; tid: any; }; sc: any; ss: any; g: any; pupil: { sn: any; pn: any; }; }} */ b)=>b.fm - a.fm || a.type.localeCompare(b.type) || a.author.type.localeCompare(b.author.type) || a.sc.localeCompare(b.sc) || a.ss.localeCompare(b.ss) || a.g.localeCompare(b.g) || a.pupil.sn.localeCompare(b.pupil.sn) || a.pupil.pn.localeCompare(b.pupil.pn) || a.author.tid.localeCompare(b.author.tid) )
        console.log(data.reports);
    };



        
    onMount(async () => {
        console.log('/admin ReportEdit.svelte');
        console.log(status);
        data.fm=$config.year[0].fm;
        await update();
      
    });
     
    
    </script>


    

<div class="row">
    <div class="col-6 is-vertical-align">
        <fieldset class="is-full-width">
            <legend>Cycle</legend>    
            <p class="grouped">       
            <select  id="Cycle" bind:value={data.index} on:change={update}>
            <optgroup label="Cycle">
                    {#each $cycles as item,index}
                        <option value={index}>{item.tt} {item.ts} {item.y}</option>
                    {/each}
            </optgroup>
            </select>
            {#if $cycles[data.index].active}<span class="tag text-error">ACTIVE</span>{/if}
            {#if $cycles[data.index].publish}<span class="tag text-error">PUBLISHED</span>{/if}
            </p>
        </fieldset>
      
    </div>
    <div class="col-3 is-vertical-align">
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
    <div class="col-3 is-vertical-align">
        <fieldset>
            <legend>Retport Types</legend>
            <p class="grouped">
                {#each Object.keys(data.types) as col}
                    {col} <input type=checkbox bind:checked={data.types[col]}/>
                {/each}
            </p>
        </fieldset>
    </div>
</div>

<div class="row">
    <div class="col">
        <table class="striped small">
            <thead>

            </thead>
            <tbody>
                {#each data.reports as row,rowIndex}
                    <tr>
                        <td>({row.type}) {row.author.type} {row.author.tid}</td>
                        <td>{row.author.sal}</td>
                        <td>{row.pupil.pn} {row.pupil.sn}</td>
                        <td>{row.txt}</td>
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