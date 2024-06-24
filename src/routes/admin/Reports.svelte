<script>
    import { onMount } from 'svelte';
    import * as file from '$lib/file';
    import * as util from '$lib/util';
    import {alert,config} from '$lib/store';
    import Modal from '$lib/_Modal.svelte';
    // @ts-ignore
    import ReportCycle from './ReportCycle.svelte';
    import ReportCreate from './ReportCreate.svelte';
    import ReportPrint from './ReportPrint.svelte';
    import ReportEdit from './ReportEdit.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
  
        tabs:['Edit','Print','Cycle','Create'],
        tabIndex:0,
       
    };
    
  

   
    


   
   
        
    onMount(async () => {
        console.log('/admin Reports.svelte');
        console.log(status);
        

       
       
        
    });
    
    </script>

    <hr/>
    

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
        <ReportEdit bind:status={status}/>

    {/if} <!-- /tab==='Edit'-->


    {#if data.tabs[data.tabIndex]==='Create'}
        <ReportCreate bind:status={status}/>

    {/if} <!-- /tab==='Create'-->


    {#if data.tabs[data.tabIndex]==='Cycle'}
        <ReportCycle bind:status={status}/>
    {/if}

    {#if data.tabs[data.tabIndex]==='Print'}
        <ReportPrint bind:status={status}/>
    {/if}

    
    
    <style>
    
    </style>