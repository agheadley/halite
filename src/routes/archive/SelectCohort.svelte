<script>
import { onMount } from 'svelte';
import {cohorts,assessments} from '$lib/store';


let updateSubjects=async()=>{

    let y=$cohorts.archive.years.list[$cohorts.archive.years.index];
    
    let s=$cohorts.archive.subjects.list[$cohorts.archive.subjects.index];
       
       
    /* adjust subjects.index if necessary */
    if(!(y.lv===s.lv && y.yr===s.yr)) $cohorts.archive.subjects.index=$cohorts.archive.subjects.list.findIndex((/** @type {{ lv: any; yr: any; }} */ el)=>el.lv===y.lv && el.yr===y.yr);
    s=$cohorts.archive.subjects.list[$cohorts.archive.subjects.index];

    await updateAssessments();
};


let updateAssessments=async()=>{
    let s=$cohorts.archive.subjects.list[$cohorts.archive.subjects.index];
    let as=$assessments.filter(el=>el.tag.archive===true && el.yr===s.yr && el.lv===s.lv && el.sc===s.sc && el.ss===s.ss).sort((a,b)=>a.dt-b.dt);
    console.log(as);

    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'results',filter:{lv:s.lv,yr:s.yr,sc:s.sc,ss:s.ss},projection:{}}),
        headers: {'content-type': 'application/json'}
    });

    let results= await response.json();
    console.log(results);

    let ps=[];
    for(let item of results) {
        
    }


    


};


onMount(async () => {
    await updateSubjects();
});


</script>



<div class="col is-vertical-align">
          
    <fieldset id="cohort" class="is-full-width">
        <legend>Cohort</legend>
        <p class="grouped">
        <select  id="cohort" bind:value={$cohorts.archive.years.index} on:change={updateSubjects}>
            <optgroup label="Form Level ExamYear">
                    {#each $cohorts.archive.years.list as item,index}
                        <option value={index}> {item.lv} {item.yr}</option>
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
        <select id="subject" bind:value={$cohorts.archive.subjects.index} on:change={updateAssessments}>
            <optgroup label="Subject (Course)">
                    {#each $cohorts.archive.subjects.list as item,index}
                        {#if item.yr===$cohorts.archive.years.list[$cohorts.archive.years.index].yr && item.lv===$cohorts.archive.years.list[$cohorts.archive.years.index].lv}
                        <option value={index}>{item.sl} ({item.sc})</option>
                        {/if}
                    {/each}
            </optgroup>
          </select>
        </p>
      
    </fieldset>
   
</div>