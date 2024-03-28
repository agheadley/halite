<script>
    import { onMount } from 'svelte';
    import {location} from '$lib/store'
    
    export let data;

    
    onMount(async () => {
	    console.log($location);
    
    });
    
    </script>
    
    <svelte:head>
        <title>About</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>

    <div class="row">
        <div class="col">
            <blockquote>Halite (AGH 3/MMXXIV)</blockquote>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <a class="button outline" href={data.user.tag.teacher ? $location : '/pupil'}>Cancel</a>
        </div>
        <div class="col">
        </div>
    </div>
    <p></p>
    
    <style>
    </style>