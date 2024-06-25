<script>
    import { onMount } from 'svelte';
    import * as file from '$lib/file';
    import * as util from '$lib/util';
    import {alert,config,groups,teachers,pupils,cycles} from '$lib/store';
    import Modal from '$lib/_Modal.svelte';
	import SelectCohort from '../assessments/SelectCohort.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
       index:0,
       fm:0,
       reports:[],
       open:false,
       filter:{atype:'',hse:'',tid:'',ss:'',sc:'',g:'',txt:false},
       update:{query:{},delete:'',txt:'',ec:'',ep:'',sal:'',tid:''}
    };
    

    $ : {
        if(data.open===false) updateCancel();
    }
    
    
    let update=async()=>{
        let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'reports',filter:{coid:$cycles[data.index]._id} ,projection:{}}),
        headers: {'content-type': 'application/json'}
        });
        data.reports= await response.json();
      
        order();
        console.log(data.reports);
    };


    let order=()=>{
        if(data.type==='A') {
            data.reports=data.reports
            .sort((/** @type {{ fm: number; type: string; author: { type: string; tid: string; }; sc: string; ss: string; g: string; pupil: { sn: string; pn: string; }; }} */ a,/** @type {{ fm: number; type: any; author: { type: any; tid: any; }; sc: any; ss: any; g: any; pupil: { sn: any; pn: any; }; }} */ b)=>
            b.fm - a.fm || 
            a.type.localeCompare(b.type) || 
            a.sc.localeCompare(b.sc) || 
            a.ss.localeCompare(b.ss) || 
            a.g.localeCompare(b.g) || 
            a.pupil.sn.localeCompare(b.pupil.sn) || 
            a.pupil.pn.localeCompare(b.pupil.pn) || 
            a.author.type.localeCompare(b.author.type) || 
            a.author.tid.localeCompare(b.author.tid) );
        } 
        if(data.type==='E') {
            data.reports=data.reports
            .sort((/** @type {{ fm: number; pupil: { sn: string; pn: string; }; sl: string; author: { tid: string; }; }} */ a,/** @type {{ fm: number; pupil: { sn: any; pn: any; }; sl: any; author: { tid: any; }; }} */ b)=>
            b.fm - a.fm || 
            a.pupil.sn.localeCompare(b.pupil.sn) || 
            a.pupil.pn.localeCompare(b.pupil.pn) || 
            a.sl.localeCompare(b.sl) || 
            a.author.tid.localeCompare(b.author.tid) );


        }

        if(data.type==='P') {
            data.reports=data.reports
            .sort((/** @type {{ fm: number; pupil: { hse: string; tg: string; sn: string; pn: string; }; sl: string; author: { tid: string; }; }} */ a,/** @type {{ fm: number; pupil: { hse: any; tg: any; sn: any; pn: any; }; sl: any; author: { tid: any; }; }} */ b)=>
            b.fm - a.fm || 
            a.pupil.hse.localeCompare(b.pupil.hse) || 
            a.pupil.tg.localeCompare(b.pupil.tg) || 
            a.pupil.sn.localeCompare(b.pupil.sn) || 
            a.pupil.pn.localeCompare(b.pupil.pn) || 
            a.sl.localeCompare(b.sl) || 
            a.author.tid.localeCompare(b.author.tid) );


        }

    };

    /**
     * 
     * @param {number} index
     */
    let openEdit=(index)=>{
        /** @type {any}*/
        let filter={};
        if(index>-1) {
            console.log('updateBy_Id',data.reports[index]);
            filter={_id:{$oid:data.reports[index]._id}}
        }
        else {
            console.log('updateMany()');
            for(let item of Object.keys(data.filter)) {
                if(item==='atype' && data.filter[item]!=='') filter["author.type"]=data.filter[item];
                if(item==='tid' && data.filter[item]!=='') filter["author.tid"]=data.filter[item];
                if(item==='hse' && data.filter[item]!=='') filter["pupil.hse"]=data.filter[item];
                if(item==='ss' && data.filter[item]!=='') filter.ss=data.filter[item];
                if(item==='sc' && data.filter[item]!=='') filter.sc=data.filter[item];
                if(item==='g' && data.filter[item]!=='') filter.g=data.filter[item];
                if(item==='txt' && data.filter[item]===true) filter.txt="";
                

                
            }   
        }

        data.update.query=filter;
        data.open=true;
    };

    let updateCancel=()=>{
        data.update={query:{},delete:'',txt:'',ec:'',ep:'',sal:'',tid:''}
        
        data.open=false;
    }

    let updateDocuments=async()=>{

        data.update.update={coid:$cycles[data.index]._id};
        if(data.update.tid!=='') {
            data.update.tid=data.update.tid.toUpperCase().trim();
            data.update.update['"author.tid"']= data.update.tid;
        }
        if(data.update.sal!=='')  data.update.update['"author.sal"']= data.update.sal;
        if(data.update.ec!=='')  data.update.update.ec= data.update.ec;
        if(data.update.ep!=='')  data.update.update.ep= data.update.ep;
        if(data.update.txt!=='')  data.update.update.txt= data.update.txt;


        console.log(data.update.query,data.update.update);

        let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({
                collection:'reports',
                filter:data.update.query,
                update:data.update.update
                }),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);

        if(res.matchedCount>=1) {
            $alert.msg=`updated ${res.matchedCount} reports. ${res.modifiedCount} changes made`;
            await update();
   
        } else {
            console.log(res);
            $alert.type='error';
            $alert.msg=`Error updating reports`;
        }

    };

    let deleteDocuments=async()=>{

    };



   
        
    onMount(async () => {
        console.log('/admin ReportEdit.svelte');
        console.log(status);
        let f=$config.year.find((/** @type {{ fm: number; }} */ el)=>el.fm===7) ;
        data.fm=f? f.fm : $config.year[0].fm;
        data.fm=data.fm;
        await update();
      
    });
     
    
    </script>

