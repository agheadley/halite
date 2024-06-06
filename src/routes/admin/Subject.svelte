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
        lvs:[],
        lv:''
    };
    
    let addRow=()=>{
       data.rows.push({lv:data.lv,ss:'',sc:'',tid:''});
       data.rows=data.rows;
    };

    /**
     * 
     * @param {number} index
     */
    let removeRow=(index)=>{
        data.rows.splice(index, 1);
        data.rows=data.rows;
    
        
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




        



    };


    let save=async()=>{

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
        data.rows=$config.subject.filter((/** @type {{ lv: string; }} */ el)=>el.lv!=='')
            .sort((/** @type {{ lv: string; sc: string; ss: string; }} */ a,/** @type {{ lv: any; sc: any; ss: any; }} */ b)=>a.lv.localeCompare(b.lv) || a.sc.localeCompare(b.sc) || a.ss.localeCompare(b.ss));

        data.lvs=[];
        for(let item of data.rows) {
            if(!data.lvs.find((/** @type {any} */ el)=>el===item.lv)) data.lvs.push(item.lv);
        }
        data.lv=data.lvs[0] ? data.lvs[0] :''; 

        console.log(data);
        
    
    };
        
    onMount(async () => {
        console.log('/admin Subject.svelte');
        console.log(status);
        

        await update();
       
        //console.log($config.overview);

        
    });
    
    </script>
    
    
   

    
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

    <table class="striped">
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
            {#each data.rows as row,rowIndex}
                {#if row.lv===data.lv}
                    <tr>
                        <td>
                            <button class="button error icon-only" on:click={()=>removeRow(rowIndex)}>         
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
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
                    <button class="button dark icon-only" on:click={addRow}>         
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </button>
                </div>
                <div class="col is-vertical-align">
                    <td>
                        <button class="button dark" on:click={save}>Save</button>
                    </td>
                </div>
          
            </div>
   
    
    <style>
    
    </style>