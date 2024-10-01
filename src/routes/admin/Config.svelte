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
        subjects:[],
        lvs:[],
        lv:'',
        grades:[],
        regression:[],
        tab:'subject'   // subject, grade,regression
    };
    
    let addSubjectRow=()=>{
       data.subjects.push({lv:data.lv,ss:'',sc:'',tid:''});
       data.subjects=data.subjects;
    };

    let addGradeRow=()=>{
        data.grades.push({sc:'',gd:'',pc:0,scr:0,pre:0});
        data.grades=data.grades;
        
    };

    let addRegressionRow=()=>{
        data.regression.push({lv:'',sc:'',ss:'',regressionYear:0,gradient:0,intercept:0,std:''});
        data.regression=data.regression;
        
    };

    /**
     * 
     * @param {number} index
     */
    let removeSubjectRow=(index)=>{
        data.subjects.splice(index, 1);
        data.subjects=data.subjects;
    
        
    };

    
    /**
     * 
     * @param {number} index
     */
     let removeGradeRow=(index)=>{
        data.grades.splice(index, 1);
        data.grades=data.grades;
    
        
    };

     /**
     * 
     * @param {number} index
     */
     let removeRegressionRow=(index)=>{
        data.regression.splice(index, 1);
        data.regression=data.regression;
    
        
    };



  



    let saveSubject=async()=>{
        let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({
                collection:'config',
                filter:{},
                update:{subject:data.subjects}
                }),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);

        if(res.matchedCount===1) {
            $alert.msg=`All saved ${res.modifiedCount===1 ? 'changes made' :'no changes'}`;
            await update();
   
        } else {
            $alert.type='error';
            $alert.msg=`Error saving subjects`;
        }

    };


    let saveGrade=async()=>{
        let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({
                collection:'config',
                filter:{},
                update:{grade:data.grades}
                }),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);

        if(res.matchedCount===1) {
            $alert.msg=`All saved ${res.modifiedCount===1 ? 'changes made' :'no changes'}`;
            await update();
   
        } else {
            $alert.type='error';
            $alert.msg=`Error saving grades`;
        }

    };

    let saveRegression=async()=>{
        let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({
                collection:'config',
                filter:{},
                update:{regression:data.regression}
                }),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);

        if(res.matchedCount===1) {
            $alert.msg=`All saved ${res.modifiedCount===1 ? 'changes made' :'no changes'}`;
            await update();
   
        } else {
            $alert.type='error';
            $alert.msg=`Error saving regression`;
        }

    };


    let update=async()=>{
        /* get subject records */
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'config',filter:{},projection:{_id:0}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        let $config=res[0] ? res[0] : {};
    


        /* filter to copy, and sort */
        data.subjects=$config.subject.filter((/** @type {{ lv: string; }} */ el)=>el.lv!=='')
            .sort((/** @type {{ lv: string; sc: string; ss: string; }} */ a,/** @type {{ lv: any; sc: any; ss: any; }} */ b)=>a.lv.localeCompare(b.lv) || a.sc.localeCompare(b.sc) || a.ss.localeCompare(b.ss));

        data.lvs=[];
        for(let item of data.subjects) {
            if(!data.lvs.find((/** @type {any} */ el)=>el===item.lv)) data.lvs.push(item.lv);
        }
        data.lv=data.lvs[0] ? data.lvs[0] :''; 

        console.log(data);

        data.grades=[];
        for(let item of $config.grade) {
            data.grades.push({sc:item.sc,gd:item.gd,pc:item.pc,scr:item.scr,pre:item.pre});
            data.grades=data.grades.sort((/** @type {{ sc: string; pc: number; }} */ a,/** @type {{ sc: any; pc: number; }} */ b)=>a.sc.localeCompare(b.sc) || b.pc-a.pc);
        }

        data.regression=$config.regression.sort((/** @type {{ sc: string; ss: string; regressionYear: number; }} */ a,/** @type {{ sc: any; ss: any; regressionYear: number; }} */ b)=>a.sc.localeCompare(b.sc) || a.ss.localeCompare(b.ss) || b.regressionYear-a.regressionYear);

        
    
    };
        
    onMount(async () => {
        console.log('/admin Subject.svelte');
        console.log(status);
        

        
        await update();
       
        console.log(data.regression);

        
    });
    
    </script>
    
    <hr/>

    <div class="row">
        <div class="col">
            <div class="tabs">
                <a href={'#'} on:click={()=>data.tab='subject'} on:keydown={()=>data.tab='subject'} class={data.tab==='subject'?'active':''}>Subjects</a>
                <a href={'#'} on:click={()=>data.tab='grade'} on:keydown={()=>data.tab='grade'} class={data.tab==='grade'?'active':''}>Grades</a>
                <a href={'#'} on:click={()=>data.tab='regression'} on:keydown={()=>data.tab='regression'} class={data.tab==='regression'?'active':''}>Regression</a>
            </div>
        </div>
    </div>

    {#if data.tab==='regression'}

    <div class="row">
        <div class="col">
            <h4>Edit Regression (US Chances Graphs only)</h4>
        </div>
    </div>

    <div class="row">
        <div class="col">
           &nbsp;
        </div>
    </div>

    <table class="striped small">
        <thead>
            <tr>
                <th></th>
                <th>sc</th>
                <th>ss</th>
                <th>regressionYear</th>
                <th>lv</th>
                <th>gradient</th>
                <th>intercept</th>
                <th>std</th>
              </tr>
        </thead>
        <tbody>
            {#each data.regression as row,rowIndex}
            <tr>
                <td>
                    <button class="button outline icon-only" on:click={()=>removeRegressionRow(rowIndex)}>         
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                    </button>
                    
                </td>
                <td><input type=text bind:value={row.sc}/></td>
                <td><input type=text bind:value={row.ss}/></td>
                <td><input type=number bind:value={row.regressionYear}/></td>
                <td><input type=text bind:value={row.lv}/></td>
                <td><input type=number bind:value={row.gradient}/></td>
                <td><input type=number bind:value={row.intercept}/></td>
                <td><input type=text bind:value={row.std}/></td>
            </tr>

            {/each}
        </tbody>
    </table>

    <div class="row">
        <div class="col is-vertical-align">
            <button class="button dark icon-only" on:click={addRegressionRow}>         
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
        </div>
        <div class="col is-vertical-align">
            <td>
                <button class="button dark" on:click={saveRegression}>Save</button>
            </td>
        </div>
  
    </div>

    {/if}   <!-- / enf of regression-->

    {#if data.tab==='grade'}

    <div class="row">
        <div class="col">
            <h4>Edit Grades</h4>
        </div>
    </div>

    <div class="row">
        <div class="col">
           &nbsp;
        </div>
    </div>

    <table class="striped small">
        <thead>
            <tr>
                <th></th>
                <th>sc</th>
                <th>gd</th>
                <th>pc</th>
                <th>scr</th>
                <th>pre</th>
              </tr>
        </thead>
        <tbody>
            {#each data.grades as row,rowIndex}
                    <tr>
                        <td>
                            <button class="button outline icon-only" on:click={()=>removeGradeRow(rowIndex)}>         
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                            
                        </td>
                        <td><input type=text bind:value={row.sc}/></td>
                        <td><input type=text bind:value={row.gd}/></td>
                        <td><input type=number bind:value={row.pc}/></td>
                        <td><input type=number bind:value={row.scr}/></td>
                        <td><input type=number bind:value={row.pre}/></td>
                    </tr>
            {/each}
        </tbody>
    </table>
   
          
            <div class="row">
                <div class="col is-vertical-align">
                    <button class="button dark icon-only" on:click={addGradeRow}>         
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
                <div class="col is-vertical-align">
                    <td>
                        <button class="button dark" on:click={saveGrade}>Save</button>
                    </td>
                </div>
          
            </div>
   
   

    {/if} <!-- / tab=grade-->

    {#if data.tab==='subject'}
    <div class="row">
        <div class="col is-vertical-align"><h4>Edit Subjects</h4></div> 
        <div class="col is-vertical-align">
          
            <fieldset id="cohort" class="is-full-width">
                <legend>Level</legend>
                <p class="grouped">
                <select  id="cohort" bind:value={data.lv}>
                    <optgroup label="Level">
                            {#each data.lvs as item,index}
                                <option value={item}>{item}</option>
                            {/each}
                    </optgroup>
                  </select>
                </p>
                </fieldset>
            
            
        </div>
        <div class="col">&nbsp;</div>
    </div>

    
    <div class="row">
        <div class="col">
           &nbsp;
        </div>
    </div>

    <table class="striped small">
        <thead>
            <tr>
                <th></th>
                <th>lv</th>
                <th>sc</th>
                <th>ss</th>
                <th>tid</th>
              </tr>
        </thead>
        <tbody>
            {#each data.subjects as row,rowIndex}
                {#if row.lv===data.lv}
                    <tr>
                        <td>
                            <button class="button outline icon-only" on:click={()=>removeSubjectRow(rowIndex)}>         
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                            </button>
                            
                        </td>
                        <td><input type=text bind:value={row.lv}/></td>
                        <td><input type=text bind:value={row.sc}/></td>
                        <td><input type=text bind:value={row.ss}/></td>
                        <td><input type=text bind:value={row.tid}/></td>
                    </tr>
                {/if}
            {/each}
        </tbody>
    </table>
   
          
            <div class="row">
                <div class="col is-vertical-align">
                    <button class="button dark icon-only" on:click={addSubjectRow}>         
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
                <div class="col is-vertical-align">
                    <td>
                        <button class="button dark" on:click={saveSubject}>Save</button>
                    </td>
                </div>
          
            </div>
   
    {/if} <!-- / tab=subject-->
    <style>
    
    .small {
        font-size:1.2rem;
    }

    </style>