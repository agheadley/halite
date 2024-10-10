import * as auth from '$lib/auth';
import { error } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import {config,groups,teachers} from '$lib/store';

/* execute layout.js only in the browser - msal browser! */ 
export const ssr = false;

/** @type {import('./$types').PageLoad} */
export async function load() {


    
    /** @type {{name:string,homeAccountId:string,tag:{teacher:boolean,admin:boolean,pupil:boolean}}} */
    let user=await auth.login();
    
    
    /** @type {any} */
    let cfg={};
    config.subscribe((/** @type {{ any; }} */ value) => {cfg=value;});

    /** @type {any} */
    let tch=[];
    teachers.subscribe((value) => {tch=value;});
 
    
    

    /** @type {any} */
    let gps=[];
    groups.subscribe((/** @type {any} */ value) => {gps=value;});
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
    if (user.name=='' || (!user.tag.teacher)) {
		error(404, {
			message: 'User not authorised!'
		});
        
	}

    
    console.log(user);

    

    /* harvest active cycle and reports */

    /** @type {any} */
    let cycle={};
    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'cycles',filter:{active:true},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    let res= await response.json();
    cycle=res[0] ? res[0] : {};

    /** @type {any} */
    let subjects=[];

    if(cycle.active) {
        
        let response = await fetch('/edge/distinct', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',match:{coid:cycle._id,type:"A"},aggregate:['ss','sc','sl','fm','tid','yr','lv']}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        subjects=res.sort((/** @type {{ fm: number; sc: any; sl: any; }} */ a,/** @type {{ fm: number; sc: string; sl: string; }} */ b)=>b.fm-a.fm || a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl));
        
        

    }


    let staff=tch.sort((/** @type {{ sn: string; pn: string; }} */ a,/** @type {{ sn: any; pn: any; }} */ b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn));
   
    



    return {user:user,cycle:cycle,subjects:subjects,teachers:staff};
    
      
}
	
