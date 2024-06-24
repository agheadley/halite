<script>
import { onMount } from 'svelte';
import * as file from '$lib/file';
import * as util from '$lib/util';
import {alert} from '$lib/store';

/** @type {any}*/
export let status;

/** @type {any}*/
let files;

/** @type {string[]}*/
let log=[];

/** @type {{list:string[],selected:'outcome'|'intake'}}*/
let options={
    list:['outcome','intake'],
    selected:'outcome'
};

/** @type {{outcome:string[][],intake:string[][]}}*/
let samples = {
    outcome:[
        ['yr','lv','id','pid','sn','pn','gnd','hse','tg','iep','eal','gt','sc','sl','ss','sr','g','gd','log','resA','resB','total','kpi','va'],
        ['2012','US',"123456789012","12345",'Smith','Andy','M','Buckingham','AAA','true','false','false','A','Biology','B','999X','7/B/A1','A*','remark B>A*','0.25','0.56','true','true','true'],
        ['missing std residuals (resA,resB) set to null'],
        ['log - remarks, new joiners etc'],
        ['iep eal gt tags will be assigned to be identical for each pupil - do not let them vary'],
        ['kpi va total tags can be varied for each result']
  
    ],
    intake:[
        ['pid','sn','pn','gnd','hse','yr','lv','test','type','std','scr','sc','ss','pre'],
            ["67891",'Abbott','Sarah','F','Grocer',"2012",'MS','M','math','B',"119.9",'*','*',"0"],
            ["67891",'Abbott','Sarah','F','Grocer',"2012",'MS','M','vocab','A',"109.3",'*','*',"0"],
            ["67891",'Abbott','Sarah','F','Grocer',"2012",'MS','M','vocab','B',"110.5",'*','*',"0"],
            ["67891",'Abbott','Sarah','F','Grocer',"2012",'MS','M','prediction','A',"0",'G','E',"7.8"],
            ["67891",'Abbott','Sarah','F','Grocer',"2012",'MS','M','prediction','B',"0",'G','Sp',"7.1"],
            ['MS predictions 0-9, US A 0-140, US I 0-7'],
            ['std A refers to National Data / GCSE mean, std B refers to ALIS / Independent'],
            ['missing scores or predictions set to 0'],
            ['predictions will be generated if not present - from US regression data, MS expected present']
    ]
};

let download=()=>{
        console.log('download sample file',options.selected);
        file.csvDownload(samples[options.selected],`EXAMPLE-${options.selected.toUpperCase()}.csv`);
    };        

/**
 * 
 * @param {any} results
 */
let createIntake=async(results)=>{
    /** @type {any}*/
    let documents=[];
    for(let row of results) {
        if(!documents.find((/** @type {{ pid: any; lv: any; yr: any; }} */ el)=>el.pid===Number(row.pid) && el.lv===row.lv && el.yr===Number(row.yr))) {
            /** @type {any}*/
            let line={
                id:'',
                pid:Number(row.pid),
                sn:row.sn,
                hse:row.hse,
                gnd:row.gnd,
                lv:row.lv,
                yr:Number(row.yr),
                test:row.test,
                base:[],
                pre:[]
                };

                /** @type {any}*/
                let f=results.filter((/** @type {{ pid: any; lv: any; yr: any; type: string; }} */ el)=>el.pid===row.pid && el.lv===row.lv && el.yr===row.yr && el.type==='prediction');
                /** @type {{sc:string,ss:string,A:number,B:number}[]}*/
                let pre=[];
                for(let item of f) {
                    if(!pre.find(el=>el.ss===item.ss && el.sc===item.sc)) {
                        let a=f.find((/** @type {{ ss: any; sc: any; std: string; }} */ el)=>el.ss===item.ss && el.sc===item.sc && el.std==='A');
                        let b=f.find((/** @type {{ ss: any; sc: any; std: string; }} */ el)=>el.ss===item.ss && el.sc===item.sc && el.std==='B');
                        pre.push({ss:item.ss,sc:item.sc,A:a?Number(a.pre):0,B:b?Number(b.pre):0});
                    };
                }
                line.pre=pre;

                 /** @type {any}*/
                f=results.filter((/** @type {{ pid: any; lv: any; yr: any; type: string; }} */ el)=>el.pid===row.pid && el.lv===row.lv && el.yr===row.yr && el.type!=='prediction');
                //console.log(f);
                /** @type {{type:string,A:number,B:number}[]}*/
                let base=[];
                for(let item of f) {
                    if(!base.find(el=>el.type===item.type)) {

                        let a=f.find((/** @type {{ type:any; std: string; }} */ el)=>el.type===item.type && el.std==='A');
                        let b=f.find((/** @type {{ type: any;std:string; }} */ el)=>el.type===item.type && el.std==='B');
                        base.push({type:item.type,A:a?Number(a.scr):0,B:b?Number(b.scr):0});
                    };
                }
                line.base=base;


        documents.push(line);
          
        }

    }


    console.log(documents);


    let response = await fetch('/edge/insert', {
        method: 'POST',
        body: JSON.stringify({collection:'intake',documents:documents}),
        headers: {'content-type': 'application/json'}
    });

    let res= await response.json();
    console.log(res);

        if(res.length && res.length>0) {
                $alert.msg=`${res.length} 'intake' documents created`;
        } else {
            $alert.type='error';
            $alert.msg=`Error creating 'intake' documents`;
        }


};

