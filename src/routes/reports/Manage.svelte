<script>
import { onMount } from 'svelte';
import {teachers,config,alert} from '$lib/store';
import Modal from '$lib/_Modal.svelte';
import * as util from '$lib/util';
	
/** @type {any}*/
export let data;


/** @type {any}*/
export let status;

$:{
        if(list.open || list.create) {
                list.pupils=data.pupils.filter((/** @type {{ select: boolean; }} */ el)=>el.select===true).map((/** @type {{ yr:number,lv:string,id: any; fm: any; pid: any; sn: any; pn: any; gnd: any; tg: any; hse: any; }} */ el)=>({lv:el.lv,yr:el.yr,id:el.id,fm:el.fm,pid:el.pid,sn:el.sn,pn:el.pn,gnd:el.gnd,tg:el.tg,hse:el.hse}));
        }
}

/** @type {any}*/
let list={name:'',max:15,valid:false,open:false,pupils:[],delete:false,index:0,create:false,sIndex:0};


let save=async()=>{
        let ps=list.pupils.map((/** @type {{ pid: any; }} */ el)=>el.pid);
        let dl=util.getDate();
        let dt=new Date(dl).getTime();
        let x={name:list.name,type:'enrichment',lv:'',yr:0,user:data.user,dl:dl,dt:dt,pid:ps,log:`${status.user}|${util.getDateTime()}`};
        console.log(x);

        let response = await fetch('/edge/insert', {
                method: 'POST',
                body: JSON.stringify({collection:'lists',documents:[x]}),
                headers: {'content-type': 'application/json'}
        });

        let res= await response.json();
        console.log(res);
        if(res[0]) {
            $alert.msg=`List created`; 
            list.open=false;
            await update();
             
        } else {
            $alert.type='error';
            $alert.msg=`Error creating list`;
        }


};

let update=async()=>{
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'lists',filter:{type:'enrichment',user:data.user},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();

        console.log(res);
        data.lists=res.sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>b.dt-a.dt);

        console.log(data);
    
};


/**
 * 
 * @param {boolean} bool
 */
let select=(bool)=>{
        let gs=data.gnds.filter((/** @type {{ filter: boolean; }} */ el)=>el.filter===true).map((/** @type {{ gnd: any; }} */ el)=>el.gnd);
        let fs=data.years.filter((/** @type {{ filter: boolean; }} */ el)=>el.filter===true).map((/** @type {{ fm: any; }} */ el)=>el.fm)
        for(let item of data.pupils) {
                if(gs.includes(item.gnd) && fs.includes(item.fm)) 
                        item.select=bool;
        }
        data.pupils=data.pupils;                
};

let validate=()=>{
        list.valid=true;
        list.name=list.name.replace(/ /g,"_");
        list.name=list.name.replace(/[^A-Za-z0-9._-]/g,"");
        list.name = list.name.length && list.name.length>list.max ? list.name.slice(0,(list.max-1)) : list.name;
        if(list.name==='') list.valid=false;
  
};

/**
 * 
 * @param {number} index
 */
let chooseList=(index)=>{
        console.log('UPDATING...INDEX' ,data.lists[list.index]);
        list.index=index;
        for(let item of data.pupils) {
                if(data.lists[list.index].pid.includes(item.pid)) item.select=true;
                else item.select=false;
        }
        data.pupils=data.pupils;
};


/**
 * 
 * @param {number} index
 */
 let removeListOpen=(index)=>{
        list.index=index;
        list.delete=true;

};

let removeList=async()=>{
        console.log('deleting',data.lists[list.index]._id,data.lists[list.index].name);
        let response = await fetch('/edge/delete', {
		    method: 'POST',
		    body: JSON.stringify({collection:'lists',filter:{"_id": { "$oid": data.lists[list.index]._id } }}),
		    headers: {'content-type': 'application/json'}
	});

        let res= await response.json();
        console.log(res);
        if(res.deletedCount && res.deletedCount===1 ) {
            $alert.msg=`List deleted`;
            list.delete=false;
            await update();
        } else {
            $alert.type='error';
            $alert.msg=`Error deleting list`;
        }
        
};


