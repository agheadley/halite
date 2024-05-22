<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import SelectCohort from './SelectCohort.svelte';
    import IntakeBar from '$lib/_IntakeBar.svelte';
    import List from './List.svelte';
    import Export from './Export.svelte';
    import Modal from '$lib/_Modal.svelte';
    import AssessmentTitle from '$lib/_AssessmentTitle.svelte';
    import Cell from '$lib/_Cell.svelte';
    import Pupil from '$lib/_Pupil.svelte';

    /** @type {any}*/
    export let data;

    /** @type {any}*/
    let status={
        std:{A:'',B:''},
        pid:[],
        table:[],
        select:false,
        list:false,
        user:'',
        update:false,
        download:false,
        view:'grade', /* grade/percentage */
        rag:false
    };

    /**
     * 
     * @param {number} index
     */
    let export2D=(index)=>{

    };

    $:{
        if(status.select) {
            console.log('changed cohort...');
            status.select=false;
        }

        if(status.update) {
            console.log('clearing list.');
            $cohorts.overview.list={name:'',pid:[]};
            status.update=false;
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

            
        }
       
       
    }

  

    
    onMount(async () => {
        $location='/overview';
        console.log(`${$location} mounted`);
        console.log('pupils',$pupils);
        console.log('cohorts',$cohorts);
        status.user=data.user.name;
        let f=$config.view.find((/** @type {{ context: string; }} */ el)=>el.context==='overview');
        status.rag = f ? f.rag : false;
        
    });
    
    
    </script>
    
    <svelte:head>
        <title>Overview</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>

    <Modal bind:open={status.download}>
        <Export bind:status={status}/>
    </Modal>
    
    {#if status.list}
        <List bind:status={status}/>
    {/if} <!--/list display-->
   
    {#if !status.list}
    <div class="row">
        <div class="col-6 is-vertical-align">
            <div class="row">
                {#if $cohorts.overview.list.name===''}
                <div class="col is-vertical-align">
                <SelectCohort bind:status={status}/>
                </div>
                {:else}
                <div class="col-8 is-vertical-align">
                    <h4>{$cohorts.overview.list.name}&nbsp;({$cohorts.overview.years.list[$cohorts.overview.years.index].yr} {$cohorts.overview.years.list[$cohorts.overview.years.index].lv})</h4>
                </div>
                <div class="col-4 is-vertical-align">
                    <button on:click={()=>status.update=true} class="button outline">Clear</button>
                </div>
                {/if}
            </div>
           
        </div>
        <div class="col-3 is-vertical-align">
            <div class="tabs">
                <a href={'#'} class={status.view==='grade' ? 'active' :''} on:click={()=>status.view='grade'}>Grade</a>
                <a href={'#'} class={status.view==='percentage' ? 'active' :''} on:click={()=>status.view='percentage'}>&nbsp;%&nbsp;</a>
            </div>
        </div>
        <div class="col-3 is-vertical-align">
            <button class="button dark" on:click={()=>status.list=true}>My Lists</button>
            <button on:click={()=>status.download=true} class="button icon-only outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
        </div>
    </div>
   

    {#if status.table[0]}
    <div class="responsive">
        <table>
            <thead>
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    {#each status.table[0].cols as col,colIndex}
                        <td> <AssessmentTitle title={col.title} subtitle={col.date}/></td>

                    {/each}

                </tr>
                <tr>
                    <td></td>
                    <td>Hse</td>
                    <td>Tut</td>
                    <td><span class="tag">{status.std.A}</span></td>
                    <td><span class="tag">{status.std.B}</span></td>
                    {#each status.table[0].cols as col,colIndex}
                    <td>
                    <a href={'#'} on:click={()=>export2D(colIndex)} on:keydown={()=>export2D(colIndex)} class="button clear icon-only"> 
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </a>
                </td>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each status.table as row,rowIndex}
                    {#if row.show}
                    <tr>
                       
                        <td class="pupil-name"><button class="button clear primary" on:click={()=>row.pupilShow=true}>{row.sn} {row.pn}</button></td>
                        <td>{row.hse}</td>
                        <td>{row.tg}</td>
                        <td><IntakeBar r={row.overall.A} std={status.std.A}/></td>
                        <td><IntakeBar r={row.overall.B} std={status.std.B}/></td>
                        {#each row.cols as col,colIndex}
                            <td>
                                {#if status.view==='grade'}
                                <Cell color={status.rag} residual={col.r}>{col.gd}</Cell>
                                {:else}
                                    <Cell color={false} residual={col.r}>{col.pc===null ? '' : Math.round(col.pc)}</Cell>
                                {/if}
                            
                            </td>

                        {/each}

                    </tr>
                    {#if row.pupilShow}
                    <Modal bind:open={row.pupilShow}>
                        <Pupil 
                            bind:open={row.pupilShow}

                            status={{
                                pid:row.pid,
                                sn:row.sn,
                                pn:row.pn,
                                hse:row.hse,
                                gnd:row.gnd,
                                tg:row.tg,
                                lv:$cohorts.overview.years.list[$cohorts.overview.years.index].lv,
                                yr:$cohorts.overview.years.list[$cohorts.overview.years.index].yr,
                                context:'overview'
                            }}
                            >
                        </Pupil>
                        
                    </Modal>
                    {/if}
                    {/if}
                {/each}
            </tbody>
        </table>

    </div>
    {/if}
    {/if} <!--/main display-->
    
    <style>

.responsive {
        overflow-x:auto;
    }

    td {
        padding:0.2rem;
    }

/*
    th {
        border-bottom: 1px solid gray;
        padding:0.2rem;
    }
*/
   
    .pupil-name {
        min-width:15rem;
        max-width:15rem;
        overflow:hidden;
        white-space:nowrap;
    }


    </style>
    