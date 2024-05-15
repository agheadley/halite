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
    table:[],
    assessment:{},
    edit:false,
    g:'',
    selected:false,
    tab:'group',    // 'group' || 'all'
    user:'',
    std:{A:'',B:''},
    fb:{row:1,col:50},
    cells:[],

};

let toggleIntakeData=()=>{
    status.selected=status.selected?false:true;
    for(let g of status.table) {
        for(let p of g.pupil) p.selected=status.selected;
    }
};
                        
                                        
/**
 * @param {number} groupIndex
 * @param {number} rowIndex
 * @param {number} colIndex
 */
let validateScore=(groupIndex,rowIndex,colIndex)=>{
    console.log(status.assessment.total);
    console.log('score',status.table[groupIndex].pupil[rowIndex].t[colIndex]);
    if(status.table[groupIndex].pupil[rowIndex].t[colIndex]<0 || status.table[groupIndex].pupil[rowIndex].t[colIndex]===null)
        status.table[groupIndex].pupil[rowIndex].t[colIndex]=0;
    else 
        status.table[groupIndex].pupil[rowIndex].t[colIndex]=Math.round(status.table[groupIndex].pupil[rowIndex].t[colIndex]);

        status.table[groupIndex].pupil[rowIndex].t[colIndex]=status.table[groupIndex].pupil[rowIndex].t[colIndex]>status.assessment.total[colIndex].t ?
            status.assessment.total[colIndex].t : status.table[groupIndex].pupil[rowIndex].t[colIndex];
        
        console.log('score',status.table[groupIndex].pupil[rowIndex].t[colIndex]);
};

/**
 * @param {number} groupIndex
 * @param {number} rowIndex
 * @param {number} colIndex
 */
 let focusScore=async(groupIndex,rowIndex,colIndex)=>{
    console.log('editing _id',status.table[groupIndex].pupil[rowIndex]._id);
};

/**
 * @param {number} groupIndex
 * @param {number} rowIndex
 * @param {number} colIndex
 */
 let blurScore=async(groupIndex,rowIndex,colIndex)=>{
    await calculate(groupIndex,rowIndex);
 };


 /**
 * @param {number} groupIndex
 * @param {number} rowIndex
 */
 let validateGrade=async(groupIndex,rowIndex)=>{
    if(!status.assessment.grade.find((/** @type {{ gd: any; }} */ el)=>el.gd===status.table[groupIndex].pupil[rowIndex].gd)) {
        status.table[groupIndex].pupil[rowIndex].gd='';
    }
    console.log('validate',status.table[groupIndex].pupil[rowIndex].gd);
};

/**
 * @param {number} groupIndex
 * @param {number} rowIndex
 */
 let blurGrade=async(groupIndex,rowIndex)=>{
    console.log('blur',groupIndex,rowIndex);
    console.log(status.assessment.tag);
    await calculate(groupIndex,rowIndex);
 };


/**
 * 
 * @param {number} pc
 */
 let getGrade=(pc)=>{
        let grade=status.assessment.grade.filter((/** @type {{ active: any; }} */ el)=>el.active);
        //console.log(grade,pc);
        let result=grade[0] ? {gd:grade[0].gd,scr:grade[0].scr} : {gd:'U',scr:0};

        for(let item of grade.sort((/** @type {{ pc: number; }} */ a,/** @type {{ pc: number; }} */ b)=>a.pc-b.pc)) {
                if(pc>=item.pc)  result={gd:item.gd,scr:item.scr};
                //console.log(result);
        }
        return result;
};



/**
 * 
 * @param {string[]} total
 */
let getPercentage=(total)=>{
        
        //console.log('total',total);
        //console.log('status.total',status.total);
        let t=total.map(el=>parseInt(el));
        //console.log(t);
        let f=status.assessment.total.filter((/** @type {{ t: number; }} */ el)=>el.t>0);
        //console.log(f);
        let tw=f[0]?f.map((/** @type {{ w: any; }} */ el)=>el.w).reduce((/** @type {any} */ a,/** @type {any} */ v)=>a+v):0;
        //console.log(tw);
        let pc=0;
        t.forEach((v,i)=>pc+=status.assessment.total[i].t>0 && tw>0 ? (v/status.assessment.total[i].t)*(status.assessment.total[i].w/tw) : 0);
        //console.log(pc);
        return Math.round(100*100*pc)/100;
};