<Modal bind:open={data.open}>
    <div class="row">
        <div class="col">
            <h4>Edit Data</h4>
        </div>
        <div class="col">
            <button class="button outline" on:click={()=>data.open=false}>Close</button>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <span class="tag text-center is-full-width">Update</span>
        </div>
    </div>

    <div class="row">
        <div class="col">
            <span class="bold">{JSON.stringify(data.update.query)}</span>
        </div>
    </div>

    <div class="row">
        <div class="col">
            <fieldset class="is-full-width">
                <legend>{data.update.tid!=='' ? `tid (to be updated)` : `tid (no updates)`}</legend>
                <input type=text class={data.update.tid!=='' ? 'ip-filter success' : 'ip-filter'} bind:value={data.update.tid} on:input={()=>data.update.tid=data.update.tid.toUpperCase()}/>
            </fieldset>
        </div>
        <div class="col" >
            <fieldset class="is-full-width">
                <legend>{data.update.sal!=='' ? `sal (to be updated)` : `sal (no updates)`}</legend>
                <input type=text class={data.update.sal!=='' ? 'ip-filter success' : 'ip-filter'} bind:value={data.update.sal}/>
            </fieldset>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <fieldset class="is-full-width">
                <legend>{data.update.ec!=='' ? `ec (to be updated)` : `ec (no updates)`}</legend>
                <input type=text class={data.update.ec!=='' ? 'ip-filter success' : 'ip-filter'} bind:value={data.update.ec}/>
            </fieldset>
        </div>
        <div class="col">
            <fieldset class="is-full-width">
                <legend>{data.update.ep!=='' ? `ep (to be updated)` : `ep (no updates)`}</legend>
                <input type=text class={data.update.ep!=='' ? 'ip-filter success' : 'ip-filter'} bind:value={data.update.ep}/>
            </fieldset>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <fieldset>
                <legend>{data.update.txt!=='' ? `txt (to be updated)` : `txt (no updates)`}</legend>
                <textarea class={data.update.txt!=='' ? 'ip-comment small success' : 'ip-comment small'} bind:value={data.update.txt}/>

            </fieldset>
        </div>
    </div>
    <hr/>
    <div class="row">
        <div class="col">
            <span class="tag text-center is-full-width">Watch out - you could delete all the report text!</span>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <button class="button dark" on:click={updateDocuments}>Update</button>
        </div>
       
       
    </div>
    <hr/>
    <div class="row">
        <div class="col">
            <span class="tag text-center is-full-width">Be very careful. There is no going back from deletes</span>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <p class="grouped"><input class="ip-delete" type=text placeholder="DELETE FOUND" bind:value={data.update.delete}/>&nbsp;<button disabled={data.update.delete!=='DELETE FOUND'} on:click={deleteDocuments} class="button error">Delete</button></p>
        </div>
    </div>
   
