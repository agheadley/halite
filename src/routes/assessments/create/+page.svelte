<script>

    import {cohorts,groups,location,alert} from '$lib/store';
    import { onMount } from 'svelte';
    import * as util from '$lib/util';
	import { goto } from '$app/navigation';
    
    
    let test=()=>{
        console.log('alert ...');
        $alert.msg="Hello";
    

    };
    

    onMount(async () => {
        $location='/assessments/create';
        console.log(`${$location} mounted`);
       
    });
    
    
    </script>
    
    <div class="row">
        <div class="col">
            <a href={'/assessments'} class="button outline">Close</a>
        </div>
    </div>
    
    <button on:click={test}>test</button>
    <style>

    </style>
    