<script>
    import { onMount } from 'svelte';
    import * as file from '$lib/file';
    import * as util from '$lib/util';
    import {alert,config} from '$lib/store';
    import Modal from '$lib/_Modal.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
        rows:[],
        assessments:[],
        cohorts:[],
        index:0,
        confirm:false,
        valid:true
    };
    
    let addRow=async()=>{
        let index=data.rows.length && data.rows.length>0 ? data.rows[data.rows.length-1].index+1 : 0;
        let obj= {index:index,lv:data.cohorts[data.index].lv,yr:data.cohorts[data.index].yr,exam:false,from:"",to:"",n:"",dl:"",dt:0,parent:false};

        let response = await fetch('/edge/insert', {
            method: 'POST',
            body: JSON.stringify({collection:'overview',documents:[obj],projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();

        if(res[0]) {
            $alert.msg='Row added';
        } else {
            $alert.type='error';
            $alert.msg=`Error adding row`;
        }

        response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'overview',filter:{},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        res= await response.json();
        data.rows=res.sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>a.index-b.index);

        for(let row of data.rows) {
            row.aIndex=0;
            if(row.exam) {
                let i=data.assessments.findIndex((/** @type {{ lv: any; yr: any; n: any; dl: any; }} */ el)=>el.lv===row.lv && el.yr===row.yr && el.n===row.n && el.dl===row.dl);
                if(i>-1) row.aIndex=i;
            }
            
        }   

        console.log(data.rows);
       
    };

    /**
     * 
     * @param {string} id
     */
    let removeRow=async(id)=>{
    
        let response = await fetch('/edge/delete', {
		    method: 'POST',
		    body: JSON.stringify({collection:'overview',filter:{"_id": { "$oid": id } }}),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);
        if(res.deletedCount && res.deletedCount===1 ) {
            $alert.msg='Row deleted';
        } else {
            $alert.type='error';
            $alert.msg=`Error deleting row`;
        }

        response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'overview',filter:{},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        res= await response.json();
        data.rows=res.sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>a.index-b.index);

    

        for(let row of data.rows) {
            row.aIndex=0;
            if(row.exam) {
                let i=data.assessments.findIndex((/** @type {{ lv: any; yr: any; n: any; dl: any; }} */ el)=>el.lv===row.lv && el.yr===row.yr && el.n===row.n && el.dl===row.dl);
                if(i>-1) row.aIndex=i;
            }
            
        }   

        console.log(data.rows);

    };



  

    /**
     * 
     * @param {number} index
     */
    let saveRow=async(index)=>{
        console.log('validating ...',data.rows[index].index);

      
      
        if(data.rows[index].exam) {
            data.rows[index].n=data.assessments[data.rows[index].aIndex].n;
            data.rows[index].dl=data.assessments[data.rows[index].aIndex].dl;
            data.rows[index].dt=data.assessments[data.rows[index].aIndex].dt;
            data.rows[index].from='';
            data.rows[index].to='';``
        } else {
            data.rows[index].n='';
            data.rows[index].dl='';
            data.rows[index].dt=null
        }
    
       
       
        /* update row and check if tag.parent needs updating on found assessments */

        let obj={index:data.rows[index].index,lv:data.rows[index].lv,yr:data.rows[index].yr,exam:data.rows[index].exam,from:data.rows[index].from,to:data.rows[index].to,n:data.rows[index].n,dl:data.rows[index].dl,dt:data.rows[index].dt,parent:data.rows[index].parent};
        
        console.log(obj);

        let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({
                collection:'overview',
                filter:{"_id": { "$oid": data.rows[index]._id } },
                update:obj
                }),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);

        if(res.matchedCount===1) {
            $alert.msg=`Row saved -  ${res.modifiedCount===1 ? 'changes made' :'no changes'}`;
            data.confirm=false;
 
   
        } else {
            $alert.type='error';
            $alert.msg=`Error updating row`;
        }



        // now update parent view for assessments tag.parent
        console.log('updating parent view for ',data.rows[index]);
        /** @type {any}*/
        let filter={};
        if(data.rows[index].exam) {
            filter={lv:data.rows[index].lv,yr:data.rows[index].yr,"tag.exam":true,"tag.archive":false,"tag.pupil":true,n:data.rows[index].n,dl:data.rows[index].dl}
        } else {
            let from=new Date(data.rows[index].from).getTime()-1;
            let to=new Date(data.rows[index].to).getTime()+1;
            filter={lv:data.rows[index].lv,yr:data.rows[index].yr,"tag.exam":false,"tag.archive":false,"tag.pupil":true,dt:{$gt:from,$lt:to}};
        
        }
        
        $alert.msg='Updating parent view, please wait...';
        response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({
                collection:'assessments',
                filter:filter,
                update:{"tag.parent":data.rows[index].parent}
                }),
		    headers: {'content-type': 'application/json'}
	    });

    
        res= await response.json();
        console.log(filter);
        console.log('parent update...',res);

        if(res.matchedCount>=1) {
            $alert.msg=`Parent view matched ${res.matchedCount} modified ${res.modifiedCount}`;
            
   
        } else {
            $alert.type='error';
            $alert.msg=`Error updating parent view`;
        }

        




    };
        
    onMount(async () => {
        console.log('/admin Overview.svelte');
        console.log(status);
        

        /* find exam assessments */
        let response = await fetch('/edge/distinct', {
            method: 'POST',
            body: JSON.stringify({collection:'assessments',match:{"tag.archive":false,"tag.exam":true},aggregate:['yr','lv','n','dl','dt']}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        data.assessments=res[0] ? 
            res.sort((/** @type {{ yr: number; lv: any; }} */ a,/** @type {{ yr: number; lv: string; }} */ b)=>a.yr-b.yr || b.lv.localeCompare(a.lv))
            : [];

        /* find active cohorts */
        response = await fetch('/edge/distinct', {
            method: 'POST',
            body: JSON.stringify({collection:'groups',match:{},aggregate:['yr','lv']}),
            headers: {'content-type': 'application/json'}
        });
        res= await response.json();
        data.cohorts=res[0] ? 
            res.sort((/** @type {{ yr: number; lv: any; }} */ a,/** @type {{ yr: number; lv: string; }} */ b)=>a.yr-b.yr || b.lv.localeCompare(a.lv))
            : [];

       

        /* get overview records, sort by index */
        response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'overview',filter:{},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        res= await response.json();
        data.rows=res.sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>a.index-b.index);

        //console.log($config.overview);

        for(let row of data.rows) {
            row.aIndex=0;
            if(row.exam) {
                let i=data.assessments.findIndex((/** @type {{ lv: any; yr: any; n: any; dl: any; }} */ el)=>el.lv===row.lv && el.yr===row.yr && el.n===row.n && el.dl===row.dl);
                if(i>-1) row.aIndex=i;
            }
            
        }   
    
        console.log(data);
        
    });
    
    </script>
    
    
   

    
    <div class="row">
        <div class="col is-vertical-align"><h4>Edit Overview Display Columns</h4></div> 
        <div class="col is-vertical-align">
          
            <fieldset id="cohort" class="is-full-width">
                <legend>Cohort</legend>
                <p class="grouped">
                <select  id="cohort" bind:value={data.index}>
                    <optgroup label="Level ExamYear">
                            {#each data.cohorts as item,index}
                                <option value={index}>{item.lv} {item.yr}</option>
                            {/each}
                    </optgroup>
                  </select>
                </p>
                </fieldset>
            
            
        </div>
    </div>

    <div class="row">
        <div class="col">
            <span class="tag">Complete either exam or from/to dates for each entry. Date ranges are inclusive.</span>
        </div>
    </div>

    <div class="row">
        <div class="col">
           &nbsp;
        </div>
    </div>

    <table class="striped">
        <thead>
            <tr>
                <th>Index</th>
                <th>Assessment Point?</th>
                <th>From</th>
                <th>To</th>
                <th>Parent View?</th>
            </tr>
        </thead>
   
        <tbody>
        {#each data.rows as row,rowIndex}
        {#if row.lv===data.cohorts[data.index].lv && row.yr===data.cohorts[data.index].yr}
        <tr>
            <td>
            <button class="button error icon-only" on:click={()=>removeRow(row._id)}>         
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
            </button>
            {row.lv} {row.yr} / {row.index}
            </td>
            <td>
                <input type=checkbox bind:checked={row.exam}  on:change={()=>saveRow(rowIndex)}>
                {#if row.exam}
                <select  id="cohort" bind:value={row.aIndex}  on:change={()=>saveRow(rowIndex)}>
                    <optgroup label="Level ExamYear">
                            {#each data.assessments as item,index}
                                {#if item.lv===data.cohorts[data.index].lv && item.yr===data.cohorts[data.index].yr}
                                <option value={index}>{item.n} {item.dl} ({item.lv} {item.yr})</option>
                                {/if}
                            {/each}
                    </optgroup>
                  </select>
                {/if}
            </td>
            <td>
                <input disabled={row.exam} style={'width:20rem;'}  on:change={()=>saveRow(rowIndex)} type=date bind:value={row.from} class={row.from==='' && !row.exam ? 'error' : ''}/>
                    
            </td>
            <td>
                <input disabled={row.exam} style={'width:20rem;'}  on:change={()=>saveRow(rowIndex)} type=date bind:value={row.to} class={row.to==='' && !row.exam ? 'error' : ''}/>
            </td>
            <td>
                <input type=checkbox bind:checked={row.parent} on:change={()=>saveRow(rowIndex)}> 
            </td>
        </tr>
        {/if}
        {/each}
        </tbody>
    </table>
  
          
            <div class="row">
                <div class="col">
                    <button class="button dark icon-only" on:click={addRow}>         
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
            </div>
          
            </div>
   
    
    <style>
    
    </style>