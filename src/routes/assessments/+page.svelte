<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import { goto } from '$app/navigation';
    import SelectCohort from './SelectCohort.svelte';
    import IntakeBar from '$lib/_IntakeBar.svelte';
    import ConductBar from '$lib/_ConductBar.svelte';
    import AssessmentTitle from '$lib/_AssessmentTitle.svelte';
    import GradeCell from '$lib/_GradeCell.svelte';
    export let data;

    /** @type {any}*/    
    let status={
        table:[],
        std:{A:0,B:0},
        select:false,
        user:''
    };

    $:{
        if(status.select) {
            console.log('changed cohort...');
            status.select=false;
            status.table=status.table;
        }
    }

    /**
     * 
     * @param {number} gpIndex
     * @param {number} colIndex
     */
    let openEdit=(gpIndex,colIndex)=>{
        console.log(status.table[gpIndex]);
        $cohorts.assessments.edit={_id:status.table[gpIndex].cols[colIndex]._id,g:status.table[gpIndex].g,edit:status.table[gpIndex].cols[colIndex].tag.edit};
        goto('/assessments/edit/');
    };
    
    
    onMount(async () => {
        $location='/assessments';
        console.log(`${$location} mounted`);
        console.log('pupils',$pupils);
        console.log('groups',$groups);
        console.log('cohorts',$cohorts);
        status.user=data.user.name;
       
    });
    
    
    </script>
    
    <svelte:head>
        <title>Assessments</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
    <div class="row">
        <div class="col is-vertical-align">
            <SelectCohort bind:status={status}/>
        </div>
        <div class="col is-vertical-align">
            <a href={'/assessments/create/'} class="button dark">Create</a>
        </div>
    </div>

    <div class="responsive">
        {#each status.table as group,groupIndex}
        <table>
            <thead>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    {#each group.cols as col,colIndex}
                        <td>
                            <AssessmentTitle title={col.n} subtitle={col.ds}/>
                        </td>
                    {/each}
                    <td></td>
                    <td></td>
                    <td></td>
                  
                    
                </tr>
                <tr>
                    <td></td>
                    <td><span class="tag">{status.std.A}</span></td>
                    <td><span class="tag">{status.std.B}</span></td>
                    {#each group.cols as col,colIndex}
                        <td>
                            {#if col.tag.edit}
                                <a href={'#'} on:click={()=>openEdit(groupIndex,colIndex)} on:keydown={()=>openEdit(groupIndex,colIndex)} class="button clear icon-only">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </a>
                            {:else}
                                <a href={'#'} on:click={()=>openEdit(groupIndex,colIndex)} on:keydown={()=>openEdit(groupIndex,colIndex)} class="button clear icon-only">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                </a>
                            {/if}
                        </td>
                    {/each}
                    <td><span class="tag">R/S 365</span></td>
                    <td><span class="tag">R/S 7</span></td>
                    <td></td>
                    
                
                </tr>
                <tr>
                    <th>{group.g}</th>
                    <td><IntakeBar r={group.overall.A} std={status.std.A}/></td>
                    <td><IntakeBar r={group.overall.B} std={status.std.B}/></td>
                        
                    {#each group.cols as col,colIndex}
                        <td><GradeCell>{col.gd}</GradeCell></td>
                    {/each}
                    <td><ConductBar 
                        reward={group.conduct.filter((/** @type {{ reward: boolean; sc: string; ss: string; }} */ el)=>el.reward===true && el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc && el.ss===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].ss).length} 
                        sanction={group.conduct.filter((/** @type {{ reward: boolean; sc: string; ss: string; }} */ el)=>el.reward===true && el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc && el.ss===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].ss).length} 
                       
                        />
                    </td>
                    <td><ConductBar 
                        reward={group.conduct.filter((/** @type {{ past7:boolean;reward: boolean; sc: string; ss: string; }} */ el)=>el.past7===true && el.reward===true && el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc && el.ss===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].ss).length} 
                        sanction={group.conduct.filter((/** @type {{ past7:boolean;reward: boolean; sc: string; ss: string; }} */ el)=>el.past7===true && el.reward===true && el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc && el.ss===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].ss).length} 
                       
                        />
                    </td>
                    <td></td>
                    
                
                </tr>
            </thead>
            <tbody>
                {#each group.pupil as row,rowIndex}
                    <tr>
                        <td class="pupil-name">{row.sn} {row.pn}</td>
                        <td><IntakeBar r={row.overall.A} std={status.std.A}/></td>
                        <td><IntakeBar r={row.overall.B} std={status.std.B}/></td>
                        {#each row.cols as col,colIndex}
                        <td>
                            <GradeCell>{col.gd}</GradeCell>
                        </td>
                        {/each}
                        <td><ConductBar 
                            reward={row.conduct.filter((/** @type {{ reward: boolean; sc: string; ss: string; }} */ el)=>el.reward===true && el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc && el.ss===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].ss).length} 
                            sanction={row.conduct.filter((/** @type {{ reward: boolean; sc: string; ss: string; }} */ el)=>el.reward===true && el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc && el.ss===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].ss).length} 
                           
                            />
                        </td>
                        <td><ConductBar 
                            reward={row.conduct.filter((/** @type {{ past7:boolean;reward: boolean; sc: string; ss: string; }} */ el)=>el.past7===true && el.reward===true && el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc && el.ss===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].ss).length} 
                            sanction={row.conduct.filter((/** @type {{ past7:boolean;reward: boolean; sc: string; ss: string; }} */ el)=>el.past7===true && el.reward===true && el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc && el.ss===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].ss).length} 
                           
                            />
                        </td>
                        <td></td>
                    </tr>
                {/each}
            </tbody>
        </table>
        <div class="row">
            <div class="col">&nbsp;</div>
        </div>
        {/each}
    </div>


    
    <style>

.responsive {
        overflow-x:auto;
    }

    td {
        padding:0.2rem;
    }

    th {
        border-bottom: 1px solid gray;
        padding:0.2rem;
    }

   
    .pupil-name {
        min-width:15rem;
        max-width:15rem;
        overflow:hidden;
        white-space:nowrap;
    }
    
    </style>
    