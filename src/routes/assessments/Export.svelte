<script>
import * as file from '$lib/file';
/** @type {any}*/
export let status;

let exportResults=()=>{

};

let exportIntake=()=>{

};

</script>


<header>
         
<h4>Downloads</h4>

</header>

<p>
    <button on:click={exportResults} class="button outline">Results&nbsp;
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
    </button>
</p>

<p>
    <button on:click={exportIntake} class="button outline">Intake&nbsp;
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
    </button>
</p>

<p>&nbsp;</p>
<footer>
  
    <button class="button outline" on:click={()=>status.download=false}>Cancel</button>
</footer>

<style>

</style>