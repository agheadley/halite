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
            for(let x of data.assessment.total) status.total.push({t:x.t,w:x.w,n:x.n});
        } 
        if(data.assessment.grade) {
            status.grade=[];
            for(let x of data.assessment.grade) status.grade.push({gd:x.gd,pc:x.pc,scr:x.scr,active:x.active});
        } 
         
    });
    
    </script>
    
    
    <div class="row">
        <div class="col is-vertical-align">
            <fieldset>
                <!--<legend>Assessment Name (max {max})</legend>-->
                <legend>Assessment Name ({data.assessment.n})</legend>
                <p class="grouped">
                <input disabled='{!data.assessment.tag.open}' type=text size=10 bind:value={status.n} class={status.isValidName ? 'success' : 'error'} on:input={validateName}/>
                </p>
            </fieldset>
        </div>
        <div class="col is-vertical-align">
            TAG edit
        </div>
        <div class="col is-vertical-align">
            <a href='/assessments/edit' class="button outline">Close</a>
        </div>
    </div>

    <div class="row">
        <div class="col">
            <h4>Section Totals</h4>
            <table>
                <thead><tr><th>Section Name</th><th>Total</th><th>Weight</th></tr></thead>
            <tbody>
           {#each status.total as row,rowIndex}
                <tr>
                    <td>{row.n}</td>
                    <td>{row.t}</td>
                    <td>{row.w}</td>

                </tr>
           {/each}
            </tbody>
            </table>
        </div>
        <div class="col">
            <h4>Boundaries</h4>
            <table>
                <thead><tr><th>Active?</th><th>Grade</th><th>Percentage</th></tr></thead>
            <tbody>
           {#each status.grade as row,rowIndex}
                <tr>
                    <td>{row.active}</td>
                    <td>{row.gd}</td>
                    <td>{row.pc}</td>

                </tr>
           {/each}
            </tbody>
            </table>
        </div>
    </div>
    
    <style>
        td {
            padding:0.2rem;
        }
    </style>
    
    
    