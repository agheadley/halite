import * as auth from '$lib/auth';
import { error } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import {config,groups} from '$lib/store';

/* execute layout.js only in the browser - msal browser! */ 
export const ssr = false;

/** @type {import('./$types').PageLoad} */
export async function load() {


    
    /** @type {{name:string,homeAccountId:string,tag:{teacher:boolean,admin:boolean,pupil:boolean}}} */
    let user=await auth.login();
    
    console.log('/assessments/+page.js',user);
    
    /** @type {any} */
    let cfg={};
    config.subscribe((value) => {cfg=value;});
    /** @type {any} */
    let gps=[];
    groups.subscribe((value) => {gps=value;});


    if(!gps[0] || !cfg.subject) throw redirect(302, '/');

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

    

    return {user:user};
    
      
}
	
