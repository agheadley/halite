<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import SelectCohort from './SelectCohort.svelte';
    import IntakeBar from '$lib/_IntakeBar.svelte';
    import List from './List.svelte';

    /** @type {any}*/
    export let data;

    /** @type {any}*/
    let status={
        std:{A:'',B:''},
        pid:[],
        table:[],
        select:false,
        list:false,
        user:''
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
        status.user=data.user.name;
        
    });
    
    
    </script>
    
    <svelte:head>
        <title>Overview</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
    {#if status.list}
        <List bind:status={status}/>
    {/if} <!--/list display-->
   
    {#if !status.list}
    <div class="row">
            <SelectCohort bind:status={status}/>
        <div class="col is-vertical-align">
            <button class="button dark" on:click={()=>status.list=true}>My Lists</button>
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
    {/if} <!--/main display-->
    
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
    