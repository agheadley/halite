<script>

    import {cohorts,groups,location,alert} from '$lib/store';
    import { onMount } from 'svelte';
    import * as util from '$lib/util';
	import { goto } from '$app/navigation';
    
    
    let test=()=>{
        console.log('alert ...');
        $alert.type='error';
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
    
    <button class="button error" on:click={test}>test</button>
    <button class="button" on:click={()=>$alert.msg='back to normal!'}>test</button>
    
    <style>

    </style>
    