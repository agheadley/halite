<script>

import { onMount } from 'svelte';
import {config,location,pupils,groups,cohorts,teachers,assessments,cycles} from '$lib/store';
import { goto } from '$app/navigation';

export let data ;

/** @type {string}*/
let msg='Checking user, updating MIS data';

let updateGroupsContactsTeachers=async()=>{

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
	

	let gps=data.groups.map((/** @type {{ lv: any; yr: any; g: any; sc: any; ss: any;sl: any; pupil: any[]; }} */ el)=>({lv:el.lv,yr:el.yr,g:el.g,sc:el.sc,sl:el.sl,ss:el.ss,pid:el.pupil.map((/** @type {{ pid: any; }} */ el)=>el.pid)}));
	//console.log(gps);
	

    


	for(let g of data.groups) {
		g.pupil=g.pupil.sort((/** @type {{ sn: string; pn: string; }} */ a,/** @type {{ sn: any; pn: any; }} */ b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn) )
		for(let p of g.pupil) {
			if(!$pupils.find(el=>el.pid===p.pid && el.lv===g.lv && el.yr===g.yr)) {
				//console.log(g.yr,g.lv);
				let i=intake.find((/** @type {{ pid: any; yr: any; lv: any; }} */ el)=>el.pid===p.pid && el.yr===g.yr && el.lv===g.lv);
				//console.log(i);
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

					let gx=gps.filter((/** @type {{ pid: string | any[]; }} */ el)=>el.pid.includes(p.pid));
					gx=gx.sort((/** @type {{ sc: string; sl: string; }} */ a,/** @type {{ sc: any; sl: any; }} */ b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl));
					for(let item of gx) {
						let f=i.pre.find((/** @type {{ sc: any; ss: any; }} */ el)=>el.sc===item.sc && el.ss===item.ss);
						//if(f) pre.push({ss:f.ss,sc:f.sc,A:f.A,B:f.B});
						groups.push({g:item.g,sc:item.sc,sl:item.sl,ss:item.ss,pre:{A:f?f.A:0,B:f?f.B:0}});
					}

				} else {
					let gx=gps.filter((/** @type {{ pid: string | any[]; }} */ el)=>el.pid.includes(p.pid));
					for(let item of gx) {
						groups.push({g:item.g,sc:item.sc,sl:item.sl,ss:item.ss,pre:{A:0,B:0}});
					}
				

				}

			
				
		
				let fy=$config.year.find((/** @type {{ nc: any; }} */ el)=>el.nc===p.nc);
		
				let fm = fy ? fy.fm : -1;
		
	


				$pupils.push({
					fm:fm,
					lv:g.lv,
					yr:g.yr,
					pid:p.pid,
					id:p.id,
					sn:p.sn,
					pn:p.pn,
					hse:p.hse,
					tg:p.tg,
					gnd:p.gnd,
					overall:overall,
					groups:groups,
					base:base
				});
			}
		}
	}

	$pupils=$pupils.sort((a,b)=>b.yr-a.yr || b.lv.localeCompare(a.lv) || a.pn.localeCompare(b.pn)  );

	//console.log('**************',$pupils.find(el=>el.pid===455659));
	console.log($pupils);

};

