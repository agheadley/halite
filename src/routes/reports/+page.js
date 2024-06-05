import * as auth from '$lib/auth';
import { error } from '@sveltejs/kit';
import { redirect } from '@sveltejs/kit';
import {config,groups,teachers} from '$lib/store';
import * as util from '$lib/util';

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
    let tchs=[];
    teachers.subscribe((value) => {tchs=value;});

    
    

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
    let reports=[];

    if(cycle.active) {
        response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',filter:{coid:cycle._id},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        res= await response.json();
        reports=res[0] ? res : [];
    }

    /* add form to groups */
     // copy groups with a filter
     let groupList=gps.filter((/** @type {{ yr: number; }} */ el)=>el.yr>0);

     /* add fm to groups */
     let d=new Date();
     let m=d.getMonth()+1;
     let currentYr=m>cfg.rollover.month ? d.getFullYear()+1:d.getFullYear();

     for(let g of groupList) {
      
         let f=cfg.year.find((/** @type {{ lv: any; x: number; }} */ el)=>el.lv===g.lv && el.x===(g.yr-currentYr));
         g.fm = f ? f.fm : -1;

     }



    /* if teacher reports check missing against groups and add any missing ones */

     /** @type {any} */
     let documents=[];


    for(let row of cycle.detail) {
        if(row.teacher) {
        let gs=groupList.filter((/** @type {{ fm: any; }} */ el)=>el.fm===row.fm);

        console.log(`teacher build F${row.fm},found ${gps.length} groups`);
        for(let gp of gs) {
           
            for(let pupil of gp.pupil) {
                for(let teacher of gp.teacher) {
                    let f=reports.find((/** @type {{ type: string; author: { type: string; tid: any; }; ss: any; sc: any; pupil: { pid: any; }; }} */ el)=>el.type==='A' && el.author.type==='teacher' && el.author.tid===teacher.tid && el.ss===gp.ss && el.sc===gp.sc && el.pupil.pid===pupil.pid);
                    if(!f) {
                        documents.push(
                            {
                                coid:cycle._id,
                                ay:cycle.ay,
                                y:cycle.y,
                                tt:cycle.tt,
                                ts:cycle.ts,
                                min:cycle.length.A.min,
                                max:cycle.length.A.max,
                                type:'A',
                                author:{type:'teacher',tid:teacher.tid,sal:teacher.sal},
                                ec:row.ec ? cfg.report.e.default : '',
                                ep:row.ep ? cfg.report.e.default : '',
                                txt:'',
                                fm:row.fm,
                                g:gp.g,
                                sc:gp.sc,
                                ss:gp.ss,
                                sl:gp.sl,
                                lv:gp.lv,
                                yr:gp.yr,
                                log:`${user.name}|${util.getDate()}`,
                                pupil:{pid:pupil.pid,sn:pupil.sn,pn:pupil.pn,hse:pupil.hse,tg:pupil.tg,gnd:pupil.gnd,id:pupil.id}
                         
                            }
                        );
                    }
                } // end teacher for   
            } // end pupil for
        } // end gs for

        }


        if(row.hod) {
            let gs=groupList.filter((/** @type {{ fm: any; }} */ el)=>el.fm===row.fm);
    
            let person={tid:'',sn:'',pn:'',sal:''};
            /* testing */
            person={tid:'AGH',sn:'H',pn:'A',sal:'Dr H'};

            console.log(`hod build F${row.fm},found ${gps.length} groups`);

            console.log(`hod build F${row.fm},found ${gps.length} groups`);
            for(let gp of gs) {
               
                let f=cfg.subject.find((/** @type {{ sc: any; ss: any; }} */ el)=>el.sc===gp.sc && el.ss===gp.ss);
                if(f) {
                    let t=tchs.find((/** @type {{ tid: any; }} */ el)=>el.tid===f.tid);
                    if(t) {
                        person.tid=t.tid;
                        person.sn=t.sn;
                        person.pn=t.pn;
                        person.sal=t.sal;
                    }
                }

                for(let pupil of gp.pupil) {
                    
                        let f=reports.find((/** @type {{ type: string; author: { type: string; tid: any; }; ss: any; sc: any; pupil: { pid: any; }; }} */ el)=>el.type==='A' && el.author.type==='hod' && el.author.tid===person.tid && el.ss===gp.ss && el.sc===gp.sc && el.pupil.pid===pupil.pid);
                        if(!f) {
                            documents.push(
                                {
                                    coid:cycle._id,
                                    ay:cycle.ay,
                                    y:cycle.y,
                                    tt:cycle.tt,
                                    ts:cycle.ts,
                                    min:cycle.length.A.min,
                                    max:cycle.length.A.max,
                                    type:'A',
                                    author:{type:'hod',tid:person.tid,sal:person.sal},
                                    ec:'',
                                    ep:'',
                                    txt:'',
                                    fm:row.fm,
                                    g:gp.g,
                                    sc:gp.sc,
                                    ss:gp.ss,
                                    sl:gp.sl,
                                    lv:gp.lv,
                                    yr:gp.yr,
                                    log:`${user.name}|${util.getDate()}`,
                                    pupil:{pid:pupil.pid,sn:pupil.sn,pn:pupil.pn,hse:pupil.hse,tg:pupil.tg,gnd:pupil.gnd,id:pupil.id}
                             
                                }
                            );
                        }
                  
                } // end pupil for
            } // end gs for
    
            }







    } // end detail for


    if(documents.length>0) {

        console.log(`+page.js loader: adding ${documents.length} missing reports`);


        let response = await fetch('/edge/insert', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',documents:documents}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();

        if(res[0]) {
           
            console.log(`${res.length} missing reports created`);
        } else {
            
            console.log(`Error inserting reports`);
        }

        reports=reports.concat(documents);

    }

   



    return {user:user,cycle:cycle,reports:reports};
    
      
}
	