/**
 * 
 * @param {number} groupIndex
 * @param {number} pupilIndex
 */
let calculate=async(groupIndex,pupilIndex)=>{
    console.log(status.table[groupIndex].pupil[pupilIndex]);
    /* total array */
    let total=[];
    for(let i=0;i<status.assessment.total.length;i++) total.push(status.table[groupIndex].pupil[pupilIndex].t[i] ? status.table[groupIndex].pupil[pupilIndex].t[i]:0);
    
    /* check totals are not > paper totals, if so set to paper max */
    for(let i=0;i<status.assessment.total.length;i++) {
        //console.log(total[i],status.assessment.total[i]);
        total[i]=total[i]>status.assessment.total[i].t ? status.assessment.total[i].t : total[i];
        //console.log(total[i]);
    }
    /* set display */
    status.table[groupIndex].pupil[pupilIndex].t=total;
    
    status.table[groupIndex].pupil[pupilIndex].pc=getPercentage(total);
    let r=getGrade( status.table[groupIndex].pupil[pupilIndex].pc);
    if(!status.assessment.tag.grade) { /* calc with totals */
        status.table[groupIndex].pupil[pupilIndex].gd=r.gd;
        status.table[groupIndex].pupil[pupilIndex].scr=r.scr;
    } else { /* grade only calc */
        let f=status.assessment.grade.find((/** @type {{ gd: any; }} */ el)=>el.gd=== status.table[groupIndex].pupil[pupilIndex].gd);

        status.table[groupIndex].pupil[pupilIndex].scr=f ? f.scr : 0;
        status.table[groupIndex].pupil[pupilIndex].gd=f ? f.gd : 'X';
        status.table[groupIndex].pupil[pupilIndex].x=status.table[groupIndex].pupil[pupilIndex].gd==='X' ? true : false;

    }
   
    console.log(status.table[groupIndex].pupil[pupilIndex]);

    /* is pupil absent 'X' */
    if(status.table[groupIndex].pupil[pupilIndex].x) {
        status.table[groupIndex].pupil[pupilIndex].gd='X';
        status.table[groupIndex].pupil[pupilIndex].scr=0;
    }

    

    /* store data */
    let x=status.table[groupIndex].pupil[pupilIndex];
    let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({
                collection:'results',
                filter:{"_id":{"$oid": x._id}},
                update:{
                    t:x.t,
                    gd:x.gd,
                    scr:x.scr,
                    pc:x.pc,
                    fb:x.fb,
                    n:status.assessment.n,
                    log:`${status.user}|${util.getDate()}`
                }
            }),
		    headers: {'content-type': 'application/json'}
	    });
    let res= await response.json();
    console.log(res);

    if(res.matchedCount!==1) {
        $alert.type='error';
        $alert.msg=`Error updating result ${x.pid} ${x.sn} ${x.pn}`;
    } else  $alert.msg=`Modified ${res.modifiedCount} result`; 

};

onMount(async () => {
        $location='/assessments';
        console.log(`/assessments/edit mounted`);
        status.user=data.user.name;
        status.table=data.table;
        status.assessment=data.assessment;
        status.edit=data.edit.edit;
        status.g=data.edit.g;

        let y=$cohorts.assessments.years.list[$cohorts.assessments.years.index];
        status.std.A=(y.lv==='US' || y.lv==='MS' || y.lv==='L1') ? $config.std[y.lv].A : '';
        status.std.B=(y.lv==='US' || y.lv==='MS' || y.lv==='L1') ? $config.std[y.lv].B : '';

        console.log(status.table);

        if($cohorts.assessments.edit.recalculate) {
            console.log('recalculating grades ....');
            $alert.msg='Recalculating grades, please wait';
            for(let g=0;g<status.table.length;g++) {
                for(let p=0;p<status.table[g].pupil.length;p++) await calculate(g,p);
            }
            $cohorts.assessments.edit.recalculate=false;
        }

       
    });


/**
 * 
 * @param {string} id
 * @returns {{g:number,r:number,c:number}|null}
 */
