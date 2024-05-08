<script>

import {cohorts,groups,location,alert,config, pupils} from '$lib/store';
import { onMount } from 'svelte';
import * as util from '$lib/util';
import { goto } from '$app/navigation';
import IntakeBar from '$lib/_IntakeBar.svelte';
import Chance from '$lib/_Chance.svelte';

export let data;

/** @type {any}*/
let status = {
    table:[],
    assessment:{},
    edit:false,
    g:'',
    selected:false,
    tab:'group',    // 'group' || 'all'
    user:'',
    std:{A:'',B:''}

};

let toggleIntakeData=()=>{
    status.selected=status.selected?false:true;
    for(let g of status.table) {
        for(let p of g.pupil) p.selected=status.selected;
    }
};

/**
 * 
 * @param {number} groupIndex
 * @param {number} pupilIndex
 */
let calculate=async(groupIndex,pupilIndex)=>{
    console.log(status.table[groupIndex].pupil[pupilIndex]);
};

onMount(async () => {
        $location='/assessments';
        console.log(`/assessments/edit mounted`);
        status.user=data.user.name;
        status.table=data.table;
        status.assessment=data.assessment;
        status.edit=data.edit.edit;
        status.g=data.edit.g;

        let y=$cohorts.assessments.years.list[$cohorts.assessments.years.index];
        status.std.A=(y.lv==='US' || y.lv==='MS' || y.lv==='L1') ? $config.std[y.lv].A : '';
        status.std.B=(y.lv==='US' || y.lv==='MS' || y.lv==='L1') ? $config.std[y.lv].B : '';

        console.log(status.table);

        if($cohorts.assessments.edit.recalculate) {
            console.log('recalculating grades ....');
            $alert.msg='Recalculating grades, please wait';
            for(let g=0;g<status.table.length;g++) {
                for(let p=0;p<status.table[g].pupil.length;p++) await calculate(g,p);
            }
        }
        console.log();
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
        <a href='/assessments/manage' class="button dark">Manage</a>
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
        <th>
            <button class="button clear" on:click={toggleIntakeData}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                &nbsp;Pupil
            </button></th>
        <th></th>
        {#each status.assessment.total as col,colIndex}
            <th>/{col.t}</th>
        {/each}
        <th>&nbsp;%&nbsp;</th>
        <th>GRD</th>
        <th>Abs?</th>
        <th>Feedback</th>
    </thead>
    <tbody>
       {#each group.pupil as row,rowIndex}
        <tr>
            <td>
                <button class="button clear" on:click={()=>row.selected=row.selected?false:true}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    &nbsp;{row.pn} {row.sn}
                </button>
            </td>
            <td>{group.g}</td>
            {#each row.t as t,tIndex}
            <td>{t}</td>
            {/each}
            <td>{row.pc}</td>
            <td>{row.gd}</td>
            <td>X</td>
            <td>{row.fb}</td>
        </tr>
        {#if row.selected}
        <tr>
            <td colspan={row.t[0] ? 6+row.t.length : 6}>
                <div class="card">
                    <div class="row">
                        <div class="col">
                            <span class="tag">{status.std.A}</span>
                        </div>
                        <div class="col">
                            <span class="tag">{status.std.B}</span>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <IntakeBar r={row.overall.A} std={status.std.A}/>
                        </div>
                        <div class="col">
                            <IntakeBar r={row.overall.B} std={status.std.B}/>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <Chance grades={$config.grade.filter(el=>el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc).sort((a,b)=>b.pre-a.pre)} score={row.pre.A ? row.pre.A : 0}/>
                        </div>
                        <div class="col">
                            <Chance grades={$config.grade.filter(el=>el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc).sort((a,b)=>b.pre-a.pre)} score={row.pre.B ? row.pre.B : 0}/>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
        {/if}
        {/each}
    </tbody>
</table>
<p>&nbsp;</p>
{/if}
{/each}


<style>
    td {
        padding:0.2rem;
    }
</style>


