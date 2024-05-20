<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import SelectCohort from './SelectCohort.svelte';
    import IntakeBar from '$lib/_IntakeBar.svelte';
    
    /** @type {any}*/
    let status={
        std:{A:'',B:''},
        pid:[],
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
        $location='/overview';
        console.log(`${$location} mounted`);
        console.log('pupils',$pupils);
        console.log('cohorts',$cohorts);
        
    });
    
    
    </script>
    
    <svelte:head>
        <title>Overview</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
   

    <div class="row">
            <SelectCohort bind:status={status}/>
        <div class="col is-vertical-align">
            <a href={''} class="button dark">My Lists</a>
        </div>
    </div>
   

    <div class="responsive">
        <table>
            <thead>

            </thead>
            <tbody>
                {#each status.table as row,rowIndex}
                    {#if row.show}
                    <tr>
                        <td>{row.pid}</td>
                        <td class="pupil-name"><button class="button clear primary" on:click={()=>row.show=true}>{row.sn} {row.pn}</button></td>
                        <td>{row.tg}</td>
                        <td><IntakeBar r={row.overall.A} std={status.std.A}/></td>
                        <td><IntakeBar r={row.overall.B} std={status.std.B}/></td>


                    </tr>
                    {/if}
                {/each}
            </tbody>
        </table>

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
    