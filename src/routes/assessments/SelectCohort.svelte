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
       

        let gps=$groups.filter(el=>el.lv===y.lv && el.yr===y.yr && el.sc===s.sc && el.ss===s.ss );
      
        status.table=[];

        for(let g of gps) {
            /** @type {any}*/
            let pup=[];
            for(let p of g.pupil) {
                let f=$pupils.find(el=>el.pid==p.pid);
                pup.push({g:g.g,pid:p.pid,sn:p.sn,pn:p.pn,tg:p.tg,hse:p.hse,cols:[],overall:f?f.overall:{A:0,B:0},groups:f?f.groups:[],conduct:f?f.conduct:[]})
            }
            status.table.push({g:g.g,sc:g.sc,ss:g.ss,sl:g.sl,cols:[],conduct:[],pupil:pup});
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
    
    