<script>

import { onMount } from 'svelte';
import {config,location,pupils,groups,cohorts} from '$lib/store';
import { goto } from '$app/navigation';

export let data ;

/** @type {string}*/
let msg='Checking user, updating MIS data';

let updateGroupsContactsConduct=async()=>{

	msg='Updating pupil data from the MIS ...';
	/* get groups and contact info */
    let response = await fetch('/edge/mis', {
        method: 'POST',
        body: JSON.stringify({cfg:$config}),
        headers: {'content-type': 'application/json'}
    });
    let res= await response.json();
    
    console.log(res);

};




let getPupils=async()=>{
	$pupils=[];
	
	/** get intake data */
			
	let response = await fetch('/edge/read', {
		method: 'POST',
		body: JSON.stringify({collection:'intake',filter:{},projection:{}}),
		headers: {'content-type': 'application/json'}
	});
    let intake= await response.json();
	//console.log('intake',intake);
    

	let gps=data.groups.map((/** @type {{ lv: any; yr: any; g: any; sc: any; ss: any;sl: any; pupil: any[]; }} */ el)=>({lv:el.lv,yr:el.yr,g:el.g,sc:el.sc,sl:el.sl,ss:el.ss,pid:el.pupil.map((/** @type {{ pid: any; }} */ el)=>el.pid)}));
	//console.log(gps);
	
	/** get conduct data */

	response = await fetch('/edge/read', {
		method: 'POST',
		body: JSON.stringify({collection:'conduct',filter:{},projection:{}}),
		headers: {'content-type': 'application/json'}
	});
    let conduct= await response.json();
	//console.log('conduct',conduct);
    


	for(let g of data.groups) {
		g.pupil=g.pupil.sort((/** @type {{ sn: string; pn: string; }} */ a,/** @type {{ sn: any; pn: any; }} */ b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn) )
		for(let p of g.pupil) {
			if(!$pupils.find(el=>el.pid===p.pid && el.lv===g.lv && el.yr===g.yr)) {
				let i=intake.find((/** @type {{ pid: any; yr: any; lv: any; }} */ el)=>el.pid===p.pid && el.yr===g.yr && el.lv===g.lv);
				let overall={A:0,B:0};
				/** @type {{g:string,sc:string,sl:string,ss:string,pre:{A:number,B:number}}[]}*/
				let groups=[];
				/** @type {{type:string,A:number,B:number}[]}*/
				let base=[];
				if(i) {
					let f=i.base.find((/** @type {{ type: string; }} */ el)=>el.type==='overall');
					//console.log(f);
					if(f) overall={A:f.A,B:f.B};
					//console.log(i);
					for(let item of i.base) base.push({type:item.type,A:item.A,B:item.B});

					let g=gps.filter((/** @type {{ pid: string | any[]; }} */ el)=>el.pid.includes(p.pid));
					g=g.sort((/** @type {{ sc: string; sl: string; }} */ a,/** @type {{ sc: any; sl: any; }} */ b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl));
					for(let item of g) {
						let f=i.pre.find((/** @type {{ sc: any; ss: any; }} */ el)=>el.sc===item.sc && el.ss===item.ss);
						//if(f) pre.push({ss:f.ss,sc:f.sc,A:f.A,B:f.B});
						groups.push({g:item.g,sc:item.sc,sl:item.sl,ss:item.ss,pre:{A:f?f.A:0,B:f?f.B:0}});
					}

				}
				
				/** @type {{dl:string,dt:number,past7:boolean,ss:string,sc:string,reward:boolean,id:string}[]}*/
				let conductArr=[];
				let c=conduct.find((/** @type {{ pid: any; yr: any; lv: any; }} */ el)=>el.pid===p.pid && el.yr===g.yr && el.lv===g.lv);
				if(c) {
					//console.log('coduct found',p.pid,c);
					let past7days=new Date().getTime()-(86400*7*1000);
					for(let item of c.conduct) {
						let check=item.dt>=past7days ? true : false;
						conductArr.push({dl:item.dl,dt:item.dt,past7:check,ss:item.ss,sc:item.sc,id:item.id,reward:item.reward});
					}
				}


				//console.log(conductArr);

				$pupils.push({
					lv:g.lv,
					yr:g.yr,
					pid:p.pid,
					sn:p.sn,
					pn:p.pn,
					hse:p.hse,
					tg:p.tg,
					gnd:p.gnd,
					overall:overall,
					groups:groups,
					base:base,
					conduct:conductArr
				});
			}
		}
	}

	$pupils=$pupils.sort((a,b)=>b.yr-a.yr || b.lv.localeCompare(a.lv) || a.pn.localeCompare(b.pn)  );

};

