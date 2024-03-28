<script>

import { onMount } from 'svelte';
import {config,location,pupils,groups,cohorts} from '$lib/store';
import { goto } from '$app/navigation';

export let data ;


let updateGroupsContactsConduct=async()=>{
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
    

	let gps=data.groups.map((/** @type {{ lv: any; yr: any; g: any; sc: any; ss: any; pupil: any[]; }} */ el)=>({lv:el.lv,yr:el.yr,g:el.g,sc:el.sc,ss:el.ss,pid:el.pupil.map((/** @type {{ pid: any; }} */ el)=>el.pid)}));
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
		for(let p of g.pupil) {
			if(!$pupils.find(el=>el.pid===p.pid && el.lv===g.lv && el.yr===g.yr)) {
				let i=intake.find((/** @type {{ pid: any; yr: any; lv: any; }} */ el)=>el.pid===p.pid && el.yr===g.yr && el.lv===g.lv);
				let overall={A:0,B:0};
				/** @type {{sc:string,ss:string,A:number,B:number}[]}*/
				let pre=[];
				/** @type {{type:string,A:number,B:number}[]}*/
				let base=[];
				if(i) {
					let f=i.base.find((/** @type {{ type: string; }} */ el)=>el.type==='overall');
					//console.log(f);
					if(f) overall={A:f.A,B:f.B};
					//console.log(i);
					for(let item of i.base) base.push({type:item.type,A:item.A,B:item.B});

					let g=gps.filter((/** @type {{ pid: string | any[]; }} */ el)=>el.pid.includes(p.pid));
					//console.log(i);
					for(let item of g) {
						let f=i.pre.find((/** @type {{ sc: any; ss: any; }} */ el)=>el.sc===item.sc && el.ss===item.ss);
						if(f) pre.push({ss:f.ss,sc:f.sc,A:f.A,B:f.B});
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
					pre:pre,
					base:base,
					conduct:conductArr
				});
			}
		}
	}

};

let getCohorts=()=>{
	/*assessments:{
        years:{list:[{yr:0,lv:'',fm:0}],index:0},
        subjects:{list:[{yr:0,lv:'',ss:'',sc:'',sl:''}],index:0},
        edit:{}
    },
    overview:{
        years:{list:[{yr:0,lv:'',fm:0}],index:0},
        houses:{list:[{hse:'',lv:'',yr:0}],index:0,all:false}
    },
	*/

	/* get distinct by ss,sc, lv, yr */
	$cohorts.assessments.subjects.list=[];
	$cohorts.assessments.subjects.index=0;
	
	for(let item of $groups) {
		if(!$cohorts.assessments.subjects.list.find(el=>el.yr===item.yr && el.lv===item.lv && el.sc===item.sc && el.ss===item.ss))
			$cohorts.assessments.subjects.list.push({yr:item.yr,lv:item.lv,ss:item.ss,sc:item.sc,sl:item.sl});	
	}
	$cohorts.assessments.subjects.list=$cohorts.assessments.subjects.list.sort((a,b)=>(a.sc.localeCompare(b.sc)) || (a.sl.localeCompare(b.sl)) );
    
	/* refine for yr,lv only and add current fm*/
	let d=new Date();
    let m=d.getMonth()+1;
    let currentYr=m>$config.rollover.month ? d.getFullYear()+1:d.getFullYear();
	
	$cohorts.assessments.years.list=[];
	$cohorts.assessments.years.index=0;
	for(let item of $cohorts.assessments.subjects.list) {
	    let f=$config.year.find((/** @type {{ lv: any; x: number; }} */ el)=>el.lv===item.lv && el.x===(item.yr-currentYr));
        let fm = f ? f.fm : -1;
        if(!$cohorts.assessments.years.list.find(el=>el.yr==item.yr && el.lv==item.lv)) $cohorts.assessments.years.list.push({lv:item.lv,yr:item.yr,fm:fm});
    }
    $cohorts.assessments.years.list=$cohorts.assessments.years.list.sort((a,b)=>b.fm-a.fm);




	$cohorts.overview.houses.list=[];
	$cohorts.overview.houses.index=0;
	$cohorts.overview.houses.all=false;
	for(let item of $pupils) {
		if(!$cohorts.overview.houses.list.find(el=>el.yr===item.yr && el.lv===item.lv && el.hse===item.hse))
			$cohorts.overview.houses.list.push({yr:item.yr,lv:item.lv,hse:item.hse})
	}
    
	console.log('$cohorts',$cohorts);
};



onMount(async () => {
	$location='/';
	console.log(`${$location} mounted`);
	//console.log(data);
	$config=data.config;
	$groups=data.groups;

	if(data.config.update.groups || data.config.update.conduct || data.config.update.contacts) await updateGroupsContactsConduct();
	

	
	await getPupils();
	getCohorts();
	//console.log($pupils,$groups);


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
		<blockquote>Checking user, updating MIS data</blockquote>
	</div>
</div>

<style>
</style>