/**
 * 
 * @param {any} results
 */
let createOutcome=async(results)=>{
 

    let documents=[];
    for(let row of results) {
        if(row.lv!==null && row.yr!==null && row.ss!==null) {
            documents.push({
                lv:String(row.lv),
                yr:Number(row.yr),
                id:String(row.id),
                pid:Number(row.pid),
                sn:String(row.sn),
                pn:String(row.pn),
                gnd:String(row.gnd),
                hse:String(row.hse),
                tg:String(row.tg),
                sc:String(row.sc),
                sl:String(row.sl),
                ss:String(row.ss),
                sr:row.sr===null || row.sr==="null"  ? '' : String(row.sr),
                g:row.g===null || row.g==="null" ? '' : String(row.g),
                log:row.log===null || row.log==="null" ? '' : String(row.low),
                gd:String(row.gd),
                res:{
                    A:row.resA===null || row.resA==="null" ? null : Number(row.resA),
                    B:row.resB===null || row.resB==="null"  ? null : Number(row.resB)
                },
                sen:{
                    iep:`${row.iep} `.toUpperCase().trim()==='TRUE' ? true : false,
                    eal:`${row.eal} `.toUpperCase().trim()==='TRUE' ? true : false,
                    gt:`${row.gt} `.toUpperCase().trim()==='TRUE' ? true : false
                },
                tag:{
                    total:`${row.total} `.toUpperCase().trim()==='TRUE' ? true : false,
                    kpi:`${row.kpi} `.toUpperCase().trim()==='TRUE' ? true : false,
                    va:`${row.va} `.toUpperCase().trim()==='TRUE' ? true : false
                }



            });
        }
    }

    console.log(documents);

    let response = await fetch('/edge/insert', {
        method: 'POST',
        body: JSON.stringify({collection:'exams',documents:documents}),
        headers: {'content-type': 'application/json'}
    });

    let res= await response.json();
    console.log(res);

        if(res.length && res.length>0) {
                $alert.msg=`${res.length} 'exams' documents created`;
        } else {
            $alert.type='error';
            $alert.msg=`Error creating 'exams' documents`;
        }



}; 


let upload=async()=>{
    file.read(files[0],async (/** @type {any} */ res)=>{
        console.log(res);
        let results=file.csvProcess(res);
        console.log(results);
        if(options.selected==='intake') await createIntake(results);
        if(options.selected==='outcome') await createOutcome(results);
    });

};
    
    
    onMount(async () => {
        console.log('/admin Import.svelte');
        console.log(status);
     
       
    });

</script>


<div class="row">
    <div class="col is-vertical-align"><h4>Import Data</h4></div> 
</div>
<div class="row">
    <div class="col is-vertical-align">
        <span class="tag bg-error text-white">N.B. Do not import duplicate data - it cause incorrect information to be displayed.</span>
    </div>
</div>
<div class="row">
    <div class="col is-vertical-align">
        <span class="tag bg-error text-white">Check pupil year level does not previously exist, use 'Remarks' section otherwise</span>
    </div>
</div>


<div class="row">
    <div class="col is-vertical-align">
        <span class="tag bg-dark text-white"> Predictions will be generated for US intake - not need to include.</span>
    </div>
</div>
<div class="row">
    <div class="col is-vertical-align">
        &nbsp;
    </div>
</div>
<div class="row">
    <div class="col is-vertical-align">
      
            <input name="file1" type="file" bind:files />
    </div>
    <div class="col is-vertical-align">
    </div>
</div>
<div class="row">
    <div class="col is-vertical-align ">
        <fieldset class="is-full-width">
            <legend>Data Type</legend>
            {#each options.list as col}
                <input type=radio id={col} bind:group={options.selected} value={col}/><lable for={col}>{col}</lable>
            {/each}
        </fieldset>
    </div>
    <div class="col is-vertical-align">
        <button on:click={download} class="button icon outline">Sample file&nbsp;
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
    </div>
    <div class="col is-vertical-align">
      
    </div>
</div>
<div class="row">
   
    <div class="col is-vertical-align">
        <button disabled='{!files}' class="button dark" on:click={upload}>Import Data</button>
    </div>
  
</div>

<div class="row">
    <div class="col is-vertical-align">&nbsp;</div>
</div>


<style>

</style>