let getCellPosition=(id)=>{
    let g=id.indexOf('G');
    let r=id.indexOf('R');
    let c=id.indexOf('C');
    if(g>=0 && r>=0 && c>=0 && r>g && c>r) {

        return {g:Number(id.substring(g+1,r)),r:Number(id.substring(r+1,c)),c:Number(id.substring(c+1))};
    } else return null;
};

// @ts-ignore
let handleKeydown=(event)=>{

    let cell=getCellPosition(document.activeElement ? document.activeElement.id : '');
    //console.log(cell);

    if(cell) {
       
            
            if (event.keyCode === 38) {
                event.preventDefault();
                if(status.table[cell.g].pupil[cell.r-1]) {
                    document.getElementById(`G${cell.g}R${cell.r-1}C${cell.c}`)?.focus();
                }

            }
            if(event.keyCode===40 || event.keyCode===13) {
                event.preventDefault();
                if(status.table[cell.g].pupil[cell.r+1]) {
                    document.getElementById(`G${cell.g}R${cell.r+1}C${cell.c}`)?.focus();
                  
                }
          
            }
            if(event.keyCode===39) {
                event.preventDefault();
                if(status.table[cell.g].pupil[cell.r].t[cell.c+1]!==undefined) {
                    document.getElementById(`G${cell.g}R${cell.r}C${cell.c+1}`)?.focus();
                }
               
               
         
            } 
                    
            if(event.keyCode===37)  {
                event.preventDefault();
                if(status.table[cell.g].pupil[cell.r].t[cell.c-1]!==undefined) {
                    document.getElementById(`G${cell.g}R${cell.r}C${cell.c-1}`)?.focus();
                }          
            }
        
    }
   
};

</script>

<svelte:window on:keydown={handleKeydown} />


<div class="row">
    <div class="col">
        <h4>
            <span class="tag">
                {$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sl}
                ({$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc})
                {$cohorts.assessments.years.list[$cohorts.assessments.years.index].lv}
                {$cohorts.assessments.years.list[$cohorts.assessments.years.index].yr}
                
            </span>
        </h4>
    </div>
    <div class="col">
        &nbsp;
    </div>
    <div class="col">
        <a href={'/assessments'} class="button outline">Close</a>
    </div>
</div>

<div class="row">
    <div class="col is-vertical-align">
        <h4>{data.assessment.n} {data.assessment.ds}</h4>
    </div>
    <div class="col is-vertical-align">
        <a href='/assessments/manage' class="button dark">Manage</a>
    </div>
    <div class="col is-vertical-align">
        <div class="tabs">
            <a class={status.tab==='group'?'active':''} on:click={()=>status.tab='group'} href={'#'}>{status.g}</a>
            <a class={status.tab==='all'?'active':''} on:click={()=>status.tab='all'} href={'#'}>ALL</a>
        </div>
    </div>
</div>



