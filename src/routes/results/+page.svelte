<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    

    /** @type {any}*/    
    let status={
  
    };

    
    
    onMount(async () => {
        $location='/results';

       
    });
    
    
    </script>
    
    <svelte:head>
        <title>Results</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
    <div class="row">
        <div class="col is-vertical-align">
        <h4>/results</h4>
        </div>

    </div>

   


    
    <style>

    </style>
    