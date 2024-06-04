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
       active:false,
       cycle:{},
       reports:[]
    };
    
    let addRow=()=>{

        let index=data.rows.length && data.rows.length>0 ? data.rows[data.rows.length-1].index+1 : 0;

        let comments=$config.year.map((/** @type {{ fm: any; }} */ el)=>({fm:el.fm,comment:false}));

        let y=new Date().getFullYear();
        let m=$config.term[0]==='Winter' ? '12' :    $config.term[0]==='Spring' ? '04' : '06';
        let ay=util.getAcademicYear(`${y}-${m}-01`,$config.rollover.month);
        console.log(ay);



        data.rows.push( 
            {
                active:false,
                index:index,
                term:$config.term[0],
                subterm:$config.subterm[0],
                year:y,
                ayear:ay,
                comment:comments,
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

      /**
     * 
     * @param {number} index
     */
    let changeYearTerm=(index)=>{
        data.rows[index].year  =  data.rows[index].year > 0 ? parseInt( data.rows[index].year) : 0;

        let y=data.rows[index].year;
        let m=data.rows[index].term==='Winter' ? '12' :    data.rows[index].term==='Spring' ? '04' : '06';
        data.rows[index].ayear=util.getAcademicYear(`${y}-${m}-01`,$config.rollover.month);

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
                ayear:row.ayear,
                comment:row.comment,
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

    let create=async()=>{

    };
        
    onMount(async () => {
        console.log('/admin ReportCreate.svelte');
        console.log(status);

       
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'config',filter:{},projection:{_id:0}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        $config=res[0] ? res[0] : {};

        data.cycle=$config.cycle.find((/** @type {{ active: any; }} */ el)=>el.active);
        data.active=data.cycle.year && data.cycle.year>0 ? true : false;
        
        if(data.active) {
            response = await fetch('/edge/read', {
                method: 'POST',
                body: JSON.stringify({collection:'reports',filter:{cycle:data.cycle.index},projection:{}}),
                headers: {'content-type': 'application/json'}
            });
            data.reports= await response.json();



        }
       
       
    
    });
    
    </script>

    <hr/>
    
    <Modal bind:open={data.confirm}>
        <div class="row">
            <div class="col">
                <h4>Save Report Cycles</h4>
            </div>
        </div>
      
       
        <div class="row">
            <div class="col">
               {#if data.valid}
                    <span class="tag">All valid</span>
               {:else}
                <span class="tag bg-error text-white">Complete data for each entry. CHECK ALL CYCLES.</span>
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
                <button class="button error" disabled={!data.valid} on:click={saveCycle}>Save</button>
            </div>
            <div class="col">
                <button class="button outline" on:click={()=>data.confirm=false}>Cancel</button>
            </div>
        </div>
    </Modal>
    




  
    <div class="row">
        <div class="col is-vertical-align"><h4>Create Reports</h4></div> 
       
    </div>

 
    {#if data.active}
    <div class="row">
        <div class="col is-vertical-align">
            <span class="tag bold">Report Cycle : {data.cycle.term} {data.cycle.subterm} {data.cycle.year}</span>
        </div> 
    </div>
    <div class="row">
        <div class="col">
            {#if data.reports.length && data.reports.length>1}
            <span class="tag">${data.reports.length} reports already exist, please edit before trying to create.</span>
            {:else}
                <button on:click={create} class="button error">Create</button>
            {/if}
        </div>
    </div>
    {:else}
    <div class="row">
        <div class="col is-vertical-align">
    <span class="tag">No active cycle to create reports</span>
    </div></div>
    {/if}

    <div class="row">
        <div class="col">
           &nbsp;
        </div>
    </div>

   
  
         

    
    <style>
    
    .bold {
        font-weight:600;
    }
  
    </style>