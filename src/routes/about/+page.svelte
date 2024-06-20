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
        <div class="col is-center">
            <h2>Ostia Halite</h2>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <p>Ostia Halite tracks internal and external assessments in school. It also manages the reporting system.</p>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <blockquote>Ostia Halite is written by Dr Anthony Headley using Sveltekit</blockquote>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <a class="button outline" href={data.user.tag.teacher ? $location : '/pupil'}>Back</a>
        </div>
        <div class="col">
        </div>
    </div>
    <p></p>
    
    <style>
    </style>