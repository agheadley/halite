import * as auth from '$lib/auth';
import { error } from '@sveltejs/kit';

/* execute layout.js only in the browser - msal browser! */ 
export const ssr = false;

/** @type {import('./$types').LayoutLoad} */
export async function load({fetch}) {


    console.log('layout.js mounted');
    /** @type {{name:string,homeAccountId:string,tag:{teacher:boolean,admin:boolean,pupil:boolean}}} */
    let user=await auth.login();
    
    /* get $config */
    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'config',filter:{},projection:{_id:0}}),
        headers: {'content-type': 'application/json'}
    });
    let res= await response.json();
    
    /** @type {any} */
    let cfg=res[0] ? res[0] : {};
    
    
    /* get group details to find teachers, pupils */
    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'groups',filter:{},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    res= await response.json();
    
    //console.log(res);

    /* map to find pid, tid and add $config.subject HoD tid in to check for non-teaching staff */
    let p=res.map((/** @type {{ pupil: any[]; }} */ el)=>el.pupil.map((/** @type {{ pid: any; }} */ el)=>el.pid)).flat();
    let t=res.map((/** @type {{ teacher: any[]; }} */ el)=>el.teacher.map((/** @type {{ tid: any; }} */ el)=>el.tid)).flat();
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

    




    return {user:user,config:cfg,groups:res};
    
      
}
	
