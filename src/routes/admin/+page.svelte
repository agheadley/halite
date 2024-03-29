<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import { goto } from '$app/navigation';
    
    
    let status={
        select:false
    };

    $:{
        if(status.select) {
            console.log('changed cohort...');
            status.select=false;
        }
    }
    
    
    onMount(async () => {
        $location='/admin';
        console.log(`${$location} mounted`);
        console.log('pupils',$pupils);
        console.log('groups',$groups);
        console.log('cohorts',$cohorts);
        
    });
    
    
    </script>
    
    <svelte:head>
        <title>Admin</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
    <div class="row">
        <div class="col is-vertical-align">
           <h4>/admin</h4>
        </div>
    </div>
    
    <style>
    </style>
    