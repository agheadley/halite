<script>
import {cohorts,config,groups,pupils} from '$lib/store';
import { onMount } from 'svelte';
import * as util from '$lib/util';

/** @type {any}*/
export let status;


let update=async()=>{
    let y=$cohorts.assessments.years.list[$cohorts.assessments.years.index];
    let s=$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index];
   
    /* adjust subjects.index if necessary */
    if(!(y.lv===s.lv && y.yr===s.yr)) $cohorts.assessments.subjects.index=$cohorts.assessments.subjects.list.findIndex(el=>el.lv===y.lv && el.yr===y.yr);
    s=$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index];
   
};

let updateDisplay=()=>{

};

onMount(async () => {
    console.log('overview/SelectCohort.svelte mounted');
    console.log($pupils);
    await update();
});

</script>







 <div class="col is-vertical-align">
   
     <fieldset id="cohort" class="is-full-width">
         <legend>Cohort</legend>
         <p class="grouped">
         <select  id="cohort" bind:value={$cohorts.overview.years.index} on:change={update}>
             <optgroup label="Form Level ExamYear">
                     {#each $cohorts.overview.years.list as item,index}
                         <option value={index}>F{item.fm} {item.lv} {item.yr}</option>
                     {/each}
             </optgroup>
           </select>
         </p>
         </fieldset>
     
     
 </div>

 <div class="col is-vertical-align">
    <fieldset id="cohort" class="is-full-width">
          
        <legend>House</legend>
        <p class="grouped">
        <select disabled='{$cohorts.overview.houses.all}' id="house" bind:value={$cohorts.overview.houses.index} on:change={updateDisplay}>
            <optgroup label="House">
                    {#each $cohorts.overview.houses.list as item,index}
                    {#if item.yr===$cohorts.overview.years.list[$cohorts.overview.years.index].yr && item.lv===$cohorts.overview.years.list[$cohorts.overview.years.index].lv}
                        <option value={index}>{item.hse}</option>
                    {/if}
                    {/each}
            </optgroup>
          </select>
          <label for='all'>All?</label>
          <input id='add' type=checkbox bind:checked={$cohorts.overview.houses.all} on:change={updateDisplay}/>
        </p>
      
    </fieldset>
</div>