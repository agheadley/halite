<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import { goto } from '$app/navigation';
    import Import from './Import.svelte';
    import Overview from './Overview.svelte';
    import Reports from './Reports.svelte';
    import Config from './Config.svelte';
    import Assessments from './Assessments.svelte';
    import Intake from './Intake.svelte';
    

    /** @type {any}*/
    export let data;

    let status={
        option:'Reports',
        options:['Overview','Assessments','Reports','Config','Import','Intake'],
        user:''
    };

  
    
    
    onMount(async () => {
        $location='/admin';
        console.log(`${$location} mounted`);
        console.log('pupils',$pupils);
        console.log('groups',$groups);
        console.log('cohorts',$cohorts);
        status.user=data.user.name;
        
    });
    
    
    </script>
    
    <svelte:head>
        <title>Admin</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    



    <div class="row">
        <div class="col">
            <div class="tabs">
                {#each status.options as row}
                <a href={'#'} on:click={()=>status.option=row} class={status.option===row ? 'active':''}>{row}</a>        
                {/each}
            </div>
        

        </div>
    </div>

    {#if status.option==='Overview'}<Overview bind:status={status}/>{/if}
    {#if status.option==='Assessments'}<Assessments bind:status={status}/>{/if}
    
    {#if status.option==='Reports'}<Reports bind:status={status}/>{/if}
    {#if status.option==='Config'}<Config bind:status={status}/>{/if}
    {#if status.option==='Import'}<Import bind:status={status}/>{/if}
    {#if status.option==='Intake'}<Intake bind:status={status}/>{/if}
    <style>
    </style>
    