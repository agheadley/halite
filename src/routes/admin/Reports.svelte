<script>
    import { onMount } from 'svelte';
    import * as file from '$lib/file';
    import * as util from '$lib/util';
    import {alert,config} from '$lib/store';
    import Modal from '$lib/_Modal.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
        rows:[],
        tabs:['Cycle','Create','Edit'],
        tabIndex:0,
        assessments:[],
        cohorts:[],
        index:0,
        confirm:false,
        valid:true
    };
    
    let addRow=()=>{

        let index=data.rows.length && data.rows.length>0 ? data.rows[data.rows.length-1].index+1 : 0;

        data.rows.push( 
            {
                active:false,
                index:index,
                term:$config.term[0],
                subterm:$config.subterm[0],
                year:new Date().getFullYear(),
                A:{active:false,length:{min:180,max:600},effort:{class:true,prep:true}},
                E:{active:false,length:{min:300,max:600},effort:{class:false,prep:false}},
                P:{active:false,length:{min:300,max:600},effort:{class:false,prep:false}},
               
            }
        );
            
        data.rows=data.rows;
        console.log(data.rows);
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
    let changeActive=(index)=>{
        console.log(data.rows[index].active);
        data.rows.forEach((/** @type {{ active: boolean; }} */ v,/** @type {number} */ i)=>{
            if(i!=index) v.active=false;
        });
        data.rows=data.rows;
    };


     let confirmCycle=()=>{
        data.valid=true;
        for(let row of data.rows) {
            if(row.exam) {
                row.n=data.assessments[row.aIndex].n;
                row.dl=data.assessments[row.aIndex].dl;
                row.dt=data.assessments[row.aIndex].dt;
                row.from='';
                row.to='';
            } else {
                if(row.from==='' || row.to==='') data.valid=false;
            }
        }
        console.log(data.rows);
        data.confirm=true;

    };

    let saveCycle=async()=>{
        let update=[];
        for(let row of data.rows) {
            let obj= {
                active:row.active,
                index:row.index,
                term:row.term,
                subterm:row.subterm,
                year:row.year,
                A:{active:row.A.active,length:{min:row.A.length.min,max:row.A.length.max},effort:{class:row.A.effort.class,prep:row.A.effort.prep}},
                E:{active:row.E.active,length:{min:row.E.length.min,max:row.E.length.max},effort:{class:row.E.effort.class,prep:row.E.effort.prep}},
                P:{active:row.P.active,length:{min:row.P.length.min,max:row.P.length.max},effort:{class:row.P.effort.class,prep:row.P.effort.prep}},
            
            };
            update.push(obj);
        }

        let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({
                collection:'config',
                filter:{},
                update:{cycle:update}
                }),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);

        if(res.matchedCount===1) {
            $alert.msg=`Report Cycle Data saved -  ${res.modifiedCount===1 ? 'changes made' :'no changes'}`;
            data.confirm=false;
        } else {
            $alert.type='error';
            $alert.msg=`Error updating Report Cycle Data.`;
        }
       
    };
        
    onMount(async () => {
        console.log('/admin Reports.svelte');
        console.log(status);
        

       
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'config',filter:{},projection:{_id:0}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        $config=res[0] ? res[0] : {};

        console.log($config.cycle);
        data.rows=[];

        for(let row of $config.cycle) {
            let obj= {
                active:row.active,
                index:row.index,
                term:row.term,
                subterm:row.subterm,
                year:row.year,
                A:{active:row.A.active,length:{min:row.A.length.min,max:row.A.length.max},effort:{class:row.A.effort.class,prep:row.A.effort.prep}},
                E:{active:row.E.active,length:{min:row.E.length.min,max:row.E.length.max},effort:{class:row.E.effort.class,prep:row.E.effort.prep}},
                P:{active:row.P.active,length:{min:row.P.length.min,max:row.P.length.max},effort:{class:row.P.effort.class,prep:row.P.effort.prep}},
            
            };
            data.rows.push(obj);
         
        }   

        data.rows=data.rows.sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>a.index-b.index);

        console.log(data);
        
    });
    
    </script>

    <hr/>
    
    <Modal bind:open={data.confirm}>
        <div class="row">
            <div class="col">
                <h4>Save Report Cycles</h4>
            </div>
        </div>
      
       
        <div class="row">
            <div class="col">
               {#if data.valid}
                    <span class="tag">All valid</span>
               {:else}
                <span class="tag bg-error text-white">Complete data for each entry. CHECK ALL CYCLES.</span>
               {/if}
            </div>
        </div>
        <div class="row">
            <div class="col">
               &nbsp;
            </div>
        </div>
        <div class="row">

            <div class="col">
                <button class="button error" disabled={!data.valid} on:click={saveCycle}>Save</button>
            </div>
            <div class="col">
                <button class="button outline" on:click={()=>data.confirm=false}>Cancel</button>
            </div>
        </div>
    </Modal>
    

    <div class="row">
        <div class="col">
            <div class="tabs">
                {#each data.tabs as row,rowIndex}
                <a href={'#'} on:click={()=>data.tabIndex=rowIndex} class={data.tabIndex===rowIndex ? 'active':''}>{row}</a>        
                {/each}
            </div>
        </div>
    </div>


    {#if data.tabs[data.tabIndex]==='Edit'}
    <div class="row">
        <div class="col is-vertical-align"><h4>Edit Report Data</h4></div> 
       
    </div>

 
    <div class="row">
        <div class="col">
           &nbsp;
        </div>
    </div>

    {/if} <!-- /tab==='Edit'-->


    {#if data.tabs[data.tabIndex]==='Create'}
    <div class="row">
        <div class="col is-vertical-align"><h4>Create Reports (Active Cycle)</h4></div> 
       
    </div>

 
    <div class="row">
        <div class="col">
           &nbsp;
        </div>
    </div>

    {/if} <!-- /tab==='Create'-->


    {#if data.tabs[data.tabIndex]==='Cycle'}
    <div class="row">
        <div class="col is-vertical-align"><h4>Edit Report Cycles</h4></div> 
       
    </div>

 
    <div class="row">
        <div class="col">
           &nbsp;
        </div>
    </div>

   
  
            {#each data.rows as row,rowIndex}
              
                <div class="row">
                   
                    <div class="col-2 is-vertical-align">
                        <button class="button error icon-only" on:click={()=>removeRow(rowIndex)}>         
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                        </button>
                        &nbsp;
                        <fieldset id="index">
                            <legend>Active?</legend>
                            <input type=checkbox bind:checked={row.active} on:change={()=>changeActive(rowIndex)}>
                            {row.index}
                    </fieldset>
                    </div>
                   
                    <div class="col-3 is-vertical-align">
                        <fieldset id="cohort" class="is-full-width">
                            <legend>Main Details</legend>
                            <p class="grouped">
                                <select  id="details" bind:value={row.term}>
                                    <optgroup label="Term">
                                            {#each $config.term as item,index}
                                                <option value={item}>{item}</option>
                                            {/each}
                                    </optgroup>
                                  </select>
                                  <select  id="cohort" bind:value={row.subterm}>
                                    <optgroup label="Timing">
                                            {#each $config.subterm as item,index}
                                                <option value={item}>{item}</option>
                                            {/each}
                                    </optgroup>
                                  </select>
                            </p>
                            <p class="grouped">
                                <input id={`year-${rowIndex}`} type=number step="1" on:change={()=>row.year  = row.year > 0 ? parseInt(row.year) : 0} bind:value={row.year}/>
                                <label for={`year-${rowIndex}`}>CALENDAR YEAR</label>
                            </p>
                        </fieldset>
                    </div>
                    <div class="col-7  is-vertical-align">
                        <fieldset id="cohort" class="is-full-width">
                            <legend>Types (Active, Lengths,Efforts)</legend>

                            <p class="grouped">
                                Academic
                                <input type=checkbox bind:checked={row.A.active}>
                                <input id={`length-${rowIndex}-A`} type=number step="1" on:change={()=>row.A.length.min  = row.A.length.min > 0 ? parseInt(row.A.length.min) : 0} bind:value={row.A.length.min}/>
                                <label for={`length-${rowIndex}-A`}>TO</label>
                                <input type=number step="1" on:change={()=>row.A.length.max  = row.A.length.max > 0 ? parseInt(row.A.length.max) : 0}  bind:value={row.A.length.max}/>
                                <label for={`ec-${rowIndex}-A`} >CLASS</label>
                                <input id={`ec-${rowIndex}-A`} type=checkbox bind:checked={row.A.effort.class}>
                                <label for={`ep-${rowIndex}-A`} >PREP</label>
                                <input id={`ep-${rowIndex}-A`} type=checkbox bind:checked={row.A.effort.prep}>
                            </p>
                            <p class="grouped">
                                Enrichment
                                <input type=checkbox bind:checked={row.E.active}>
                                <input id={`length-${rowIndex}-E`} type=number step="1" on:change={()=>row.E.length.min  = row.E.length.min > 0 ? parseInt(row.E.length.min) : 0} bind:value={row.E.length.min}/>
                                <label for={`length-${rowIndex}-E`}>TO</label>
                                <input type=number step="1" on:change={()=>row.E.length.max  = row.E.length.max > 0 ? parseInt(row.E.length.max) : 0}  bind:value={row.E.length.max}/>
                                <label for={`ec-${rowIndex}-E`} >CLASS</label>
                                <input id={`ec-${rowIndex}-E`} type=checkbox bind:checked={row.E.effort.class}>
                                <label for={`ep-${rowIndex}-E`} >PREP</label>
                                <input id={`ep-${rowIndex}-E`} type=checkbox bind:checked={row.E.effort.prep}>
                            </p>
                            <p class="grouped">
                                Pastoral
                                <input type=checkbox bind:checked={row.P.active}>
                                <input id={`length-${rowIndex}-P`} type=number step="1" on:change={()=>row.P.length.min  = row.P.length.min > 0 ? parseInt(row.P.length.min) : 0} bind:value={row.P.length.min}/>
                                <label for={`length-${rowIndex}-P`}>TO</label>
                                <input type=number step="1" on:change={()=>row.P.length.max  = row.P.length.max > 0 ? parseInt(row.P.length.max) : 0}  bind:value={row.P.length.max}/>
                                <label for={`ec-${rowIndex}-P`} >CLASS</label>
                                <input id={`ec-${rowIndex}-P`} type=checkbox bind:checked={row.P.effort.class}>
                                <label for={`ep-${rowIndex}-P`} >PREP</label>
                                <input id={`ep-${rowIndex}-P`} type=checkbox bind:checked={row.P.effort.prep}>
                            </p>
                        </fieldset>
                    </div>
                    
                

                 

               
                </div>
              

            {/each}
            <div class="row">
                <div class="col">
                    <button class="button dark icon-only" on:click={addRow}>         
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
            </div>
                <div class="col">
                    <button class="button dark" on:click={confirmCycle}>Save</button>
                </div>
            </div>
   
    {/if} <!-- /tab==='Cycle'-->
    
    <style>
    
    </style>