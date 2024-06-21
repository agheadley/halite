<script>

    import { onMount } from 'svelte';
    import {config,location,alert} from '$lib/store';
	import Pupil from '$lib/_Pupil.svelte';
  


    /** @type {any}*/
    export let data;

    onMount(async () => {
        console.log(data.user);
  
    
    });
</script>

<Pupil pupil={{context:'pupil',user:data.user.name,pid:Number(data.user.name)}}/>


<style>

</style>