</Modal>

    

<div class="row">
    <div class="col is-vertical-align">
        <fieldset class="is-full-width">
            <legend>Cycle</legend>    
            <p class="grouped">       
            <select  id="Cycle" bind:value={data.index} on:change={update}>
            <optgroup label="Cycle">
                    {#each $cycles as item,index}
                        <option value={index}>{item.tt} {item.ts} {item.y}</option>
                    {/each}
            </optgroup>
            </select>
            <span class="tag">{$cycles[data.index].index}</span>&nbsp;
            {#if $cycles[data.index].active}<span class="tag text-error">ACTIVE</span>{/if}
            {#if $cycles[data.index].publish}<span class="tag text-error">PUBLISHED</span>{/if}
            </p>
        </fieldset>
      
    </div>
    <div class="col-3 is-vertical-align">
        <fieldset>
            <legend>Year group</legend>           
            <select  id="Year" bind:value={data.fm}>
            <optgroup label="Year">
                    {#each $config.year as item,index}
                        <option value={item.fm}>{item.fm}</option>
                    {/each}
            </optgroup>
            </select>
        </fieldset>
    </div>
    <div class="col-3 is-vertical-align">
        <button class="button dark" on:click={()=>openEdit(-1)}>Update Selected</button>
    </div>
   
</div>


<div class="row">
    <div class="col">
        <table class="striped small">
            <thead>
                <tr>
                    <th></th>
                    <th>cycle</th>
                    <th>type</th>
                    <th>tid</th>
                    <th>sal</th>
                    <th>pupil</th>
                    <th>hse</th>
                    <th>sc</th>
                    <th>ss</th>
                    <th>sl</th>
                    <th>g</th>
                    <th>efforts</th>
                    <th>txt</th>

                    
                </tr>
                <tr>
                    <th></th>
                    <th></th>
                    <th><input class="ip-filter" type=text bind:value={data.filter.atype}/></th>
                    <th><input class="ip-filter" type=text bind:value={data.filter.tid}/></th>
                    <th></th>
                    <th></th>
                    <th><input class="ip-filter" type=text bind:value={data.filter.hse}/></th>
                    <th><input class="ip-filter" type=text bind:value={data.filter.sc}/></th>
                    <th><input class="ip-filter" type=text bind:value={data.filter.ss}/></th>
                    <td></td>
                    <th><input class="ip-filter" type=text bind:value={data.filter.g}/></th>
                    <th></th>
                    <th>blank?<input type=checkbox bind:checked={data.filter.txt}/></th>
                   

                </tr>
            </thead>
            <tbody>
                {#each data.reports as row,rowIndex}
                    {#if row.fm===data.fm}
                    {#if 
                        (row.author.tid===data.filter.tid || data.filter.tid==='') &&
                        (row.ss===data.filter.ss || data.filter.ss==='') &&
                        (row.sc===data.filter.sc || data.filter.sc==='') &&
                        (row.author.type===data.filter.atype || data.filter.atype==='') &&
                        (row.pupil.hse===data.filter.hse || data.filter.hse==='') &&
                        (row.g===data.filter.g || data.filter.g==='') &&
                        (data.filter.txt===true && row.txt==='' || data.filter.txt===false)

                    }

                    <tr>
                        <td>
                            <a href={'#'} on:click={()=>openEdit(rowIndex)} on:keydown={()=>openEdit(rowIndex)} class="button clear icon-only">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                </a>
                        </td>
                        <td>{row.ci}</td>
                        <td>{row.author.type}</td>
                        <td>{row.author.tid}</td>
                        <td>{row.author.sal}</td>
                        <td>{row.pupil.pn} {row.pupil.sn}</td>
                        <td>{row.pupil.hse}</td>
                        <td>{row.sc}</td>
                        <td>{row.ss}</td>
                        <td>{row.sl}</td>
                        <td>{row.g}</td>
                        <td>{row.ec} / {row.ep}</td>
                        <td>{row.txt}</td>
                    

                    </tr>
                    {/if}
                    {/if}
            
                {/each}
            </tbody>
        </table>
    </div>
</div>
    
    <style>
    
  .small {
    font-size:1.2rem;
  }
  .ip-delete {
    min-width:15rem;
  }

  .ip-filter {
    width:8rem;
    min-width:5rem;
  }

    
  .ip-comment {
    width:50rem;
    height:10rem;
  }
  
    </style>