<script>

    import { onMount } from 'svelte';
    import {config,location,pupils} from '$lib/store';
    import { goto } from '$app/navigation';
    
    export let data ;
    

    
    
    onMount(async () => {
        $location='/assessments';
        console.log(`${$location} mounted`);
        console.log(data);
        console.log('pupils',$pupils);
    });
    
    
    </script>
    
    <svelte:head>
        <title>Assessments</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
    <div class="row">
        <div class="col">
            <h4>Assessments</h4>
        </div>
    </div>
    
    <style>
    </style>
    