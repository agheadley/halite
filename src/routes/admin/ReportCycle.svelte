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
        assessments:[],
        cohorts:[],
        index:0,
        confirm:false,
        valid:true
    };
    
    let addRow=()=>{

        let index=data.rows.length && data.rows.length>0 ? data.rows[data.rows.length-1].index+1 : 0;

        let comments=$config.year.map((/** @type {{ fm: any; }} */ el)=>({fm:el.fm,comment:false}));

        let y=new Date().getFullYear();
        let m=$config.term[0]==='Winter' ? '12' :    $config.term[0]==='Spring' ? '04' : '06';
        let ay=util.getAcademicYear(`${y}-${m}-01`,$config.rollover.month);
        console.log(ay);



        data.rows.push( 
            {
                active:false,
                index:index,
                term:$config.term[0],
                subterm:$config.subterm[0],
                year:y,
                ayear:ay,
                comment:comments,
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
    let changeActive=(index)=>{
        console.log(data.rows[index].active);
        data.rows.forEach((/** @type {{ active: boolean; }} */ v,/** @type {number} */ i)=>{
            if(i!=index) v.active=false;
        });
        data.rows=data.rows;
    };

      /**
     * 
     * @param {number} index
     */
    let changeYearTerm=(index)=>{
        data.rows[index].year  =  data.rows[index].year > 0 ? parseInt( data.rows[index].year) : 0;

        let y=data.rows[index].year;
        let m=data.rows[index].term==='Winter' ? '12' :    data.rows[index].term==='Spring' ? '04' : '06';
        data.rows[index].ayear=util.getAcademicYear(`${y}-${m}-01`,$config.rollover.month);

    };


     let confirmCycle=()=>{
      

    };

    let saveCycle=async()=>{
      
       
    };
        
    onMount(async () => {
        console.log('/admin ReportCycle.svelte');
        console.log(status);
        

       
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'cycles',filter:{},projection:{_id:0}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
      

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
        <div class="col is-vertical-align"><h4>Edit Report Cycles</h4></div> 
       
    </div>

 
    <div class="row">
        <div class="col">
           &nbsp;
        </div>
    </div>

   
  
            {#each data.rows as row,rowIndex}
              
           
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
   

    
    <style>
    
    </style>