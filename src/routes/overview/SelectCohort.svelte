<script>
import {cohorts,config,pupils} from '$lib/store';
import { onMount } from 'svelte';
import * as util from '$lib/util';

/** @type {any}*/
export let status;


let update=async()=>{
    let y=$cohorts.overview.years.list[$cohorts.overview.years.index];
    let h=$cohorts.overview.houses.list[$cohorts.overview.houses.index];
   
    /* adjust houses.index if necessary */
    if(!(y.lv===h.lv && y.yr===h.yr)) $cohorts.overview.houses.index=$cohorts.overview.houses.list.findIndex(el=>el.lv===y.lv && el.yr===y.yr);
    h=$cohorts.overview.houses.list[$cohorts.overview.houses.index];


    status.std.A=(y.lv==='US' || y.lv==='MS' || y.lv==='L1') ? $config.std[y.lv].A : '';
    status.std.B=(y.lv==='US' || y.lv==='MS' || y.lv==='L1') ? $config.std[y.lv].B : '';

    status.table=[];

    /* get cohort results */
    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'results',filter:{lv:y.lv,yr:y.yr},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    let results= await response.json();

    console.log(results);

    /* get cohort assessments */
    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'assessments',filter:{lv:y.lv,yr:y.yr,"tag.archive":false},projection:{}}),
        headers: {'content-type': 'application/json'}
    });

    let assessments= await response.json();
    console.log(assessments);



    for(let pupil of $pupils.filter(el=>el.lv===y.lv && el.yr===y.yr)) {
        status.table.push({
            show:true,
            select:true,
            sn:pupil.sn,
            pn:pupil.pn,
            pid:pupil.pid,
            hse:pupil.hse,
            tg:pupil.tg,
            gnd:pupil.gnd,
            overall:{A:pupil.overall.A,B:pupil.overall.B},
            cols:[]
        });
    }

    let sections=$config.overview.filter(el=>el.lv===y.lv && el.yr===y.yr);

    for(let section of sections) {
        if(section.exam) {
            console.log(`searching results for ... assessment ${section.n} ${section.dl} ${section.dt}`);
        } else {
            let from=new Date(section.from).getTime();
            let to=new Date(section.to).getTime();

            console.log(`searching results for ... assessments ${section.from} ${from} ${section.to} ${to}`);
        }
    }


    updateDisplay();
   
   


   
};

let updateDisplay=()=>{
    status.pid=[];
    for(let row of status.table) {
        if($cohorts.overview.houses.all || $cohorts.overview.houses.list[$cohorts.overview.houses.index].hse===row.hse) {
            row.show=true;
            row.select=true;
        } else {
            row.show=false;
            row.select=false;
        }
    }
    console.log(status.pid);

    status.select=true;

};



onMount(async () => {
    console.log('overview/SelectCohort.svelte mounted');
    //console.log($pupils);
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