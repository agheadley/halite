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
        cIndex:0
    };
    
    let addRow=()=>{
        data.rows.push(
            {aIndex:0,lv:data.cohorts[data.cIndex].lv,yr:data.cohorts[data.cIndex].yr,exam:false,from:"0000-00-00",to:"0000-00-00",n:"",dl:""}
        );
        data.rows=data.rows;
    };

    /**
     * 
     * @param {number} index
     */
    let removeRow=(index)=>{
        console.log(index,data.rows[index]);
        data.rows.splice(index, 1);
        data.rows=data.rows;
    };

     /**
     * 
     * @param {number} index
     */
     let addAssessment=(index)=>{
        console.log(index,data.rows[index].aIndex);
        data.rows[index].n=data.assessments[data.rows[index].aIndex].n;
        data.rows[index].dl=data.assessments[data.rows[index].aIndex].dl;
        
        console.log(data.rows);
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

        data.rows=[];
        for(let row of $config.overview) {
            data.rows.push(row);

        }   
        for(let row of data.rows) row.aIndex=0;

        console.log(data);
        
    });
    
    </script>
    
    
    <div class="row">
        <div class="col is-vertical-align"><h4>Edit Overview Display Columns</h4></div> 
        <div class="col is-vertical-align">
          
            <fieldset id="cohort" class="is-full-width">
                <legend>Cohort</legend>
                <p class="grouped">
                <select  id="cohort" bind:value={data.cIndex}>
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
   
  
            {#each data.rows as row,rowIndex}
                {#if row.lv===data.cohorts[data.cIndex].lv && row.yr===data.cohorts[data.cIndex].yr}
                <div class="row">
                   
                    <div class="col-2  is-vertical-align">
                        <button class="button error icon-only" on:click={()=>removeRow(rowIndex)}>         
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                        &nbsp;
                        <fieldset id="cohort">
                            <legend>Cohort</legend>
                        {row.lv} {row.yr}
                    </fieldset>
                    </div>
                   
                    <div class="col-5  is-vertical-align">
                        <fieldset id="cohort" class="is-full-width">
                            <legend>Single Assessment?</legend>
                            <p class="grouped">
                            <input type=checkbox bind:checked={row.exam}>
                                {#if row.exam}
                                <select  id="cohort" bind:value={row.aIndex} on:change={()=>addAssessment(rowIndex)}>
                                    <optgroup label="Level ExamYear">
                                            {#each data.assessments as item,index}
                                                {#if item.lv===data.cohorts[data.cIndex].lv && item.yr===data.cohorts[data.cIndex].yr}
                                                <option value={index}>{item.n} {item.dl} ({item.lv} {item.yr})</option>
                                                {/if}
                                            {/each}
                                    </optgroup>
                                  </select>
                                {/if}
                            </p>
                        </fieldset>
                    </div>
                    <div class="col-5  is-vertical-align">
                        <fieldset id="cohort" class="is-full-width">
                            <legend>Assessment Range (From / To)</legend>
                            <p class="grouped">
                                <input disabled={row.exam} type=date bind:value={row.from} class={row.from!=='' ? 'success' : 'error'}/>
                                <input disabled={row.exam} type=date bind:value={row.to} class={row.to!==''? 'success' : 'error'}/>
                            </p>
                        </fieldset>
                    </div>

                 

               
                </div>
                {/if}
            {/each}
            <div class="row">
                <div class="col">
                    <button class="button dark icon-only" on:click={addRow}>         
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
            </div>
            </div>
   
    
    <style>
    
    </style>