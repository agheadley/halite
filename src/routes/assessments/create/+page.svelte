<script>

    import {cohorts,groups,location} from '$lib/store';
    import { onMount } from 'svelte';
    import * as util from '$lib/util';
	import { goto } from '$app/navigation';
    
    
    

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
    
    <style>

    </style>
    