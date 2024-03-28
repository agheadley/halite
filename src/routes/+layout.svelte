<script>
	import 'chota/dist/chota.css';
	import {page} from '$app/stores';

	export let data;

</script>



<div class="app">
	<nav class="nav">
		<div class="nav-left">
		  <a class="brand brand-color" href={'/about'}>Halite</a>
		  <div class="tabs">
			{#if data.user.tag.teacher}
			<a href={'/assessments'} class={$page.url.pathname==='/assessments' ? 'active' : ''}>Assessments</a>
			<a href={'/overview'} class={$page.url.pathname==='/overview' ? 'active' : ''}>Overview</a>
			<a href={'/reports'} class={$page.url.pathname==='/reports' ? 'active' : ''}>Reports</a>
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