/**
 * 
 * @param {number} index
 */
 let createOpen=(index)=>{
        chooseList(index);
        data.pupils=data.pupils;
        list.index=index;
        list.create=true;
};

let create=async()=>{
        console.log('creating reports...',$config.report.enrichment[list.sIndex].sl,$config.report.enrichment[list.sIndex].sc);

        console.log(status.cycle);
        
        let reports=[];

        for(let pupil of list.pupils) {


                let report={
                        coid:status.cycle._id,
                        ci:status.cycle.index,
                        ay:status.cycle.ay,
                        y:status.cycle.y,
                        tt:status.cycle.tt,
                        ts:status.cycle.ts,
                        min:status.cycle.length.E.min,
                        max:status.cycle.length.E.max,
                        type:'E',
                        author:{type:'enrichment',tid:data.user,sal:data.sal},
                        ec:null,
                        ep:null,
                        txt:'',
                        fm:pupil.fm,
                        g:$config.report.enrichment[list.sIndex].g,
                        sc:$config.report.enrichment[list.sIndex].sc,
                        ss:$config.report.enrichment[list.sIndex].ss,
                        sl:$config.report.enrichment[list.sIndex].sl,
                        lv:pupil.lv,
                        yr:pupil.yr,
                        log:`${status.user}|${util.getDateTime()}`,
                        pupil:{pid:pupil.pid,sn:pupil.sn,pn:pupil.pn,hse:pupil.hse,tg:pupil.tg,gnd:pupil.gnd,id:pupil.id}
                       
                    };

                reports.push(report);
        }

        console.log(reports);

        let response = await fetch('/edge/insert', {
                method: 'POST',
                body: JSON.stringify({collection:'reports',documents:reports}),
                headers: {'content-type': 'application/json'}
        });

        let res= await response.json();
        console.log(res);
        if(res[0]) {
            $alert.msg=`${res.length} reports created`; 

            
            list.create=false;


            response = await fetch('/edge/read', {
                method: 'POST',
                body: JSON.stringify({collection:'reports',filter:{type:'E',coid:status.cycle._id,"author.tid":data.user},projection:{}}),
                headers: {'content-type': 'application/json'}
            });
            res= await response.json();
            data.reports=res[0] ? res.sort((/** @type {{ sl: string; pupil: { sn: string; pn: string; }; }} */ a,/** @type {{ sl: any; pupil: { sn: any; pn: any; }; }} */ b)=>a.sl.localeCompare(b.sl) || a.pupil.sn.localeCompare(b.pupil.sn) || a.pupil.pn.localeCompare(b.pupil.pn) ) :[];



             
        } else {
            $alert.type='error';
            $alert.msg=`Error creating reports`;
        }

       




};



onMount(async () => {
        console.log('/reports Manage.svelte');

        await update();
        data.pupils=data.pupils;

      
        
});

</script>