<p>{JSON.stringify(status.assessment.tag)}</p>
{#each status.table as group,groupIndex}

{#if !status.assessment.tag.grade}
{#if status.tab==='all' || (status.tab==='group' && group.g===status.g)}
<table>
    <thead>
        <th>
            <button class="button clear" on:click={toggleIntakeData}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                &nbsp;Pupil
            </button></th>
        <th></th>
        {#each status.assessment.total as col,colIndex}
            <th>/{col.t}</th>
        {/each}
        <th>&nbsp;%&nbsp;</th>
        <th>Grade</th>
        <th>Absent</th>
        <th>Feedback</th>
    </thead>
    <tbody>
       {#each group.pupil as row,rowIndex}
        <tr>
            <td>
                <button class="button clear" on:click={()=>row.selected=row.selected?false:true}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    &nbsp;{row.pn} {row.sn}
                </button>
            </td>
            <td>{group.g}</td>
            {#each row.t as t,tIndex}
            <td>
                <input id={`G${groupIndex}R${rowIndex}C${tIndex}`} tabindex={(tIndex+1)*data.table.length+rowIndex+1} disabled='{!$cohorts.assessments.edit.edit || row.x}' class={'score'} min=0 step=1 type=number bind:value={t} on:input={()=>validateScore(groupIndex,rowIndex,tIndex)} on:focus={()=>focusScore(groupIndex,rowIndex,tIndex)} on:blur={()=>blurScore(groupIndex,rowIndex,tIndex)}/>
            </td>
            {/each}
            <td>{row.pc}</td>
            <td>{row.gd}</td>
            <td><input type=checkbox bind:checked={row.x} on:change={()=>calculate(groupIndex,rowIndex)}/></td>
            <td><textarea id={`textarea-fb-${rowIndex}`} bind:value={row.fb} on:blur={()=>calculate(groupIndex,rowIndex)} /></td>
        </tr>
        {#if row.selected}
        <tr>
            <td colspan={row.t[0] ? 6+row.t.length : 6}>
                <div class="card">
                    <div class="row">
                        <div class="col">
                            <span class="tag">{status.std.A}</span>
                        </div>
                        <div class="col">
                            <span class="tag">{status.std.B}</span>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <IntakeBar r={row.overall.A} std={status.std.A}/>
                        </div>
                        <div class="col">
                            <IntakeBar r={row.overall.B} std={status.std.B}/>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <Chance grades={$config.grade.filter(el=>el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc).sort((a,b)=>b.pre-a.pre)} score={row.pre.A ? row.pre.A : 0}/>
                        </div>
                        <div class="col">
                            <Chance grades={$config.grade.filter(el=>el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc).sort((a,b)=>b.pre-a.pre)} score={row.pre.B ? row.pre.B : 0}/>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
        {/if}
        {/each}
    </tbody>
</table>
<p>&nbsp;</p>
{/if}
{/if} <!-- / assessment tag.grade===false-->


{#if status.assessment.tag.grade} 
{#if status.tab==='all' || (status.tab==='group' && group.g===status.g)}
<table>
    <thead>
        <th>
            <button class="button clear" on:click={toggleIntakeData}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                &nbsp;Pupil
            </button></th>
        <th></th>
        <th>Grade</th>
        <th>Absent</th>
    </thead>
    <tbody>
       {#each group.pupil as row,rowIndex}
        <tr>
            <td>
                <button class="button clear" on:click={()=>row.selected=row.selected?false:true}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-user"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    &nbsp;{row.pn} {row.sn}
                </button>
            </td>
            <td>{group.g}</td>
            <td><input disabled='{row.x}' type=text id={`G${groupIndex}R${rowIndex}C${0}`} bind:value={row.gd} on:input={()=>validateGrade(groupIndex,rowIndex)} on:blur={()=>blurGrade(groupIndex,rowIndex)}/></td>
            <td><input type=checkbox bind:checked={row.x} on:change={()=>calculate(groupIndex,rowIndex)}/></td>
        </tr>
        {#if row.selected}
        <tr>
            <td colspan={4}>
                <div class="card">
                    <div class="row">
                        <div class="col">
                            <span class="tag">{status.std.A}</span>
                        </div>
                        <div class="col">
                            <span class="tag">{status.std.B}</span>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <IntakeBar r={row.overall.A} std={status.std.A}/>
                        </div>
                        <div class="col">
                            <IntakeBar r={row.overall.B} std={status.std.B}/>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col">
                            <Chance grades={$config.grade.filter(el=>el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc).sort((a,b)=>b.pre-a.pre)} score={row.pre.A ? row.pre.A : 0}/>
                        </div>
                        <div class="col">
                            <Chance grades={$config.grade.filter(el=>el.sc===$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc).sort((a,b)=>b.pre-a.pre)} score={row.pre.B ? row.pre.B : 0}/>
                        </div>
                    </div>
                </div>
            </td>
        </tr>
        {/if}
        {/each}
    </tbody>
</table>

<p>&nbsp;</p>
{/if}
{/if} <!-- / assessment tag.grade===true-->



{/each}


<style>

   

    td {
        padding:0.2rem;
    }

    .score {
        width:7rem;
        max-width:7rem;
        -moz-appearance: textfield;
        appearance: textfield;
      
    }

    .score::-webkit-outer-spin-button,
      .score::-webkit-inner-spin-button {
         -webkit-appearance: none;
         margin: 0;
      }
</style>


