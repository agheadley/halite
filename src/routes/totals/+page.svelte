<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    

    /** @type {any}*/    
    let status={
  
    };

    
    
    onMount(async () => {
        $location='/totals';

       
    });
    
    
    </script>
    
    <svelte:head>
        <title>Totals</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
    <div class="row">
        <div class="col is-vertical-align">
        <h4>/totals</h4>
        </div>

    </div>

   


    
    <style>

    </style>
    