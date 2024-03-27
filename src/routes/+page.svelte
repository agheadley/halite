<script>

import { onMount } from 'svelte';
import {config,location,pupils} from '$lib/store';
import { goto } from '$app/navigation';

export let data ;


let updateGroupsContacts=async()=>{
	/* get groups and contact info */
    let response = await fetch('/edge/mis', {
        method: 'POST',
        body: JSON.stringify({cfg:$config}),
        headers: {'content-type': 'application/json'}
    });
    let res= await response.json();
    
    console.log(res);

};

let updateConduct=async()=>{

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

	//data.config.update.groups=true;

	if(data.config.update.groups || data.config.update.contacts ) await updateGroupsContacts();
	if(data.config.update.contacts) await updateConduct();
	 
	
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
		<blockquote>Checking user, updating MIS data</blockquote>
	</div>
</div>

<style>
</style>