{#if list.create}
    <Modal bind:open={list.create}>
        <div class="row">
            <div class="col">
                <h4>Create Reports</h4>
            </div>
            <div class="col is-right">
                <button class="button outline" on:click={()=>list.create=false}>Close</button>
            </div>
        </div>
        <div class="row">
                <div class="col">
                        <fieldset>
                                <legend>Subject</legend>
                                <p class="grouped">
                                        <select  id="Subject" bind:value={list.sIndex}>
                                                <optgroup label="Subject">
                                                        {#each $config.report.enrichment as item,index}
                                                            <option value={index}>{item.sl}</option>
                                                        {/each}
                                                </optgroup>
                                              </select>
                                     
                                </p>
                        </fieldset>
                </div>
        </div>
        <div class="row">
                <div class="col">
                    <button class="button dark" on:click={create}>Create</button>
                </div>
                <div class="col is-right">
                    <button class="button outline" on:click={()=>list.create=false}>Cancel</button>
                </div>
            </div>
         <div class="row">
            <div class="col">
               <table class="striped small">
                {#each list.pupils as row}
                        <tr>
                                <td>{row.pn} {row.sn}</td>
                                <td>{row.fm}</td>
                                <td>{row.hse}</td>
                        </tr>
                {/each}
               </table>
            </div>
        </div>
    
        
       
    </Modal>
    {/if}



{#if list.delete}
    <Modal bind:open={list.delete}>
        <div class="row">
            <div class="col">
                {#if data.lists[list.index].user===status.user}
                <h4>Delete this list?</h4>
                {:else}
                <span class="tag">Only the list's user can delete!</span>
                {/if}
            </div>
        </div>
        <div class="row">
                <div class="col">
                        &nbsp;
                </div>
        </div>
        <div class="row">
            <div class="col">
                <button disabled={!data.lists[list.index].user===status.user} class="button error" on:click={removeList}>Delete</button>
            </div>
            <div class="col is-right">
                <button class="button outline" on:click={()=>list.delete=false}>Close</button>
            </div>
        </div>
    
        
       
    </Modal>
{/if}


{#if list.open}
    <Modal bind:open={list.open}>
        <div class="row">
            <div class="col">
                <h4>Save List ?</h4>
            </div>
            <div class="col is-right">
                <button class="button outline" on:click={()=>list.open=false}>Close</button>
            </div>
        </div>
        <div class="row">
                <div class="col">
                        <fieldset>
                                <legend>List Name (max{list.max})</legend>
                                <p class="grouped">
                                        <input type=text bind:value={list.name} on:input={validate}/>
                                        <button disabled={list.name==='' || list.pupils.length===0} class="button dark" on:click={save}>Save</button>
                                </p>
                        </fieldset>
                </div>
        </div>
        <div class="row">
            <div class="col">
               <table class="striped small">
                {#each list.pupils as row}
                        <tr>
                                <td>{row.pn} {row.sn}</td>
                                <td>{row.fm}</td>
                                <td>{row.hse}</td>
                        </tr>
                {/each}
               </table>
            </div>
        </div>
    
        
       
    </Modal>
    {/if}





<div class="row">

<div class="col">
<p><span class="tag">MANAGE LISTS</span></p>
<div>
        <button class="button dark" on:click={()=>list.open=true}>Create List</button>   
</div>
<div>&nbsp;</div>
<div>
        <fieldset>
                <legend>Filter</legend>
                <p class="grouped">
                   {#each data.years as y,yIndex}
                        {y.fm}<input type=checkbox bind:checked={y.filter}>
                   {/each}
                </p>
                <p class="grouped">
                  {#each data.gnds as g,gIndex}
                    {g.gnd}<input type=checkbox bind:checked={g.filter}>
                  {/each}
                        <button class="button outline small" on:click={()=>select(true)}>Select All</button>
                        <button class="button outline small" on:click={()=>select(false)}>Clear</button>
                        
                </p>
        </fieldset>
</div>


<table class="striped small">
        <tbody>
                {#each data.pupils as row,rowIndex}
                        
                        {#if data.gnds.filter((/** @type {{ filter: boolean; }} */ el)=>el.filter===true).map((/** @type {{ gnd: any; }} */ el)=>el.gnd).includes(row.gnd) && data.years.filter((/** @type {{ filter: boolean; }} */ el)=>el.filter===true).map((/** @type {{ fm: any; }} */ el)=>el.fm).includes(row.fm)}
                        <tr>
                                <td><input type=checkbox bind:checked={row.select}/></td>
                                <td>{row.pn} {row.sn}</td>
                                <td>{row.fm}</td>
                                <td>{row.hse}</td>
                        </tr>
                        {/if}
                {/each}
        </tbody>
</table>


</div>



<div class="col">
        <p><span class="tag">CREATE REPORTS FROM LIST</span></p>

        <table class="small">
                {#each data.lists as list,listIndex}
        
                <tr>
                        <td><button class="button clear" on:click={()=>chooseList(listIndex)}>{list.name}</button></td>
                        <td>
                                <button class="button outline icon-only" on:click={()=>removeListOpen(listIndex)}>         
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                </button>
                        </td>
                        <td>
                                <button class="button dark small" on:click={()=>createOpen(listIndex)}>Create Reports</button>
                        </td>
                </tr>
                {/each}
    
        </table>
</div>

</div>

<style>

.small {
        font-size:1.2rem;
}
</style>