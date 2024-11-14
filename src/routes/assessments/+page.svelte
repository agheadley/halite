<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts,alert} from '$lib/store';
    import { goto } from '$app/navigation';
    import SelectCohort from './SelectCohort.svelte';
    import IntakeBar from '$lib/_IntakeBar.svelte';
    import AssessmentTitle from '$lib/_AssessmentTitle.svelte';
    import Cell from '$lib/_Cell.svelte';
    import Modal from '$lib/_Modal.svelte';
    import Pupil from '$lib/_Pupil.svelte';
    import Export from './Export.svelte';
    import * as util from '$lib/util';

    export let data;

    /** @type {any}*/    
    let status={
        table:[],
        std:{A:'',B:''},
        select:false,
        user:'',
        view:'grade', /* grade/percentage */
        download:false,
        rag:false,
        create:false
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

    /**
     * 
     * @param {number} colIndex
     * @param {number} groupIndex
     */
    let unlock=async(colIndex,groupIndex)=>{
        console.log(status.table[groupIndex].cols[colIndex]);

       
        let t=status.table[groupIndex].cols[colIndex].tag;
        let tag = {open:true,grade:t.grade,overview:false,exam:t.exam,pupil:false,pupiledit:t.pupiledit,parent:false,archive:t.archive};
        tag.open=true;

        console.log('opening',status.table[groupIndex].cols[colIndex]._id,tag);
        
        let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({collection:'assessments',filter:{"_id":{"$oid": status.table[groupIndex].cols[colIndex]._id}},update:{tag:tag,log:`${status.user}|${util.getDateTime()}`}}),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);

        if(res.matchedCount===1 && res.modifiedCount===1) {
            $alert.msg=`Unlocked`;
            status.table[groupIndex].cols[colIndex].tag.open=true;     
        } else {
            $alert.type='error';
            $alert.msg=`Error unlocking!`;
        }
            
    };
    
    //{dt:{$lt:1729382400000},"tag.open":true,"tag.archive":false,"tag.exam":false}
    
    onMount(async () => {
        $location='/assessments';
        console.log(`${$location} mounted`);
        //console.log('pupils',$pupils);
        //console.log('groups',$groups);
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
        <div class="col-2 is vertical-align">
            <div class="tabs">
                <a href={'#'} class={status.view==='grade' ? 'active' :''} on:click={()=>status.view='grade'}>Grade</a>
                <a href={'#'} class={status.view==='percentage' ? 'active' :''} on:click={()=>status.view='percentage'}>&nbsp;%&nbsp;</a>
            </div>
        </div>
        <div class="col-4 is-vertical-align">
            {#if status.create}
            <a href={'/assessments/create/'} class="button dark">Create</a>
            {:else}
            <button class="button dark" disabled>Create</button>
            {/if}
            <button on:click={()=>status.download=true} class="button icon-only outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
            <a href={'/archive'} class="button outline">Archive</a>
        </div>
    </div>

    <div class="responsive">
        {#each status.table as group,groupIndex}
        <table>
            <thead>
                {#if data.user.tag.admin}
                <tr>
                    <td></td>
                    <td></td>
                    <td></td>
                    {#each group.cols as col,colIndex}
                        <td>
                            {#if !col.tag.open}
                                <button class="button icon-only clear" on:click={()=>unlock(colIndex,groupIndex)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-unlock"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                                </button>
                            {/if}
                        </td>
                    {/each}
                    <td></td>
                    <td></td>
                    <td></td>
                  
                    
                </tr>
                {/if}
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
                           
                         
                        </td>
                    {/each}
                  
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
                          
                        </td>
                        {/each}
                       
                        <td></td>
                    </tr>
                    {#if row.show}
                    <Modal bind:open={row.show}>
                        <Pupil pupil={{context:'overview',user:status.user,pid:row.pid}}/>
                       
                        <div class="row">
                            <div class="col is-right">
                                <button class="button outline" on:click={()=>row.show=false}>Close</button>
                            </div>
                        </div>
                        
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
    