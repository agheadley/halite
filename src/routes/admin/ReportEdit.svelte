<script>
    import { onMount } from 'svelte';
    import * as file from '$lib/file';
    import * as util from '$lib/util';
    import {alert,config,groups,teachers,pupils,cycles} from '$lib/store';
    import Modal from '$lib/_Modal.svelte';
	import SelectCohort from '../assessments/SelectCohort.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
       index:0,
       fm:0,
       reports:[],
       open:false,
       filter:{atype:'',hse:'',tid:'',ss:'',sc:'',g:'',txt:false},
    };
    
    
    
    let update=async()=>{
        let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'reports',filter:{coid:$cycles[data.index]._id} ,projection:{}}),
        headers: {'content-type': 'application/json'}
        });
        data.reports= await response.json();
      
        order();
        console.log(data.reports);
    };


    let order=()=>{
        if(data.type==='A') {
            data.reports=data.reports
            .sort((/** @type {{ fm: number; type: string; author: { type: string; tid: string; }; sc: string; ss: string; g: string; pupil: { sn: string; pn: string; }; }} */ a,/** @type {{ fm: number; type: any; author: { type: any; tid: any; }; sc: any; ss: any; g: any; pupil: { sn: any; pn: any; }; }} */ b)=>
            b.fm - a.fm || 
            a.type.localeCompare(b.type) || 
            a.sc.localeCompare(b.sc) || 
            a.ss.localeCompare(b.ss) || 
            a.g.localeCompare(b.g) || 
            a.pupil.sn.localeCompare(b.pupil.sn) || 
            a.pupil.pn.localeCompare(b.pupil.pn) || 
            a.author.type.localeCompare(b.author.type) || 
            a.author.tid.localeCompare(b.author.tid) );
        } 
        if(data.type==='E') {
            data.reports=data.reports
            .sort((/** @type {{ fm: number; pupil: { sn: string; pn: string; }; sl: string; author: { tid: string; }; }} */ a,/** @type {{ fm: number; pupil: { sn: any; pn: any; }; sl: any; author: { tid: any; }; }} */ b)=>
            b.fm - a.fm || 
            a.pupil.sn.localeCompare(b.pupil.sn) || 
            a.pupil.pn.localeCompare(b.pupil.pn) || 
            a.sl.localeCompare(b.sl) || 
            a.author.tid.localeCompare(b.author.tid) );


        }

        if(data.type==='P') {
            data.reports=data.reports
            .sort((/** @type {{ fm: number; pupil: { hse: string; tg: string; sn: string; pn: string; }; sl: string; author: { tid: string; }; }} */ a,/** @type {{ fm: number; pupil: { hse: any; tg: any; sn: any; pn: any; }; sl: any; author: { tid: any; }; }} */ b)=>
            b.fm - a.fm || 
            a.pupil.hse.localeCompare(b.pupil.hse) || 
            a.pupil.tg.localeCompare(b.pupil.tg) || 
            a.pupil.sn.localeCompare(b.pupil.sn) || 
            a.pupil.pn.localeCompare(b.pupil.pn) || 
            a.sl.localeCompare(b.sl) || 
            a.author.tid.localeCompare(b.author.tid) );


        }

    };

        
    onMount(async () => {
        console.log('/admin ReportEdit.svelte');
        console.log(status);
        let f=$config.year.find((/** @type {{ fm: number; }} */ el)=>el.fm===7) ;
        data.fm=f? f.fm : $config.year[0].fm;
        data.fm=data.fm;
        await update();
      
    });
     
    
    </script>

<Modal bind:open={data.open}>
    <div class="row">
        <div class="col">
            Edit Data
        </div>
        <div class="col">
            <button class="button outline" on:click={()=>data.open=false}>Close</button>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <p>Show data here and type of changes, e.g, all in subject, group, a pupil, teacher</p>
        </div>
      
    </div>
</Modal>

    

<div class="row">
    <div class="col is-vertical-align">
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
    <!--
    <div class="col-3 is-vertical-align">
    
        <fieldset>
            <legend>Retport Types</legend>
            <p class="grouped">
                {#each Object.keys(data.types) as col}
                    {col} <input type=radio value={col} bind:group={data.type} on:change={order}/>
                {/each}
            </p>
        </fieldset>
    </div>
    -->
</div>


<div class="row">
    <div class="col">
        <table class="striped small">
            <thead>
                <tr>
                    <th>{$cycles[data.index].tt} {$cycles[data.index].ts} {$cycles[data.index].y}</th>
                    <th><input type=text bind:value={data.filter.atype}/></th>
                    <th><input type=text bind:value={data.filter.tid}/></th>
                    <th>sal</th>
                    <th>pupil</th>
                    <th><input type=text bind:value={data.filter.hse}/></th>
                    <th><input type=text bind:value={data.filter.ss}/></th>
                    <th><input type=text bind:value={data.filter.sc}/></th>
                    <td></td>
                    <th><input type=text bind:value={data.filter.g}/></th>
                    <th>efforts</th>
                    <th>blank?<input type=checkbox bind:checked={data.filter.txt}/></th>
                   

                </tr>
            </thead>
            <tbody>
                {#each data.reports as row,rowIndex}
                    {#if row.fm===data.fm}
                    {#if 
                        (row.author.tid===data.filter.tid || data.filter.tid==='') &&
                        (row.ss===data.filter.ss || data.filter.ss==='') &&
                        (row.sc===data.filter.sc || data.filter.sc==='') &&
                        (row.author.type===data.filter.atype || data.filter.atype==='') &&
                        (row.pupil.hse===data.filter.hse || data.filter.hse==='') &&
                        (row.g===data.filter.g || data.filter.g==='') &&
                        (data.filter.txt===true && row.txt==='' || data.filter.txt===false)

                    }

                    <tr>
                        <td>{row.coid}</td>
                        <td>{row.author.type}</td>
                        <td>{row.author.tid}</td>
                        <td>{row.author.sal}</td>
                        <td>{row.pupil.pn} {row.pupil.sn}</td>
                        <td>{row.pupil.hse}</td>
                        <td>{row.ss}</td>
                        <td>{row.sc}</td>
                        <td>{row.sl}</td>
                        <td>{row.g}</td>
                        <td>{row.ec} {row.ep}</td>
                        <td>{row.txt}</td>
                    

                    </tr>
                    {/if}
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