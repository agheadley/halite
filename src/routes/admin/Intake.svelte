<script>
import { onMount } from 'svelte';
import * as file from '$lib/file';
import * as util from '$lib/util';
import {alert,config} from '$lib/store';


/** @type {any}*/
export let status;

/** @type {{list:{yr:number,lv:string}[],index:number}}*/
let cohorts = {list:[],index:0};

/** @type {{id:string,pid:number,sn:string,pn:string,type:string,A:number|null,B:number|null}[]}*/
let base=[];
/** @type {{id:string,pid:number,sn:string,pn:string,sc:string,ss:string,A:number|null,B:number|null}[]}*/
let preds=[];

let exportPreds=()=>{
    let out=[];

    out[0]=['yr','lv','id','pid','sn','pn','sc','ss','A','B'];
    
    for(let row of preds) {
        out.push([
            String(cohorts.list[cohorts.index].yr),
            cohorts.list[cohorts.index].lv,
            row.id,
            String(row.pid),
            row.sn,
            row.pn,
            row.sc,
            row.ss,
            String(row.A),
            String(row.B)

        ])


    }


    console.log(out);
    file.csvDownload(out,"PREDICTIONS.csv");
};


   


   



let exportBase=()=>{
    let out=[];

    out[0]=['yr','lv','id','pid','sn','pn','type','A','B'];
    
    for(let row of base) {
        out.push([
            String(cohorts.list[cohorts.index].yr),
            cohorts.list[cohorts.index].lv,
            row.id,
            String(row.pid),
            row.sn,
            row.pn,
            row.type,
            String(row.A),
            String(row.B)

        ])


    }


    console.log(out);
    file.csvDownload(out,"BASE.csv");
};



let update=async()=>{
    let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'intake',filter:{yr:cohorts.list[cohorts.index].yr,lv:cohorts.list[cohorts.index].lv},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
    let res= await response.json();
    console.log(res);

    base=[];
    for(let item of res) {
        for(let b of item.base) {
            base.push({pid:item.pid,id:item.id,sn:item.sn,pn:item.pn,type:b.type,A:b.A,B:b.B});
        }

    }
    preds=[];
    for(let item of res) {
        for(let b of item.pre) {
            preds.push({pid:item.pid,id:item.id,sn:item.sn,pn:item.pn,sc:b.sc,ss:b.ss,A:b.A,B:b.B});
        }

    }

    console.log(base,preds);
};



onMount(async () => {
        console.log('/admin Export.svelte');
        console.log(status);
     
        let response = await fetch('/edge/distinct', {
            method: 'POST',
            body: JSON.stringify({collection:'intake',match:{},aggregate:['yr','lv']}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        cohorts.list=res.sort((/** @type {{ yr: number; lv: any; }} */ a,/** @type {{ yr: number; lv: string; }} */ b)=>b.yr-a.yr || b.lv.localeCompare(a.lv));
        await update();
    });

</script>



<div class="row">
    <div class="col is-vertical-align">
      
        <fieldset id="cohort" class="is-full-width">
            <legend>Cohort</legend>
            <p class="grouped">
            <select  id="cohort" bind:value={cohorts.index} on:change={update}>
                <optgroup label="Form Level ExamYear">
                        {#each cohorts.list as item,index}
                            <option value={index}>{item.lv} {item.yr}</option>
                        {/each}
                </optgroup>
              </select>
            </p>
            </fieldset>
        
        
    </div>
    <div class="col is-vertical-align">
        <button on:click={exportPreds} class="button outline fixed-width">Predictions&nbsp;
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
  
  
        <button on:click={exportBase} class="button outline fixed-width">Base&nbsp;
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
    </div>
    <div class="col is-vertical-align">
    </div>
</div>
<style>

</style>
