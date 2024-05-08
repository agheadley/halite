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
      n:'',
      max:15,
      isValidName:true,
      tag:{open:false,parent:false,pupil:false,overview:false,exam:false,grade:false,archive:false},
      total:[],
      grade:[]
    };

    let validateName=()=>{
  
        status.isValidName=true;
        status.n =  status.n.replace(/\W+/g, " ");
        status.n =  status.n.length &&  status.n.length>status.max ?  status.n.slice(0,(status.max-1)) : status.n;
        status.isValidName=status.n==='' ? false :true;

    };
    
    let toggleIntakeData=()=>{
        status.selected=status.selected?false:true;
        for(let g of status.table) {
            for(let p of g.pupil) p.selected=status.selected;
        }
    };

    let removeRowTotal=()=>{

    };

    /**
     * 
     * @param {number} index
     */
    let validateTotal=(index)=>{

    };
    
    /**
     * 
     * @param {number} index
     */
    let blurTotal=(index)=>{

    };

    let addTotal=()=>{

    };

     /**
     * 
     * @param {number} index
     */
     let validateGrade=(index)=>{

    };

    /**
     * 
     * @param {number} index
     */
    let blurGrade=(index)=>{

    };
        
    onMount(async () => {
        $location='/assessments';
        console.log(`/assessments/edit mounted`);
        status.user=data.user.name;
        if(data.assessment.tag) {
            status.tag={
                open:data.assessment.tag.open,
                parent:data.assessment.tag.parent,
                pupil:data.assessment.tag.pupil,
                overview:data.assessment.tag.overview,
                exam:data.assessment.tag.exam,
                grade:data.assessment.tag.grade,
                archive:data.assessment.tag.archive,
            };
        }
        status.n=data.assessment.n ? data.assessment.n : '';
        if(data.assessment.total) {
            status.total=[];
            for(let x of data.assessment.total) status.total.push({valid:true,t:x.t,w:x.w,n:x.n});
        } 
        if(data.assessment.grade) {
            status.grade=[];
            for(let x of data.assessment.grade) status.grade.push({gd:x.gd,pc:x.pc,scr:x.scr,active:x.active,valid:true});
        } 
         
    });
    
    </script>
    
    
    <div class="row">
        <div class="col is-vertical-align">
            <fieldset>
                <!--<legend>Assessment Name (max {max})</legend>-->
                <legend>Assessment Name ({data.assessment.n})</legend>
                <p class="grouped">
                <input disabled='{!$cohorts.assessments.edit.edit}' type=text size=10 bind:value={status.n} class={status.isValidName ? 'success' : 'error'} on:input={validateName}/>
                </p>
            </fieldset>
        </div>
        <div class="col is-vertical-align">
            <fieldset>
                <!--<legend>Assessment Name (max {max})</legend>-->
                <legend>Viewable ?</legend>
                <p class="grouped">
                <input id="view" type=checkbox bind:checked={status.tag.open} />Open&nbsp&nbsp;
                <input id="view" type=checkbox bind:checked={status.tag.overview} />Overview&nbsp&nbsp;
                <input id="view" type=checkbox bind:checked={status.tag.pupil} />Pupil&nbsp&nbsp;
                <input id="view" type=checkbox bind:checked={status.parent} />&nbsp;Parent&nbsp&nbsp;
            </fieldset>
        </div>
        <div class="col is-vertical-align">
            <a href='/assessments/edit' class="button outline">Close</a>
        </div>
    </div>

    <div class="row">
        <div class="col">
            <h4>Section Totals</h4>
            <div class="responsive">
            <table>
                <thead><tr><th></th><th>Section Name</th><th>Total</th><th>Weight</th></tr></thead>
            <tbody>
           {#each status.total as row,rowIndex}
                <tr>
                    <td>
                    {#if status.total.length && rowIndex===status.total.length-1}
                    <button class="button error icon-only" on:click={removeRowTotal}>         
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                    {/if}
                    </td>
                    <td><input disabled='{! $cohorts.assessments.edit.edit}'  type=text bind:value={row.n} class={row.valid ? 'success' : 'error'} on:blur={()=>blurTotal(rowIndex)} on:input={()=>validateTotal(rowIndex)}/></td>
                    <td><input disabled='{! $cohorts.assessments.edit.edit}'  type=number bind:value={row.t} class={row.valid ? 'success' : 'error'} on:blur={()=>blurTotal(rowIndex)} on:input={()=>validateTotal(rowIndex)}/></td>
                    <td><input disabled='{! $cohorts.assessments.edit.edit}'  type=number bind:value={row.w} class={row.valid ? 'success' : 'error'} on:blur={()=>blurTotal(rowIndex)} on:input={()=>validateTotal(rowIndex)}/></td>
                   

                </tr>
           {/each}
           <tr>
            <td colspan=2>
                <button class="button dark icon-only" on:click={addTotal}>         
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
            </td>
           </tr>
            </tbody>
            </table>
            </div>
        </div>
        <div class="col">
            <h4>Boundaries</h4>
            <div class="responsive">
            <table>
                <thead><tr><th>Active?</th><th>Grade</th><th>Percentage</th></tr></thead>
            <tbody>
           {#each status.grade as row,rowIndex}
                <tr>
                    <td><input type=checkbox bind:checked={row.active}/></td>
                    <th>{row.gd}</th>
                    <td><input disabled='{! $cohorts.assessments.edit.edit}'  type=number bind:value={row.pc} class={row.valid ? 'success' : 'error'} on:blur={()=>blurGrade(rowIndex)} on:input={()=>validateGrade(rowIndex)}/></td>
                </tr>
           {/each}
            </tbody>
            </table>
            </div>
        </div>
    </div>
    
    <style>
        td {
            padding:0.2rem;
        }

        .responsive {
            overflow-x:auto;
        }
    </style>
    
    
    