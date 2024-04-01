import * as auth from '$lib/auth';
import { error } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import {config,groups,cohorts} from '$lib/store';

/* execute layout.js only in the browser - msal browser! */ 
export const ssr = false;

/** @type {import('./$types').PageLoad} */
export async function load({fetch}) {


    
    /** @type {{name:string,homeAccountId:string,tag:{teacher:boolean,admin:boolean,pupil:boolean}}} */
    let user=await auth.login();
    
    
    /** @type {any} */
    let cfg={};
    config.subscribe((value) => {cfg=value;});
    /** @type {any} */
    let gps=[];
    groups.subscribe((value) => {gps=value;});
    /** @type {any} */
    let chts=[];
    cohorts.subscribe((value) => {chts=value;});
    
    console.log(gps,cfg);

    if(!gps[0] || gps[0]?.g==='' || !cfg.subject || cfg.subject[0]?.ss==='') throw redirect(302, '/');

    //console.log(cfg,gps);

    /* map to find pid, tid and add $config.subject HoD tid in to check for non-teaching staff */
    
    let p=gps.map((/** @type {{ pupil: any[]; }} */ el)=>el.pupil.map((/** @type {{ pid: any; }} */ el)=>el.pid)).flat() ;
    let t=gps.map((/** @type {{ teacher: any[]; }} */ el)=>el.teacher.map((/** @type {{ tid: any; }} */ el)=>el.tid)).flat();
    let s=cfg.subject.map((/** @type {{ tid: any; }} */ el)=>el.tid);
    t=t.concat(s);
    /* check admin */
    let a=cfg.admin.map((/** @type {{ tid: any; }} */ el)=>el.tid);
    //console.log(p,t,a,user);
    user.tag.admin = a.includes(user.name) ? true : false;
    user.tag.teacher = t.includes(user.name) || user.tag.admin ? true : false;
    user.tag.pupil = p.includes(Number(user.name)) && !user.tag.teacher ? true : false;
    
    //console.log(user);
    if (user.name=='' || (!user.tag.teacher && !user.tag.pupil)) {
		error(404, {
			message: 'User not authorised!'
		});
        
	}

    
    console.log(user);

    
    /* find data */

    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'assessments',filter:{"_id": { "$oid": chts.assessments.edit._id } },projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    let res= await response.json();
    

    /* check missing pupils against $groups */

    /* insert missing pupils */


    console.log('/assessments/edit/+page.js',res,chts.assessments.edit);
    
    return {user:user,assessment:res[0]?res[0]:{}};
    
      
}
	
