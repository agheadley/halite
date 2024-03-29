<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import { goto } from '$app/navigation';
    import SelectCohort from './SelectCohort.svelte';

    /** @type {any}*/    
    let status={
        table:[],
        select:false
    };

    $:{
        if(status.select) {
            console.log('changed cohort...');
            status.select=false;
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
                    <th></th>
                    <th></th>
                    <th></th>
                    
                </tr>
            </thead>
            <tbody>
                {#each group.pupil as row,rowIndex}
                    <tr>
                        <td class="pupil-name">{row.sn} {row.pn}</td>
                        <td>{row.overall.A}</td>
                        <td>{row.overall.B}</td>
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
    