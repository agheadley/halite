<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import SelectCohort from './SelectCohort.svelte';
    
    
    let status={
        table:[],
        select:false
    };

    $:{
        if(status.select) {
            console.log('changed cohort...');
            status.select=false;
        }
    }
    
    
    onMount(async () => {
        $location='/overview';
        console.log(`${$location} mounted`);
        console.log('pupils',$pupils);
        console.log('groups',$groups);
        console.log('cohorts',$cohorts);
        
    });
    
    
    </script>
    
    <svelte:head>
        <title>Overview</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
   

    <div class="row">
      
            <SelectCohort bind:status={status}/>
        <div class="col is-vertical-align">
            <a href={''} class="button dark">My Lists</a>
        </div>
    </div>
    
    <style>
    </style>
    