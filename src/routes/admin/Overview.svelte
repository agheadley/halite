<script>
    import { onMount } from 'svelte';
    import * as file from '$lib/file';
    import * as util from '$lib/util';
    import {alert,config} from '$lib/store';
    
    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
        rows:[],
        assessments:[],
        cohorts:[],
        index:0
    };
    
    let addRow=()=>{
        data.rows.push(
            {lv:data.cohorts[data.index].lv,yr:data.cohorts[data.index].yr,exam:false,from:"0000-00-00",to:"0000-00-00",n:"",dl:""}
        );
        data.rows=data.rows;
    };
        
    onMount(async () => {
        console.log('/admin Overview.svelte');
        console.log(status);
        

        /* find exam assessments */
        let response = await fetch('/edge/distinct', {
            method: 'POST',
            body: JSON.stringify({collection:'assessments',match:{"tag.archive":false,"tag.exam":true},aggregate:['yr','lv','n','dl','dt']}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        data.assessments=res[0] ? 
            res.sort((/** @type {{ yr: number; lv: any; }} */ a,/** @type {{ yr: number; lv: string; }} */ b)=>a.yr-b.yr || b.lv.localeCompare(a.lv))
            : [];

        /* find active cohorts */
        response = await fetch('/edge/distinct', {
            method: 'POST',
            body: JSON.stringify({collection:'groups',match:{},aggregate:['yr','lv']}),
            headers: {'content-type': 'application/json'}
        });
        res= await response.json();
        data.cohorts=res[0] ? 
            res.sort((/** @type {{ yr: number; lv: any; }} */ a,/** @type {{ yr: number; lv: string; }} */ b)=>a.yr-b.yr || b.lv.localeCompare(a.lv))
            : [];

        /* refresh config, to get current $config.overview rows */
        response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'config',filter:{},projection:{_id:0}}),
            headers: {'content-type': 'application/json'}
        });
        res= await response.json();
        $config=res[0] ? res[0] : {};

        console.log(data);
        
    });
    
    </script>
    
    
    <div class="row">
        <div class="col is-vertical-align"><h4>Edit Overview Display Columns</h4></div> 
        <div class="col is-vertical-align">
          
            <fieldset id="cohort" class="is-full-width">
                <legend>Cohort</legend>
                <p class="grouped">
                <select  id="cohort" bind:value={data.index}>
                    <optgroup label="Level ExamYear">
                            {#each data.cohorts as item,index}
                                <option value={index}>{item.lv} {item.yr}</option>
                            {/each}
                    </optgroup>
                  </select>
                </p>
                </fieldset>
            
            
        </div>
    </div>
   
    <table>
        <thead>
            <tr>
                <th>Cohort</th>
                <td>Date Range / Single Exam</td>
                <th>From</th>
                <th>To</th>
                <th>Exam</th>
            </tr>
        </thead>
        <tbody>
            {#each data.rows as row,rowIndex}
                {#if row.lv===data.cohorts[data.index].lv && row.yr===data.cohorts[data.index].yr}
                <tr>
                    <td>
                        {row.lv} {row.yr}
                    </td>
                    <td>

                    </td>
                    <td>
                        <input type=date bind:value={row.from} class={row.from!=='' ? 'success' : 'error'}/>
                    </td>
                    <td>
                        <input type=date bind:value={row.to} class={row.to!==''? 'success' : 'error'}/>
                    </td>

                </tr>
                {/if}
            {/each}
            <tr>
                <td colspan=5>
                    <button class="button dark icon-only" on:click={addRow}>         
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </td>
            </tr>
        </tbody>
    </table>
   
    
    <style>
    
    </style>