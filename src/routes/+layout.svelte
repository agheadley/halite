<script>
	import 'chota/dist/chota.css';
	import {page} from '$app/stores';
	import Alert from '$lib/_Alert.svelte';
	import { goto } from '$app/navigation';

	export let data;

	let status={
		menu:'internal'	// 'internal', 'exams'
	};

	let gotoExams=()=>{
		status.menu='exams';
		goto('/results');
	};

	let gotoInternal=()=>{
		status.menu='internal';
		goto('/assessments');
	};



</script>



<div class="app">
	<Alert/>
	<nav class="nav">
		<div class="nav-left">
		  <a class="brand brand-color" href={'/about'}>OstiaH</a>
		  <div class="tabs">
			{#if data.user.tag.teacher}
			{#if status.menu==='internal'}
			<a href={'/assessments'} class={$page.url.pathname==='/assessments' ? 'active' : ''}>Assessments</a>
			<a href={'/overview'} class={$page.url.pathname==='/overview' ? 'active' : ''}>Overview</a>
			<a href={'/reports'} class={$page.url.pathname==='/reports' ? 'active' : ''}>Reports</a>
			{:else}
			<a href={'/results'} class={$page.url.pathname==='/results' ? 'active' : ''}>Results</a>
			<a href={'/totals'} class={$page.url.pathname==='/totals' ? 'active' : ''}>Totals</a>
			<a href={'/va'} class={$page.url.pathname==='/va' ? 'active' : ''}>VA</a>
			{/if}
			{/if}
			{#if data.user.tag.admin}
			<a href={'/admin'} class={$page.url.pathname==='/admin' ? 'active' : ''}>Admin</a>
			{/if}
			{#if data.user.tag.pupil}
			<a href={'/pupil'} class={$page.url.pathname==='/pupil' ? 'active' : ''}>Pupil</a>
			{/if}
			
		  </div>
		</div>
		<div class="nav-right">
			{#if data.user.tag.teacher}
			{#if status.menu==='internal'}
			<button class="button outline" on:click={gotoExams}>Exams</button>
			{:else}
			<button class="button outline" on:click={gotoInternal}>Internal</button>
			{/if}
			{/if}
		
		  <a href={'/logout'} class="button outline icon-only">
			<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
		  </a>
		</div>
	  </nav>

	<div class="container">
		<div class="row">&nbsp;</div>
		<slot />
	</div>
		
	</div>


<style>

.brand-color {
	color:#14854f;
}

</style>
