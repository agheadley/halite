<script>

import { onMount } from 'svelte';


let test=async()=>{
	let response = await fetch('/edge/test', {
        method: 'POST',
        body: JSON.stringify({collection:'results',filter:{},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    let res= await response.json();
	console.log(res);

};

onMount(async () => {
	await test();
});


</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="row">
	<div class="col">
		<h4>/</h4>
	</div>
</div>

<style>
</style>