let getAssessmentsCohorts=()=>{
	
	/* Asssessments - get distinct by ss,sc, lv, yr */
	$cohorts.assessments.subjects.list=[];
	$cohorts.assessments.subjects.index=0;
	
	for(let item of $groups) {
		if(!$cohorts.assessments.subjects.list.find(el=>el.yr===item.yr && el.lv===item.lv && el.sc===item.sc && el.ss===item.ss))
			$cohorts.assessments.subjects.list.push({yr:item.yr,lv:item.lv,ss:item.ss,sc:item.sc,sl:item.sl});	
	}
	$cohorts.assessments.subjects.list=$cohorts.assessments.subjects.list.sort((a,b)=>(a.sc.localeCompare(b.sc)) || (a.sl.localeCompare(b.sl)) );
    
	/* Assessments - refine for yr,lv only and add current fm*/
	let d=new Date();
    let m=d.getMonth()+1;
    let currentYr=m>$config.rollover.month ? d.getFullYear()+1:d.getFullYear();
	
	$cohorts.assessments.years.list=[];
	$cohorts.assessments.years.index=0;
	for(let item of $cohorts.assessments.subjects.list) {
	    let f=$config.year.find((/** @type {{ lv: any; x: number; }} */ el)=>el.lv===item.lv && el.x===(item.yr-currentYr));
        let fm = f ? f.fm : -1;
        if(!$cohorts.assessments.years.list.find(el=>el.yr==item.yr && el.lv==item.lv)) 
			$cohorts.assessments.years.list.push({lv:item.lv,yr:item.yr,fm:fm});
    }
    $cohorts.assessments.years.list=$cohorts.assessments.years.list.sort((a,b)=>b.fm-a.fm);

};

let getOverviewCohorts=()=>{

	/* Houses - get distinct by hse, lv, yr */
	
	$cohorts.overview.houses.list=[];
	$cohorts.overview.houses.index=0;
	$cohorts.overview.houses.all=false;
	for(let item of $pupils) {
		if(!$cohorts.overview.houses.list.find(el=>el.yr===item.yr && el.lv===item.lv && el.hse===item.hse))
			$cohorts.overview.houses.list.push({yr:item.yr,lv:item.lv,hse:item.hse})
	}
	$cohorts.overview.houses.list=$cohorts.overview.houses.list.sort((a,b)=>a.hse.localeCompare(b.hse));
    
	/* Houses - refine for yr,lv only and add current fm */
	let d=new Date();
    let m=d.getMonth()+1;
    let currentYr=m>$config.rollover.month ? d.getFullYear()+1:d.getFullYear();
	
	$cohorts.overview.years.list=[];
	$cohorts.overview.years.index=0;
	for(let item of $cohorts.overview.houses.list) {
		let f=$config.year.find((/** @type {{ lv: any; x: number; }} */ el)=>el.lv===item.lv && el.x===(item.yr-currentYr));
        let fm = f ? f.fm : -1;
		if(!$cohorts.overview.years.list.find(el=>el.yr==item.yr && el.lv==item.lv))
			$cohorts.overview.years.list.push({lv:item.lv,yr:item.yr,fm:fm});
	}
	
};

let getOutcomeCohorts=()=>{

	/* $lib/store.js
	export let cohorts=writable({
   
		outcome:{
        years:{list:[{yr:0,lv:''}],index:0}
		},
		archive:{
			years:{list:[{yr:0,lv:''}],index:0}
		}

	});


	*/
};

let getArchiveCohorts=()=>{
	/* $lib/store.js
	export let cohorts=writable({
    	archive:{
        	years:{list:[{yr:0,lv:''}],index:0}
    	}

	});


	*/
};




onMount(async () => {
	$location='/';
	console.log(`${$location} mounted`);
	//console.log(data);
	$config=data.config;
	
	if(data.config.update.groups || data.config.update.conduct || data.config.update.contacts) await updateGroupsContactsConduct();
	

	msg='Building pupil data ...';
	await getPupils();
	$groups=data.groups;

	msg='Building cohort data ...';
	
	getAssessmentsCohorts();
	getOverviewCohorts();
	
	/* to do */
	getOutcomeCohorts();
	getArchiveCohorts();

	msg='Searching for user entry points ...';
	
	if(data.user.tag.pupil) goto('/pupil');
	if(data.user.tag.teacher) goto('/assessments');
	
});


</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<div class="row">
	<div class="col">
		<blockquote>{msg}</blockquote>
	</div>
</div>

<style>
</style>
