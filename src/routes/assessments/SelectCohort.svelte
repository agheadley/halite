<script>
    import {cohorts,config,groups,pupils} from '$lib/store';
    import { onMount } from 'svelte';
    import * as util from '$lib/util';
	import { goto } from '$app/navigation';

    
    /** @type {any}*/
    export let status;
   
    
    let update=async()=>{
        let y=$cohorts.assessments.years.list[$cohorts.assessments.years.index];
        //console.log(y);
        let s=$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index];
        //console.log(s);
       
        /* adjust subjects.index if necessary */
        if(!(y.lv===s.lv && y.yr===s.yr)) $cohorts.assessments.subjects.index=$cohorts.assessments.subjects.list.findIndex((/** @type {{ lv: any; yr: any; }} */ el)=>el.lv===y.lv && el.yr===y.yr);
        s=$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index];
       
        status.std.A=(y.lv==='US' || y.lv==='MS' || y.lv==='LS') ? $config.std[y.lv].A : '';
        status.std.B=(y.lv==='US' || y.lv==='MS' || y.lv==='LS') ? $config.std[y.lv].B : '';

        
        let gps=$groups.filter(el=>el.lv===y.lv && el.yr===y.yr && el.sc===s.sc && el.ss===s.ss );
      
        //console.log(gps);

        /* get assessments */

        
        let response = await fetch('/edge/read', {
		    method: 'POST',
		    body: JSON.stringify({collection:'assessments',filter:{lv:y.lv,yr:y.yr,sc:s.sc,ss:s.ss,"tag.archive":false},projection:{}}),
		    headers: {'content-type': 'application/json'}
	    });
         let assessments= await response.json();
  

       
       
        //console.log(assessments);

        response = await fetch('/edge/read', {
		    method: 'POST',
		    body: JSON.stringify({collection:'results',filter:{lv:y.lv,yr:y.yr,sc:s.sc,ss:s.ss},projection:{}}),
		    headers: {'content-type': 'application/json'}
	    });

        let results= await response.json();
        //console.log(results);

        /* find all teachers for editing - check groups, admin and HoDs in $config.subject*/
        /** @type {string[]}*/
        let teachers=[];
        for(let gp of gps) teachers=teachers.concat(gp.teacher.map(el=>el.tid))
        teachers=teachers.concat($config.admin.map((/** @type {{ tid: any; }} */ el)=>el.tid));
        teachers=teachers.concat($config.subject.filter((/** @type {{ ss: any; sc: any; }} */ el)=>el.ss===s.ss && el.sc===s.sc).map((/** @type {{ tid: any; }} */ el)=>el.tid));
        //console.log(`${s.sc} ${s.ss} TEACHERS`,teachers);
        /** @type {any} */
        console.log('USER',status.user);
        let cols=util.getAssessmentCols(assessments,teachers,status.user);
       
        //console.log('COLS',cols);
        

        // check whether you should be able to create (are you a teacher/admin)
        let t=teachers.find(el=>el===status.user);
        status.create = t ? true : false;
        //status.create=false;

        //console.log(cols);
        
        //let results=assessments.map((/** @type {{ pupil: any[]; _id: any; }} */ el)=>el.pupil.map((/** @type {{ pid: any; gd: any; scr: any; pc: any; }} */ cel)=>({_id:el._id,pid:cel.pid,gd:cel.gd,scr:cel.scr,pc:cel.pc}))).flat();
        //console.log('***',x);
        //let results=assessments.map((/** @type {{ _id: any; pupil: any[]; }} */ el)=>({_id:el._id,pupil:el.pupil.map((/** @type {{ pid: any; gd: any; pc: any; scr: any; }} */ el)=>({pid:el.pid,gd:el.gd,pc:el.pc,scr:el.scr}))}));
        



        /* build table */

        status.table=[];


        for(let g of gps) {
            /** @type {any}*/
            let pup=[];
            for(let p of g.pupil) {
                let f=$pupils.find(el=>el.pid==p.pid);
                //console.log(f);
                /**@type {any[]}*/
                let pcols=[];
                for(let col of cols) {
                  
                    let f=results.find( (/** @type {{ aoid: any; pid: number; }} */ el)=>el.aoid===col._id && el.pid===p.pid);
                    //console.log(col,f);
                    pcols.push(f ? {gd:f.gd,pc:col.tag.grade ? null :f.pc,scr:f.scr} : {gd:'X',pc:0,scr:0,r:0});

                }
                /* populate grade residuals cf first col grade */
                let gds=$config.grade.filter((/** @type {{ sc: string; }} */ el)=>el.sc===g.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
                //console.log(g.sc,gds);
                let  s1=pcols[0] ? gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===pcols[0].gd) : -1;
                for(let col of pcols) {
                    let s2=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===col.gd); 
                    col.r = s1>-1 && s2>-1 ? s1-s2 : 0; 
                }
               
                pup.push({gnd:p.gnd,g:g.g,pid:p.pid,id:p.id,fm:f?f.fm:null,sn:p.sn,pn:p.pn,tg:p.tg,hse:p.hse,cols:pcols,overall:f?f.overall:{A:0,B:0},groups:f?f.groups:[],show:false})
            }

            let i=0;
            let gcols=[];
            
            for(let col of cols) {
                let xcol={_id:cols[i]._id,dl:cols[i].dl,ds:cols[i].ds,dt:cols[i].dt,tag:cols[i].tag,n:cols[i].n,gd:'X',pc:0,r:0};
                let f=pup.filter((/** @type {{ cols: { gd: string; }[]; }} */ el)=>el.cols[i].gd!=='X').map((/** @type {{ cols: { scr: any; }[]; }} */ el)=>el.cols[i].scr);
                let scr=f?.length>0?f.reduce((/** @type {any} */ a,/** @type {any} */ v)=>a+v)/f.length:0;
                xcol.gd=f?.length>0 ? util.getClosestGrade(scr,s.sc,$config.grade):'X';
                f=pup.filter((/** @type {{ cols: { gd: string; }[]; }} */ el)=>el.cols[i].gd!=='X').map((/** @type {{ cols: { pc: any; }[]; }} */ el)=>el.cols[i].pc);
                //console.log(g.g,i,f);
                // @ts-ignore
                xcol.pc=f?.length>0 && !cols[i].tag.grade?f.reduce((/** @type {any} */ a,/** @type {any} */ v)=>a+v)/f.length:null;
                gcols.push(xcol);
                //console.log(g.g,i,f,f.length,cols[i].pc);
                i+=1;

            }

            /* add grade residuals from first col of set averages */
            let gds=$config.grade.filter((/** @type {{ sc: string; }} */ el)=>el.sc===g.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
            let  s1=gcols[0] ? gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===gcols[0].gd) : -1;
            for(let col of gcols) {
                let s2=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===col.gd); 
                col.r = s1>-1 && s2>-1 ? s1-s2 : 0; 
            }


            let f=pup.filter((/** @type {{ overall: { A: number; }; }} */ el)=>el.overall.A>0).map((/** @type {{ overall: { A: any; }; }} */ el)=>el.overall.A);
            let a=f?.length>0?f.reduce((/** @type {any} */ a,/** @type {any} */ v)=>a+v)/f.length:0;
            f=pup.filter((/** @type {{ overall: { B: number; }; }} */ el)=>el.overall.B>0).map((/** @type {{ overall: { B: any; }; }} */ el)=>el.overall.B);
            let b=f?.length>0?f.reduce((/** @type {any} */ a,/** @type {any} */ v)=>a+v)/f.length:0;
                
            status.table.push({g:g.g,sc:g.sc,ss:g.ss,sl:g.sl,overall:{A:Math.round(10*a)/10,B:Math.round(10*b)/10},cols:gcols,pupil:pup});
        }

        console.log('status.table',status.table);

        status.table=status.table.sort((/** @type {{ g: string; }} */ a,/** @type {{ g: any; }} */ b)=>a.g.localeCompare(b.g));

        /* reactive for parent +page.js  $:{} */
        status.select=true;
    };

    onMount(async () => {
           console.log('SelectCohort.svelte mounted');
           //console.log($pupils);
           await update();
    });
    
    
    </script>
    
    
        <div class="col is-vertical-align">
          
            <fieldset id="cohort" class="is-full-width">
                <legend>Cohort</legend>
                <p class="grouped">
                <select  id="cohort" bind:value={$cohorts.assessments.years.index} on:change={update}>
                    <optgroup label="Form Level ExamYear">
                            {#each $cohorts.assessments.years.list as item,index}
                                <option value={index}>F{item.fm} {item.lv} {item.yr}</option>
                            {/each}
                    </optgroup>
                  </select>
                </p>
                </fieldset>
            
            
        </div>
        <div class="col is-vertical-align">
            <fieldset id="subject" class="is-full-width">
              
                <legend>Subject</legend>
                <p class="grouped">
                <select id="subject" bind:value={$cohorts.assessments.subjects.index} on:change={update}>
                    <optgroup label="Subject (Course)">
                            {#each $cohorts.assessments.subjects.list as item,index}
                                {#if item.yr===$cohorts.assessments.years.list[$cohorts.assessments.years.index].yr && item.lv===$cohorts.assessments.years.list[$cohorts.assessments.years.index].lv}
                                <option value={index}>{item.sl} ({item.sc})</option>
                                {/if}
                            {/each}
                    </optgroup>
                  </select>
                </p>
              
            </fieldset>
           
        </div>
    
    