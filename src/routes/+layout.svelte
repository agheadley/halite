<script>
	import 'chota/dist/chota.css';
</script>


<div class="app">
	<nav class="nav">
		<div class="nav-left">
		  <a class="brand" href="#">Halite</a>
		  <div class="tabs">
			<a>Link 1</a>
			<a class="active">Link 2</a>
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
	</style>
