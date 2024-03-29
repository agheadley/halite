<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import { goto } from '$app/navigation';
    import SelectCohort from './SelectCohort.svelte';
    import IntakeBar from '$lib/_IntakeBar.svelte';
    import ConductBar from '$lib/_ConductBar.svelte';

    /** @type {any}*/    
    let status={
        table:[],
        std:{A:0,B:0},
        select:false
    };

    $:{
        if(status.select) {
            console.log('changed cohort...');
            status.select=false;
            status.table=status.table;
        }
    }
    
    
    onMount(async () => {
        $location='/assessments';
        console.log(`${$location} mounted`);
        console.log('pupils',$pupils);
        console.log('groups',$groups);
        console.log('cohorts',$cohorts);
        
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
            <a href={'/assessments/create'} class="button dark">Create</a>
        </div>
    </div>

    <div class="responsive">
        {#each status.table as group,groupIndex}
        <table>
            <thead>
                <tr>
                    <th>{group.g}</th>
                    <th>{status.std.A}</th>
                    <th>{status.std.B}</th>
                    <th></th>
                    
                </tr>
            </thead>
            <tbody>
                {#each group.pupil as row,rowIndex}
                    <tr>
                        <td class="pupil-name">{row.sn} {row.pn}</td>
                        <td><IntakeBar result={row.overall.A} std={status.std.A}/></td>
                        <td><IntakeBar result={row.overall.B} std={status.std.B}/></td>
                        <td><ConductBar 
                            reward={row.conduct.filter((/** @type {{ reward: boolean; sc: string; ss: string; }} */ el)=>el.reward===true && el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc && el.ss===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].ss).length} 
                            sanction={row.conduct.filter((/** @type {{ reward: boolean; sc: string; ss: string; }} */ el)=>el.reward===true && el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc && el.ss===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].ss).length} 
                           
                            />
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
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
    