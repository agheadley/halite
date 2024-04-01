<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import { goto } from '$app/navigation';
    
    
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
        $location='/reports';
        console.log(`${$location} mounted`);
        console.log('pupils',$pupils);
        console.log('groups',$groups);
        console.log('cohorts',$cohorts);
        
    });
    

    let x=[
        [{x:2},{x:3},{x:2,y:1}],[{x:3},{y:7},{x:6,y:9}]
    ];
    
    </script>
    
    <svelte:head>
        <title>Reports</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
    <div class="row">
        <div class="col is-vertical-align">
           <h4>/reports</h4>
        </div>
    </div>
    


    <p>{JSON.stringify(x)}</p>

    <p>{JSON.stringify(x.flat())}</p>

    <style>
    </style>
    