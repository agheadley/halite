import * as auth from '$lib/auth';
import { error } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import {config,groups,cohorts,pupils} from '$lib/store';

/* execute layout.js only in the browser - msal browser! */ 
export const ssr = false;

/** @type {import('./$types').PageLoad} */
export async function load({fetch}) {


    
    /** @type {{name:string,homeAccountId:string,tag:{teacher:boolean,admin:boolean,pupil:boolean}}} */
    let user=await auth.login();
    
    /** @type {any} */
    let pups=[];
    pupils.subscribe((value) => {pups=value;});
    
    /** @type {any} */
    let cfg={};
    config.subscribe((value) => {cfg=value;});
    /** @type {any} */
    let gps=[];
    groups.subscribe((value) => {gps=value;});
    /** @type {any} */
    let chts={};
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
		error(404, {message: 'User not authorised!'});
        
	}

    
    console.log(user);

    
    /* find data */

    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'assessments',filter:{"_id": { "$oid": chts.assessments.edit._id } },projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    let res= await response.json();

    //let gs=gps.filter();
    let c=chts.assessments.subjects.list[chts.assessments.subjects.index];
    let gs=gps.filter((/** @type {{ lv: any; yr: any; sc: any; ss: any; }} */ el)=>el.lv===c.lv && el.yr===c.yr && el.sc===c.sc && el.ss===c.ss);

    console.log(gs);

     
    /**@type {any} */
    let results=[];

    if(res[0]) {
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'results',filter:{aoid:res[0]._id },projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        results= await response.json();
    }

    console.log(results);
    console.log(res[0].total);
    
    /* check missing pupils against $groups data */

    for(let g of gs) {
        for(let p of g.pupil) {
            if(!results.find((/** @type {{ pid: any; }} */ el)=>el.pid===p.pid)) {
                console.log(`${p.pid} ${p.sn} ${g.g}  TO ADD ...`);

                let document={
                    aoid:res[0]._id,
                    lv:c.lv,
                    yr:c.yr,
                    sc:c.sc,
                    ss:c.ss,
                    g:g.g,
                    t:res[0].total[0]?res[0].total.map((/** @type {any} */ el)=>0):[0],
                    gd:'U',
                    pc:0,
                    scr:0,
                    fb:'',
                    pid:p.pid,
                    sn:p.sn,
                    pn:p.pn,
                    n:res[0].n,
                    dl:res[0].dl
                };

                console.log(document);

                response = await fetch('/edge/insert', {
                    method: 'POST',
                    body: JSON.stringify({collection:'results',documents:[document]}),
                    headers: {'content-type': 'application/json'}
	            });
                let ires=await response.json();
                //console.log(ires);
                if(!ires.length || ires.length!==1) error(404, {message: `Error creating missing ${document.pid} ${document.sn} `});
                else console.log(`ADDED ${ires[0]} OK`);

            } else {
                console.log(`${p.pid} ${p.sn} ${g.g}   OK`);
            }
        }
    }

    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'results',filter:{aoid:res[0]._id },projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    results= await response.json();



    console.log('/assessments/edit/+page.js',res,chts.assessments.edit);
    
    for(let g of gs ) {
        for(let p of g.pupil) {
            console.log(`${p.pid} ${p.sn} ${g.g}`);
            let r=results.find(el=>el.pid===p.pid);
            console.log(r.t,r.gd,r.aoid);
            let f=pups.find(el=>el.lv===res[0].lv && el.yr===res[0].yr && el.pid===p.pid);
            console.log(f);
        }
    }


    return {user:user,assessment:res[0]?res[0]:{},groups:gs,results:results};
    
    
}
	
