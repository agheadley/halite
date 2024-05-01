<script>

import {cohorts,groups,location,alert,config, pupils} from '$lib/store';
import { onMount } from 'svelte';
import * as util from '$lib/util';
import { goto } from '$app/navigation';

export let data;

/** @type {any}*/
let status = {
    table:[],
    assessment:{},
    edit:false,
    g:'',
    tab:'group',    // 'group' || 'all'
    user:''

};

onMount(async () => {
        $location='/assessments';
        console.log(`/assessments/edit mounted`);
        status.user=data.user.name;
        status.table=data.table;
        status.assessment=data.assessment;
        status.edit=data.edit.edit;
        status.g=data.edit.g;
       
    });

</script>


<div class="row">
    <div class="col">
        <h4>
            <span class="tag">
                {$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sl}
                ({$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc})
                {$cohorts.assessments.years.list[$cohorts.assessments.years.index].lv}
                {$cohorts.assessments.years.list[$cohorts.assessments.years.index].yr}
                
            </span>
        </h4>
    </div>
    <div class="col">
        &nbsp;
    </div>
    <div class="col">
        <a href={'/assessments'} class="button outline">Close</a>
    </div>
</div>

<div class="row">
    <div class="col is-vertical-align">
        <h4>{data.assessment.n} {data.assessment.ds}</h4>
    </div>
    <div class="col is-vertical-align">
        <button class="button dark">Manage</button>
    </div>
    <div class="col is-vertical-align">
        <div class="tabs">
            <a class={status.tab==='group'?'active':''} on:click={()=>status.tab='group'} href={'#'}>{status.g}</a>
            <a class={status.tab==='all'?'active':''} on:click={()=>status.tab='all'} href={'#'}>ALL</a>
        </div>
    </div>
</div>




{#each status.table as group,groupIndex}

{#if status.tab==='all' || (status.tab==='group' && group.g===status.g)}
<table>
    <thead>
        <th></th>
        <th></th>
        {#each status.assessment.total as col,colIndex}
            <th>/{col.t}</th>
        {/each}
        <th>&nbsp;%&nbsp;</th>
        <th>GRD</th>
        <th>Abs?</th>
    </thead>
    <tbody>
       {#each group.pupil as row,rowIndex}
        <tr>
            <td>{row.pn} {row.sn}</td>
            <td>{group.g}</td>
            {#each row.t as t,tIndex}
            <td>{t}</td>
            {/each}
            <td>{row.pc}</td>
            <td>{row.gd}</td>
            <td>X</td>
        </tr>
        {/each}
    </tbody>
</table>
<p>&nbsp;</p>
{/if}
{/each}

<!--


{
    _id: ...,
    entries: [
      { x: false, y: 1 },
      { x: "hello", y: 100 },
      { x: "goodbye", y: 1000 }
    ]
  }
  The following code shows how to increment a value in the first array element that matches a query.
  
  The query matches elements in the entries array where the value of x is a string type. The update increases the y value by 33 in the first matching element.
  
  // Query for all elements in entries array where the value of x is a string
  const query = { "entries.x": { $type : "string" } };
  // On first matched element, increase value of y by 33
  const updateDocument = {
    $inc: { "entries.$.y": 33 }
  };
  // Execute the update operation
  const result = await myColl.updateOne(query, updateDocument);

-->