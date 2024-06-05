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
       cycle:{},
       reports:[]
    };
    
    

    let create=async()=>{

    };
        
    onMount(async () => {
        console.log('/admin ReportCreate.svelte');
        console.log(status);

       
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'cycles',filter:{active:true},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        data.cycle=res[0] ? res[0] : {};

       
       
       
    
    });
    
    </script>


    



  
    <div class="row">
        <div class="col is-vertical-align"><h4>Create Reports</h4></div> 
       
    </div>

 
    {#if data.active}
    <div class="row">
        <div class="col is-vertical-align">
            <span class="tag bold">Report Cycle : {data.cycle.term} {data.cycle.subterm} {data.cycle.year}</span>
        </div> 
    </div>
    <div class="row">
        <div class="col">
            {#if data.reports.length && data.reports.length>1}
            <span class="tag">${data.reports.length} reports already exist, please edit before trying to create.</span>
            {:else}
                <button on:click={create} class="button error">Create</button>
            {/if}
        </div>
    </div>
    {:else}
    <div class="row">
        <div class="col is-vertical-align">
    <span class="tag">No active cycle to create reports</span>
    </div></div>
    {/if}

    <div class="row">
        <div class="col">
           &nbsp;
        </div>
    </div>

   
  
         

    
    <style>
    
    .bold {
        font-weight:600;
    }
  
    </style>