let getAssessmentsCohorts=()=>{
	
	/* Asssessments - get distinct by ss,sc, lv, yr */
	$cohorts.assessments.subjects.list=[];
	$cohorts.assessments.subjects.index=0;
	
	for(let item of $groups) {
		if(!$cohorts.assessments.subjects.list.find((/** @type {{ yr: number; lv: string; sc: string; ss: string; }} */ el)=>el.yr===item.yr && el.lv===item.lv && el.sc===item.sc && el.ss===item.ss))
			$cohorts.assessments.subjects.list.push({yr:item.yr,lv:item.lv,ss:item.ss,sc:item.sc,sl:item.sl});	
	}
	$cohorts.assessments.subjects.list=$cohorts.assessments.subjects.list.sort((/** @type {{ sc: string; sl: string; }} */ a,/** @type {{ sc: any; sl: any; }} */ b)=>(a.sc.localeCompare(b.sc)) || (a.sl.localeCompare(b.sl)) );
    
	/* Assessments - refine for yr,lv only and add current fm*/
	let d=new Date();
    let m=d.getMonth()+1;
    let currentYr=m>$config.rollover.month ? d.getFullYear()+1:d.getFullYear();
	
	$cohorts.assessments.years.list=[];
	$cohorts.assessments.years.index=0;
	for(let item of $cohorts.assessments.subjects.list) {
	    let f=$config.year.find((/** @type {{ lv: any; x: number; }} */ el)=>el.lv===item.lv && el.x===(item.yr-currentYr));
        let fm = f ? f.fm : -1;
        if(!$cohorts.assessments.years.list.find((/** @type {{ yr: any; lv: any; }} */ el)=>el.yr==item.yr && el.lv==item.lv)) 
			$cohorts.assessments.years.list.push({lv:item.lv,yr:item.yr,fm:fm});
    }
    $cohorts.assessments.years.list=$cohorts.assessments.years.list.sort((/** @type {{ fm: number; }} */ a,/** @type {{ fm: number; }} */ b)=>b.fm-a.fm);

};

let getOverviewCohorts=()=>{

	/* Houses - get distinct by hse, lv, yr */
	
	$cohorts.overview.houses.list=[];
	$cohorts.overview.houses.index=0;
	$cohorts.overview.houses.all=false;
	for(let item of $pupils) {
		if(!$cohorts.overview.houses.list.find((/** @type {{ yr: number; lv: string; hse: string; }} */ el)=>el.yr===item.yr && el.lv===item.lv && el.hse===item.hse))
			$cohorts.overview.houses.list.push({yr:item.yr,lv:item.lv,hse:item.hse})
	}
	$cohorts.overview.houses.list=$cohorts.overview.houses.list.sort((/** @type {{ hse: string; }} */ a,/** @type {{ hse: any; }} */ b)=>a.hse.localeCompare(b.hse));
    
	/* Houses - refine for yr,lv only and add current fm */
	let d=new Date();
    let m=d.getMonth()+1;
    let currentYr=m>$config.rollover.month ? d.getFullYear()+1:d.getFullYear();
	
	$cohorts.overview.years.list=[];
	$cohorts.overview.years.index=0;
	for(let item of $cohorts.overview.houses.list) {
		let f=$config.year.find((/** @type {{ lv: any; x: number; }} */ el)=>el.lv===item.lv && el.x===(item.yr-currentYr));
        let fm = f ? f.fm : -1;
		if(!$cohorts.overview.years.list.find((/** @type {{ yr: any; lv: any; }} */ el)=>el.yr==item.yr && el.lv==item.lv))
			$cohorts.overview.years.list.push({lv:item.lv,yr:item.yr,fm:fm});
	}
	$cohorts.overview.years.list=$cohorts.overview.years.list.sort((/** @type {{ fm: number; }} */ a,/** @type {{ fm: number; }} */ b)=>b.fm-a.fm);

	$cohorts.overview.list={name:'',pid:[]};
	
};

let getOutcomeCohorts=async()=>{

	let response = await fetch('/edge/distinct', {
		method: 'POST',
		body: JSON.stringify({collection:'exams',match:{},aggregate:['yr','lv']}),
		headers: {'content-type': 'application/json'}
	});
    let res= await response.json();
	res=res.sort((/** @type {{ yr: number; lv: any; }} */ a,/** @type {{ yr: number; lv: string; }} */ b)=>b.yr-a.yr || b.lv.localeCompare(a.lv));
	$cohorts.exams.years.list=res;
	$cohorts.exams.years.index=0;
      
};

