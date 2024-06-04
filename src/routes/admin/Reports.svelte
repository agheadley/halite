<script>
    import { onMount } from 'svelte';
    import * as file from '$lib/file';
    import * as util from '$lib/util';
    import {alert,config} from '$lib/store';
    import Modal from '$lib/_Modal.svelte';
    import ReportCycle from './ReportCycle.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
        rows:[],
        tabs:['Cycle','Create','Edit'],
        tabIndex:0,
        assessments:[],
        cohorts:[],
        index:0,
        confirm:false,
        valid:true
    };
    
    let addRow=()=>{

        let index=data.rows.length && data.rows.length>0 ? data.rows[data.rows.length-1].index+1 : 0;

        data.rows.push( 
            {
                active:false,
                index:index,
                term:$config.term[0],
                subterm:$config.subterm[0],
                year:new Date().getFullYear(),
                A:{active:false,length:{min:180,max:600},effort:{class:true,prep:true}},
                E:{active:false,length:{min:300,max:600},effort:{class:false,prep:false}},
                P:{active:false,length:{min:300,max:600},effort:{class:false,prep:false}},
               
            }
        );
            
        data.rows=data.rows;
        console.log(data.rows);
    };

    /**
     * 
     * @param {number} index
     */
    let removeRow=(index)=>{
        console.log(index,data.rows[index]);
        data.rows.splice(index, 1);
        data.rows=data.rows;
    };

      /**
     * 
     * @param {number} index
     */
    let changeActive=(index)=>{
        console.log(data.rows[index].active);
        data.rows.forEach((/** @type {{ active: boolean; }} */ v,/** @type {number} */ i)=>{
            if(i!=index) v.active=false;
        });
        data.rows=data.rows;
    };


     let confirmCycle=()=>{
        data.valid=true;
        for(let row of data.rows) {
            if(row.exam) {
                row.n=data.assessments[row.aIndex].n;
                row.dl=data.assessments[row.aIndex].dl;
                row.dt=data.assessments[row.aIndex].dt;
                row.from='';
                row.to='';
            } else {
                if(row.from==='' || row.to==='') data.valid=false;
            }
        }
        console.log(data.rows);
        data.confirm=true;

    };

    let saveCycle=async()=>{
        let update=[];
        for(let row of data.rows) {
            let obj= {
                active:row.active,
                index:row.index,
                term:row.term,
                subterm:row.subterm,
                year:row.year,
                A:{active:row.A.active,length:{min:row.A.length.min,max:row.A.length.max},effort:{class:row.A.effort.class,prep:row.A.effort.prep}},
                E:{active:row.E.active,length:{min:row.E.length.min,max:row.E.length.max},effort:{class:row.E.effort.class,prep:row.E.effort.prep}},
                P:{active:row.P.active,length:{min:row.P.length.min,max:row.P.length.max},effort:{class:row.P.effort.class,prep:row.P.effort.prep}},
            
            };
            update.push(obj);
        }

        let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({
                collection:'config',
                filter:{},
                update:{cycle:update}
                }),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);

        if(res.matchedCount===1) {
            $alert.msg=`Report Cycle Data saved -  ${res.modifiedCount===1 ? 'changes made' :'no changes'}`;
            data.confirm=false;
        } else {
            $alert.type='error';
            $alert.msg=`Error updating Report Cycle Data.`;
        }
       
    };
        
    onMount(async () => {
        console.log('/admin Reports.svelte');
        console.log(status);
        

       
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'config',filter:{},projection:{_id:0}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        $config=res[0] ? res[0] : {};

        console.log($config.cycle);
        data.rows=[];

        for(let row of $config.cycle) {
            let obj= {
                active:row.active,
                index:row.index,
                term:row.term,
                subterm:row.subterm,
                year:row.year,
                A:{active:row.A.active,length:{min:row.A.length.min,max:row.A.length.max},effort:{class:row.A.effort.class,prep:row.A.effort.prep}},
                E:{active:row.E.active,length:{min:row.E.length.min,max:row.E.length.max},effort:{class:row.E.effort.class,prep:row.E.effort.prep}},
                P:{active:row.P.active,length:{min:row.P.length.min,max:row.P.length.max},effort:{class:row.P.effort.class,prep:row.P.effort.prep}},
            
            };
            data.rows.push(obj);
         
        }   

        data.rows=data.rows.sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>a.index-b.index);

        console.log(data);
        
    });
    
    </script>

    <hr/>
    

    <div class="row">
        <div class="col">
            <div class="tabs">
                {#each data.tabs as row,rowIndex}
                <a href={'#'} on:click={()=>data.tabIndex=rowIndex} class={data.tabIndex===rowIndex ? 'active':''}>{row}</a>        
                {/each}
            </div>
        </div>
    </div>


    {#if data.tabs[data.tabIndex]==='Edit'}
    <div class="row">
        <div class="col is-vertical-align"><h4>Edit Report Data</h4></div> 
       
    </div>

 
    <div class="row">
        <div class="col">
           &nbsp;
        </div>
    </div>

    {/if} <!-- /tab==='Edit'-->


    {#if data.tabs[data.tabIndex]==='Create'}
    <div class="row">
        <div class="col is-vertical-align"><h4>Create Reports (Active Cycle)</h4></div> 
       
    </div>

 
    <div class="row">
        <div class="col">
           &nbsp;
        </div>
    </div>

    {/if} <!-- /tab==='Create'-->


    {#if data.tabs[data.tabIndex]==='Cycle'}
        <ReportCycle bind:status={status}/>
    {/if}

    
    
    <style>
    
    </style>