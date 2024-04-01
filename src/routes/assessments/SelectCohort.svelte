<script>
    import {cohorts,config,groups,pupils} from '$lib/store';
    import { onMount } from 'svelte';
    import * as util from '$lib/util';
	import { goto } from '$app/navigation';
	import { getConductData } from '$lib/mis';
    
    /** @type {any}*/
    export let status;
   
    
    let update=async()=>{
        let y=$cohorts.assessments.years.list[$cohorts.assessments.years.index];
        let s=$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index];
       
        /* adjust subjects.index if necessary */
        if(!(y.lv===s.lv && y.yr===s.yr)) $cohorts.assessments.subjects.index=$cohorts.assessments.subjects.list.findIndex(el=>el.lv===y.lv && el.yr===y.yr);
        s=$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index];
       
        status.std.A=(y.lv==='US' || y.lv==='MS' || y.lv==='L1') ? $config.std[y.lv].A : '';
        status.std.B=(y.lv==='US' || y.lv==='MS' || y.lv==='L1') ? $config.std[y.lv].B : '';

        
        let gps=$groups.filter(el=>el.lv===y.lv && el.yr===y.yr && el.sc===s.sc && el.ss===s.ss );
      

        /* get assessments */


        let response = await fetch('/edge/read', {
		    method: 'POST',
		    body: JSON.stringify({collection:'assessments',filter:{lv:y.lv,yr:y.yr,sc:s.sc,ss:s.ss,"tag.archive":false},projection:{}}),
		    headers: {'content-type': 'application/json'}
	    });

        let assessments= await response.json();

        /* find all teachers for editing - check groups, admin and HoDs in $config.subject*/
        /** @type {string[]}*/
        let teachers=[];
        for(let gp of gps) teachers=teachers.concat(gp.teacher.map(el=>el.tid))
        teachers=teachers.concat($config.admin.map(el=>el.tid));
        teachers=teachers.concat($config.subject.filter(el=>el.ss===s.ss && el.sc===s.sc).map(el=>el.tid));
        
        let cols=util.getAssessmentCols(assessments,teachers,status.user);
        

        let results=assessments.map((/** @type {{ pupil: any[]; _id: any; }} */ el)=>el.pupil.map((/** @type {{ pid: any; gd: any; scr: any; pc: any; }} */ cel)=>({_id:el._id,pid:cel.pid,gd:cel.gd,scr:cel.scr,pc:cel.pc}))).flat();
        //console.log('***',x);
        //let results=assessments.map((/** @type {{ _id: any; pupil: any[]; }} */ el)=>({_id:el._id,pupil:el.pupil.map((/** @type {{ pid: any; gd: any; pc: any; scr: any; }} */ el)=>({pid:el.pid,gd:el.gd,pc:el.pc,scr:el.scr}))}));
        



        /* build table */

        status.table=[];


        for(let g of gps) {
            /** @type {any}*/
            let cond=[];
            /** @type {any}*/
            let pup=[];
            for(let p of g.pupil) {
                let f=$pupils.find(el=>el.pid==p.pid);
                /**@type {any[]}*/
                let pcols=[];
                for(let col of cols) {
                    let f=results.find( (/** @type {{ _id: any; pid: number; }} */ el)=>el._id===col._id && el.pid===p.pid);
                    pcols.push(f ? {gd:f.gd,pc:f.pc,scr:f.scr} : {gd:'X',pc:0,scr:0});

                }
                if(f) cond=cond.concat(f.conduct);
                pup.push({g:g.g,pid:p.pid,sn:p.sn,pn:p.pn,tg:p.tg,hse:p.hse,cols:pcols,overall:f?f.overall:{A:0,B:0},groups:f?f.groups:[],conduct:f?f.conduct:[]})
            }
            let i=0;
            for(let col of cols) {
                let f=pup.filter((/** @type {{ cols: { gd: string; }[]; }} */ el)=>el.cols[i].gd!=='X').map((/** @type {{ cols: { scr: any; }[]; }} */ el)=>el.cols[i].scr);
                let scr=f?.length>0?f.reduce((/** @type {any} */ a,/** @type {any} */ v)=>a+v)/f.length:0;
                col.gd=f?.length>0 ? util.getClosestGrade(scr,s.sc,$config.grade):'X';
                i+=1;

            }
            let f=pup.filter((/** @type {{ overall: { A: number; }; }} */ el)=>el.overall.A>0).map((/** @type {{ overall: { A: any; }; }} */ el)=>el.overall.A);
            let a=f?.length>0?f.reduce((/** @type {any} */ a,/** @type {any} */ v)=>a+v)/f.length:0;
            f=pup.filter((/** @type {{ overall: { B: number; }; }} */ el)=>el.overall.B>0).map((/** @type {{ overall: { B: any; }; }} */ el)=>el.overall.B);
            let b=f?.length>0?f.reduce((/** @type {any} */ a,/** @type {any} */ v)=>a+v)/f.length:0;
                
            status.table.push({g:g.g,sc:g.sc,ss:g.ss,sl:g.sl,overall:{A:Math.round(10*a)/10,B:Math.round(10*b)/10},cols:cols,conduct:cond,pupil:pup});
        }

        console.log('status.table',status.table);

        /* reactive for parent +page.js  $:{} */
        status.select=true;
    };

    onMount(async () => {
           console.log('SelectCohort.svelte mounted');
           console.log($pupils);
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
    
    