let getArchiveCohorts=async()=>{
	
	let response = await fetch('/edge/distinct', {
		method: 'POST',
		body: JSON.stringify({collection:'assessments',match:{"tag.archive":true},aggregate:['yr','lv','sc','sl','ss']}),
		headers: {'content-type': 'application/json'}
	});
    let res= await response.json();
	
	let list=res.sort((/** @type {{ sc: string; sl: string; lv: any; yr: number; }} */ a,/** @type {{ sc: any; sl: any; lv: string; yr: number; }} */ b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl) || b.lv.localeCompare(a.lv) || b.yr-a.yr);

	$cohorts.archive.years.index=0;
	$cohorts.archive.subjects.index=0;
	$cohorts.archive.years.list=[];
	$cohorts.archive.subjects.list=[];

	
    for(let item of list) {
        if(!$cohorts.archive.subjects.list.find((/** @type {{ yr: number; lv: string; sc: string; ss: string; }} */ el)=>el.yr===item.yr && el.lv===item.lv && el.sc===item.sc && el.ss===item.ss)) $cohorts.archive.subjects.list.push({yr:item.yr,lv:item.lv,sc:item.sc,sl:item.sl,ss:item.ss});
    }
    
    $cohorts.archive.years.list=[];

    for(let item of $cohorts.archive.subjects.list) {
        if(!$cohorts.archive.years.list.find((/** @type {{ yr: number; lv: string; }} */ el)=>el.yr===item.yr && el.lv===item.lv)) $cohorts.archive.years.list.push({yr:item.yr,lv:item.lv});
    }
    $cohorts.archive.years.list=$cohorts.archive.years.list.sort((/** @type {{ yr: number; lv: any; }} */ a,/** @type {{ yr: number; lv: string; }} */ b)=>b.yr-a.yr || b.lv.localeCompare(a.lv))

    console.log($cohorts.archive.years.list);
	console.log($cohorts.archive.subjects.list);
};

let getAssessments=async()=>{

    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'assessments',filter:{},projection:{_id:1,sc:1,sl:1,ss:1,dt:1,dl:1,ds:1,n:1,tag:1,lv:1,yr:1,grade:1,total:1}}),
        headers: {'content-type': 'application/json'}
    });
    $assessments= await response.json();
};

let getCycles=async()=>{
	let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'cycles',filter:{},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    let res= await response.json();
    //console.log(res);

    $cycles=res.sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>b.index-a.index);
 
};


onMount(async () => {
	$location='/';
	console.log(`${$location} mounted`);
	//console.log(data);
	$config=data.config;
	
	await getAssessments();
	await getCycles();
	
	console.log(data.user);
	
	


	//if(data.config.update.groups || data.config.update.conduct || data.config.update.contacts) await updateGroupsContactsConduct();
	if(data.config.update.groups || data.config.update.conduct || data.config.update.contacts) await updateGroupsContactsTeachers();
	
	

	msg='Building pupil data ...';
	await getPupils();
	$groups=data.groups;

	 /* add fm to groups */
	 let d=new Date();
     let m=d.getMonth()+1;
     let currentYr=m>$config.rollover.month ? d.getFullYear()+1:d.getFullYear();

	 
		for(let g of $groups) {
			
			let f=$config.year.find((/** @type {{ lv: any; x: number; }} */ el)=>el.lv===g.lv && el.x===(g.yr-currentYr));
			g.fm = f ? f.fm : -1;
			//console.log(g.lv,g.yr,g.g,g.fm);
		}

	

	// head to pupil if necessary. 
	if(data.user.tag.pupil) goto('/pupil/');



	msg='Building cohort data ...';
	
	getAssessmentsCohorts();
	getOverviewCohorts();
	
	await getOutcomeCohorts();
	await getArchiveCohorts();


	let response = await fetch('/edge/read', {
		method: 'POST',
		body: JSON.stringify({collection:'teachers',filter:{},projection:{}}),
		headers: {'content-type': 'application/json'}
	});
    $teachers= await response.json();

	//console.log('$cohorts',$cohorts);

	msg='Searching for user entry points ...';
	
	

	//testing - remove goto !
	if(data.user.tag.teacher) goto('/assessments/');

	
	
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

<div class="row">
	<div class="col">
		&nbsp;
	</div>
</div>
<div class="row">
	<div class="col">
		&nbsp;
	</div>
</div>
<div class="row">
	<div class="col">
		&nbsp;
	</div>
</div>
<div class="row">
	<div class="col">
		<h4>Written by Dr A Headley , powered by SvelteKit</h4>
	</div>
</div>
<style>
</style>
