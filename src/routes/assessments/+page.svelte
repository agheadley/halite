<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import { goto } from '$app/navigation';
    import SelectCohort from './SelectCohort.svelte';
    import IntakeBar from '$lib/_IntakeBar.svelte';
    import ConductBar from '$lib/_ConductBar.svelte';
    import AssessmentTitle from '$lib/_AssessmentTitle.svelte';
    import Cell from '$lib/_Cell.svelte';
    import Modal from '$lib/_Modal.svelte';
    import Pupil from '$lib/_Pupil.svelte';
    import Export from './Export.svelte';

    export let data;

    /** @type {any}*/    
    let status={
        table:[],
        std:{A:'',B:''},
        select:false,
        user:'',
        view:'grade', /* grade/percentage */
        download:false,
        rag:false
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
        $cohorts.assessments.edit={_id:status.table[gpIndex].cols[colIndex]._id,g:status.table[gpIndex].g,edit:status.table[gpIndex].cols[colIndex].tag.edit,recalculate:false};
        goto('/assessments/edit/');
    };
    
    
    onMount(async () => {
        $location='/assessments';
        console.log(`${$location} mounted`);
        console.log('pupils',$pupils);
        console.log('groups',$groups);
        console.log('cohorts',$cohorts);
        status.user=data.user.name;

        let f=$config.view.find((/** @type {{ context: string; }} */ el)=>el.context==='assessments');
        status.rag = f ? f.rag : false;
       
    });
    
    
    </script>
    
    <svelte:head>
        <title>Assessments</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>

    <Modal bind:open={status.download}>
        <Export bind:status={status}/>
    </Modal>


    <div class="row">
        <div class="col-6 is-vertical-align">
            <SelectCohort bind:status={status}/>
        </div>
        <div class="col-3 is vertical-align">
            <div class="tabs">
                <a href={'#'} class={status.view==='grade' ? 'active' :''} on:click={()=>status.view='grade'}>Grade</a>
                <a href={'#'} class={status.view==='percentage' ? 'active' :''} on:click={()=>status.view='percentage'}>&nbsp;%&nbsp;</a>
            </div>
        </div>
        <div class="col-3 is-vertical-align">
            <a href={'/assessments/create/'} class="button dark">Create</a>
            <button on:click={()=>status.download=true} class="button icon-only outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
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
                    <!--
                    <td><span class="tag">R/S 365</span></td>
                    <td><span class="tag">R/S 7</span></td>
                    -->
                    <td></td>
                    
                
                </tr>
                <tr>
                    <th>{group.g}</th>
                    <td><IntakeBar r={group.overall.A} std={status.std.A}/></td>
                    <td><IntakeBar r={group.overall.B} std={status.std.B}/></td>
                        
                    {#each group.cols as col,colIndex}
                        <td>
                            {#if status.view==='grade'}
                                <Cell color={status.rag} residual={col.r}>{col.gd}</Cell>
                            {:else}
                                <Cell color={false} residual={col.r}>{col.pc===null ? '' : Math.round(col.pc)}</Cell>
                            {/if}
                           
                            <!--
                            <GradeCell color={colIndex===0 ? false :true} base={group.cols[0].gd} grade={col.gd} grades={$config.grade.filter((/** @type {{ sc: any; }} */ el)=>el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc)}>{col.gd}</GradeCell>
                                -->
                        </td>
                    {/each}
                    <!--
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
                    -->
                    <td></td>
                    
                
                </tr>
            </thead>
            <tbody>
                {#each group.pupil as row,rowIndex}
                    <tr>
                        <td class="pupil-name"><button class="button clear primary" on:click={()=>row.show=true}>{row.pn} {row.sn}</button></td>
                        <td><IntakeBar r={row.overall.A} std={status.std.A}/></td>
                        <td><IntakeBar r={row.overall.B} std={status.std.B}/></td>
                        {#each row.cols as col,colIndex}
                        <td>
                            {#if status.view==='grade'}
                            <Cell color={status.rag} residual={col.r}>{col.gd}</Cell>
                            {:else}
                                <Cell color={false} residual={col.r}>{col.pc===null ? '' : Math.round(col.pc)}</Cell>
                            {/if}
                            <!--
                            <GradeCell color={colIndex===0 ? false :true} base={row.cols[0].gd} grade={col.gd} grades={$config.grade.filter((/** @type {{ sc: any; }} */ el)=>el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc)}>{col.gd}</GradeCell>
                            -->
                        </td>
                        {/each}
                        <!--
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
                        -->
                        <td></td>
                    </tr>
                    {#if row.show}
                    <Modal bind:open={row.show}>
                        <Pupil 
                            bind:open={row.show}

                            status={{
                                pid:row.pid,
                                sn:row.sn,
                                pn:row.pn,
                                hse:row.hse,
                                gnd:row.gnd,
                                tg:row.tg,
                                lv:$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].lv,
                                yr:$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].yr,
                                context:'assessments'
                            }}
                            >
                        </Pupil>
                        
                    </Modal>
                    {/if}
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
    