<script>

import { onMount } from 'svelte';
import {config,location,pupils} from '$lib/store';
import { goto } from '$app/navigation';

export let data ;

let updateGroups=async()=>{
	// add tg to groups
};

let updateConduct=async()=>{

};

let updateContacts=async()=>{

};


let getPupils=()=>{
	$pupils=[];
	for(let g of data.groups) {
		for(let p of g.pupil) {
			/** get intake data */

			/** get conduct data */

			if(!$pupils.find(el=>el.pid===p.pid && el.lv===g.lv && el.yr===g.yr)) {
				$pupils.push({
					lv:g.lv,
					yr:g.yr,
					pid:p.pid,
					sn:p.sn,
					pn:p.pn,
					hse:p.hse,
					tg:p.tg,
					gnd:p.gnd
				});
			}
		}
	}

};



onMount(async () => {
	$location='/';
	console.log(`${$location} mounted`);
	console.log(data);
	$config=data.config;

	if(data.config.update.groups) await updateGroups();
	if(data.config.update.conduct) await updateConduct();
	if(data.config.update.contacts) await updateContacts();
	 
	getPupils();
	console.log($pupils);

	if(data.user.tag.pupil) goto('/pupil');
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
