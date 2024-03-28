<script>
    import { onMount } from 'svelte';
    import * as auth from '$lib/auth';
    import {location} from '$lib/store'
    
    export let data;

    let logout=()=>{
        console.log('logging out...');
        auth.logout(data.user.homeAccountId);
    };
    
    onMount(async () => {
	    console.log($location);
        console.log(data.user);
	
    
    });
    
    </script>
    
    <svelte:head>
        <title>Logout</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>

    <blockquote>{data.user.name}</blockquote>
    <div class="row">
        <div class="col">
            <p>Do you want to logout?</p>
            <button class="button dark" on:click={logout}>Logout</button>
            <a class="button outline" href={data.user.tag.teacher ? $location : '/pupil'}>Cancel</a>
        </div>
        <div class="col">
        </div>
    </div>
    <p></p>
    
    <style>
    </style>