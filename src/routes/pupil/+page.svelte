<script>

    import { onMount } from 'svelte';
    import {config,location} from '$lib/store';
    
    export let data;
    onMount(async () => {
        $location='/pupil';
        console.log(data);
    });
    
    
    </script>
    
    <svelte:head>
        <title>Pupil</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
    <div class="row">
        <div class="col">
            <h4>/pupil</h4>
        </div>
    </div>
    
    <style>
    </style>
    