<script>

    import {cohorts,groups,location,alert,config, pupils} from '$lib/store';
    import { onMount } from 'svelte';
    import * as util from '$lib/util';
    import { goto } from '$app/navigation';
    import IntakeBar from '$lib/_IntakeBar.svelte';
    import Modal from '$lib/_Modal.svelte';
    
    
    export let data;
    
    /** @type {any}*/
    let status = {
      n:'',
      max:15,
      validName:true,
      tag:{open:false,parent:false,pupil:false,overview:false,exam:false,grade:false,archive:false},
      total:[],
      grade:[],
      isTotalRemove:false,
      isSave:false,
      valid:true,
      delete:false,
      deleteText:''
    };

    let validateName=()=>{
  
        status.validName=true;
        status.n =  status.n.replace(/\W+/g, " ");
        status.n =  status.n.length &&  status.n.length>status.max ?  status.n.slice(0,(status.max-1)) : status.n;
        status.validName=status.n==='' ? false :true;

    };
    
    let toggleIntakeData=()=>{
        status.selected=status.selected?false:true;
        for(let g of status.table) {
            for(let p of g.pupil) p.selected=status.selected;
        }
    };

    let removeRowTotal=()=>{
        status.total.pop();
        status.isTotalRemove=false;
        status.total=status.total;
    };

    /**
     * 
     * @param {number} index
     */
    let validateTotal=(index)=>{

        status.total[index].n = status.total[index].n.replace(/\W+/g, " ");
        status.total[index].n = status.total[index].n.length && status.total[index].n.length>status.max ? status.total[index].nn.slice(0,(status.max-1)) : status.total[index].n;
        status.total[index].n = status.total[index].n==='' ?  status.total.length ? `P${index+1}`: 'Px' : status.total[index].n;

        let x=status.total[index].t>=0 ? status.total[index].t : 0;
        status.total[index].t=Math.round(x);
        x=status.total[index].w>=0 ? status.total[index].w : 0;
        status.total[index].w=Math.round(x);

    };
    
 

    let addTotal=()=>{
        console.log('add total record');
        status.total.push({valid:true,t:0,w:0,n:status.total.length?`P${status.total.length+1}`:'Px'});
        status.total=status.total;
    };

     /**
     * 
     * @param {number} index
     */
     let validateGrade=(index)=>{
        let x=status.grade[index].pc>=0 ? status.grade[index].pc : 0;
        x = x>100 ? 100 : x;
        status.grade[index].pc=Math.round(100*x)/100;

       
        for(let item of status.grade) item.valid=true;
    
        let currentValue=100;
        for(let i=0;i<status.grade.length;i++) {
            if(i>0) {
                if(status.grade[i].pc >= currentValue) status.grade[i].valid=false;
            } else  if(status.grade[i].pc > currentValue) status.grade[i].valid=false;
        
            currentValue= status.grade[i].pc;

        }

    
       
    };

    let changeStatus=async()=>{
        console.log('Changing live pupils/overview status to: ',status.tag.overview);

        //console.log('saving ...',$cohorts.assessments.edit);
        //console.log(status.total,status.grade,status.n);
        //status.isSave=false;

        status.tag.pupil=status.tag.overview;
        
        let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({collection:'assessments',filter:{"_id":{"$oid": $cohorts.assessments.edit._id}},update:{n:status.n,grade:status.grade,total:status.total,tag:status.tag,log:`${status.user}|${util.getDateTime()}`}}),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);

        if(res.matchedCount===1 && res.modifiedCount===1) {
            $alert.msg=`Live status updated`;
           
        } else {
            $alert.type='error';
            $alert.msg=`Error updating live status, reload and check.`;
        }
    };


    let openSave=()=>{
      

        status.valid=true;
        for(let x of status.grade) status.valid = x.valid ? status.valid : false;
        status.valid = status.validName ? status.valid : false;


        status.tag.pupil=status.tag.overview ? true : false;
        

        status.isSave=true;
       
    };

    let save=async()=>{
        console.log('saving ...',$cohorts.assessments.edit);
        console.log(status.total,status.grade,status.n);
        status.isSave=false;

        let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({collection:'assessments',filter:{"_id":{"$oid": $cohorts.assessments.edit._id}},update:{n:status.n,grade:status.grade,total:status.total,tag:status.tag,log:`${status.user}|${util.getDateTime()}`}}),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);

        if(res.matchedCount===1 && res.modifiedCount===1) {
            $alert.msg=`Assesment updated`;
            $cohorts.assessments.edit.recalculate=true;
            goto('/assessments/edit');
        } else {
            $alert.type='error';
            $alert.msg=`Error updating assessment, reload and check.`;
        }
       

         
    };


    let remove=async()=>{
        console.log('deleting assessments document and associated results documents');
        console.log(data.assessment);

          
        let response = await fetch('/edge/delete', {
		    method: 'POST',
		    body: JSON.stringify({collection:'assessments',filter:{"_id": { "$oid": data.assessment._id } }}),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);
        if(res.deletedCount && res.deletedCount===1 ) {
            $alert.msg=`Deleted assessment`;  
            let response = await fetch('/edge/delete', {
                method: 'POST',
                body: JSON.stringify({collection:'results',filter:{"aoid":data.assessment._id}}),
                headers: {'content-type': 'application/json'}
	        });
            let res2= await response.json();
            if(res2.deletedCount && res2.deletedCount>0 ) {
                $alert.msg=`Deleted assessment & ${res2.deletedCount} results records`;
                goto('/assessments');
            } else {
                $alert.type='error';
                $alert.msg=`Assessment deleted. Error deleting results`;
            }
        } else {
            $alert.type='error';
            $alert.msg=`Error deleting assesment`;
        }
        status.delete=false;


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
                pupiledit:data.assessment.tag.pupiledit
            };
        }
        status.n=data.assessment.n ? data.assessment.n : '';
        if(data.assessment.total) {
            status.total=[];
            for(let x of data.assessment.total) status.total.push({t:x.t,w:x.w,n:x.n});
        } 
        if(data.assessment.grade) {
            status.grade=[];
            for(let x of data.assessment.grade) status.grade.push({gd:x.gd,pc:x.pc,scr:x.scr,active:x.active,valid:true});
        } 
         
    });
    
    </script>
    
    {#if status.delete}
        <Modal bind:open={status.delete}>
            <header>
         
                <h4>Delete All Data  ?</h4>
        
        </header>
        <p><span class="tag bg-error text-white">Warning this can't be undone!</span></p>
        <p>Type <span class="bold">DELETE {data.assessment.n}</span> to confirm</p>
        <p><input type=text bind:value={status.deleteText} class={status.deleteText===`DELETE ${data.assessment.n}` ? 'success' : 'error'}/></p>
        <footer>
                <button disabled={status.deleteText!==`DELETE ${data.assessment.n}`}  class="button error" on:click={remove}>Delete</button>
         
                <button class="button outline" on:click={()=>status.delete=false}>Cancel</button>
        </footer>
        </Modal>
    {/if}

    {#if status.isSave}
    <Modal bind:open={status.isSave}>
        <header>
         
                <h4>{data.assessment.sl} ({data.assessment.sc}) {status.n} {data.assessment.ds}</h4>
        
        </header>
        <p>
                {#if !status.valid}
                <span class="tag bg-error text-white">
                    Please correct grade / assessment name errors
                </span>
                {:else}
                <span class="tag text-success">
                    Grades will be recalculated
                </span>
                {/if}
        </p>
        <p>EDITABLE ? {status.tag.open?'YES':'NO'}</p>
        <p>VISIBLE IN OVERVIEW ? {status.tag.overview?'YES':'NO'}</p>
        <p>PUPIL VIEWBALE ? {status.tag.overview?'YES':'NO'}</p>
        <p>PARENT VIEWABLE ?  {status.tag.parent?'YES':'NO'}</p>
        <footer>
                <button disabled='{!$cohorts.assessments.edit.edit || !status.valid}' class="button error" on:click={save}>Save</button>
         
                <button class="button outline" on:click={()=>status.isSave=false}>Cancel</button>
        </footer>
    </Modal>
    {/if}

    {#if status.isTotalRemove}
    <Modal bind:open={status.isTotalRemove}>
        <div class="row">
            <div class="col">
                <h4>Delete Section?</h4>
            </div>
        </div>
      
        <div class="row">
            <div class="col">
                <button disabled='{!$cohorts.assessments.edit.edit}' class="button error" on:click={removeRowTotal}>Delete</button>
            </div>
          
            <div class="col is-right">
                <button class="button outline" on:click={()=>status.isTotalRemove=false}>Cancel</button>
            </div>
        </div>
    </Modal>
    {/if}
    
    <div class="row">
        <div class="col is-vertical-align">
            <fieldset>
                <!--<legend>Assessment Name (max {max})</legend>-->
                <legend>Assessment Name ({data.assessment.n})</legend>
                <p class="grouped">
                <input disabled='{!$cohorts.assessments.edit.edit || status.tag.exam}' type=text size=10 bind:value={status.n} class={status.validName ? 'success' : 'error'} on:input={validateName}/>
                </p>
            </fieldset>
          
        </div>
      
        <div class="col is-vertical-align">
            <fieldset>
                <!--<legend>Assessment Name (max {max})</legend>-->
                <legend>Viewable ?</legend>
                <p class="grouped">
                <input id="view" disabled={status.tag.exam}  type=checkbox bind:checked={status.tag.overview} on:change={changeStatus} />Live to Overview/Pupils ?&nbsp&nbsp;
            </fieldset>
        </div>
        <div class="col is-vertical-align">
            <button class="button error" disabled='{!$cohorts.assessments.edit.edit || data.assessment.tag.exam}' on:click={()=>status.delete=true}>Delete</button>&nbsp;
            <a href='/assessments/edit' class="button outline">Close</a>
        </div>
    </div>

    <div class="row">
        <div class="col">
            <h4>Section/Totals {data.assessment.n} {data.assessment.ds}</h4>
            <div class="responsive">
            <table>
                <thead><tr><th></th><th>Section Name</th><th>Total</th><th>Weight</th></tr></thead>
            <tbody>
           {#each status.total as row,rowIndex}
                <tr>
                    <td>
                    {#if status.total.length && rowIndex===status.total.length-1}
                    <button disabled='{!$cohorts.assessments.edit.edit || status.total.length<2}' class="button error icon-only" on:click={()=>status.isTotalRemove=true}>         
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                    {/if}
                    </td>
                    <td><input disabled='{! $cohorts.assessments.edit.edit}'  type=text bind:value={row.n}  on:input={()=>validateTotal(rowIndex)}/></td>
                    <td><input disabled='{! $cohorts.assessments.edit.edit}'  type=number min=0 step=1 bind:value={row.t} on:input={()=>validateTotal(rowIndex)}/></td>
                    <td><input disabled='{! $cohorts.assessments.edit.edit}'  type=number min=0 step=1 bind:value={row.w}  on:input={()=>validateTotal(rowIndex)}/></td>
                   

                </tr>
           {/each}
           <tr>
            <td colspan=2>
                <button disabled='{!$cohorts.assessments.edit.edit}' class="button dark icon-only" on:click={addTotal}>         
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                </button>
            </td>
           </tr>
            </tbody>
            </table>
            </div>

            <div>&nbsp;</div>
            <div>
                <button on:click={openSave} disabled='{!$cohorts.assessments.edit.edit}' class="button error">Save / Calculate</button>
            </div>

        </div>
        <div class="col">
            <h4>Boundaries {data.assessment.n} {data.assessment.ds}</h4>
            <div class="responsive">
            <table>
                <thead><tr><th>Active?</th><th>Grade</th><th>Percentage</th></tr></thead>
            <tbody>
           {#each status.grade as row,rowIndex}
                <tr>
                    <td><input disabled='{!$cohorts.assessments.edit.edit}' type=checkbox bind:checked={row.active}/></td>
                    <th>{row.gd}</th>
                    <td><input disabled='{! $cohorts.assessments.edit.edit}'  type=number max=100 min=0 step=1 bind:value={row.pc} class={row.valid ? 'success' : 'error'}  on:input={()=>validateGrade(rowIndex)}/></td>
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
    
    
    