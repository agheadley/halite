<script>

    import {cohorts,config,groups} from '$lib/store';
    import { onMount } from 'svelte';
    import * as util from '$lib/util';
	import { goto } from '$app/navigation';
    
    /** @type {any}*/
    export let status;
   
    
    let update=async()=>{
        let c=$cohorts.assessments.years.list[$cohorts.assessments.years.index];
        let s=$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index];
       
        /* adjust subjects.index if necessary */
        if(!(c.lv===s.lv && c.yr===s.yr)) $cohorts.assessments.subjects.index=$cohorts.assessments.subjects.list.findIndex(el=>el.lv===c.lv && el.yr===c.yr);
       
        /* reactive for parent +page.js  $:{} */
        status.select=true;
    };

    onMount(async () => {
           console.log('SelectCohort.svelte mounted');
           await update();
    });
    
    
    </script>
    
    
        <div class="col is-vertical-align">
          
            <fieldset id="cohort" class="is-full-width">
                <legend>Cohort</legend>
                <p class="grouped">
                <select  id="cohort" bind:value={$cohorts.assessments.years.index} on:change={update}>
                    <optgroup label="Level ExamYear">
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
                    <optgroup label="Subject">
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
    
    