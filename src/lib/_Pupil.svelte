<script>

import { onMount } from 'svelte';
import AssessmentTitle from '$lib/_AssessmentTitle.svelte';

import Cell from '$lib/_Cell.svelte';
import Chance from '$lib/_Chance.svelte';
import Report from '$lib/_Report.svelte';
import {alert} from '$lib/store';
import * as util from '$lib/util';



/** @type {{pid:number,sn:string,pn:string,gnd:string,hse:string,tg:string,lv:string,yr:number,context:string}}*/ 
export let status;

/** @type {any}*/
let data={
    groups:[],
    assessments:[],
    results:[],
    intake:{},
    table:[],
    std:{A:'',B:''},
    detail:{n:'',ds:'',gd:'',pc:0,scr:0,dt:0,tag:{},fb:'',grade:[],total:[]},
    dIndex:0,
    view:{context:'',rag:false,chance:false,fb:false}
};

/* inner modal for boundaries/totals/feedback */
/** @type {boolean} */
let detail = false;

 /** @type {any} */
 let cfg= [];



/**
 * 
 * @param {number} rowIndex
 * @param {number} colIndex
 */
let showDetail=(rowIndex,colIndex)=>{
    data.detail=data.table[rowIndex].col[colIndex];
    data.dIndex=rowIndex;
    detail=true;
};

let validateGrade=()=>{
    console.log(data.detail);
    if(!data.detail.grade.find((/** @type {{ gd: any; }} */ el)=>el.gd===data.detail.gd)) {
        data.detail.gd='';
    }
};

let blurGrade=async()=>{
    let x={gd:'X',scr:0,pc:0};
    if(data.detail.gd!=='') {
        let f=data.detail.grade.find((/** @type {{ gd: any; }} */ el)=>el.gd===data.detail.gd);
        if(f) {
            x.gd=data.detail.gd;
            x.scr=f.scr;
            x.pc=x.pc;
        }
    } 

    console.log('blurGrade',x);

    let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({
                collection:'results',
                filter:{"_id":{"$oid": data.detail._id}},
                update:{
                    gd:data.detail.gd,
                    scr:x.scr,
                    pc:x.pc,
                    log:`${status.pid}|${util.getDate()}`
                }
            }),
		    headers: {'content-type': 'application/json'}
	    });
    let res= await response.json();
    console.log(res);
    if(res.matchedCount!==1) {
        $alert.type='error';
        $alert.msg=`Error updating result`;
    } else  $alert.msg=`Modified ${res.modifiedCount} result`; 

};



onMount(async () => {
    
    console.log('_Pupil.svelte mounted');


    /*get published report cycles*/
    let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'cycles',filter:{publish:true},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
    let res= await response.json();
    console.log(res);

    let cycles=res[0] ? res.map((/** @type {{ index: any; }} */ el)=>el.index) :[];
    //console.log(cycles);
    cycles = cycles[0]!==undefined ? cycles.sort((/** @type { number} */ a,/** @type { number } */ b)=>b-a) : [];
    console.log('publish cycles',cycles);

     /*get published reports for pupil*/
     response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',filter:{"pupil.pid":status.pid},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
     res= await response.json();
     console.log('found reports',res);

     let publishedReports=res[0] && cycles[0]!==undefined ? res.filter((/** @type {{ ci: any; }} */ el)=>cycles.includes(el.ci)) : [];
     console.log('published reports',publishedReports);
     




   
     /* get cfg */
     response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'config',filter:{},projection:{_id:0}}),
        headers: {'content-type': 'application/json'}
    });
    res= await response.json();
    
    cfg=res[0] ? res[0] : [];

    /** sort grades top-bottom so that chances graphs are displayed properly */
    cfg.grade=cfg.grade.sort((/** @type {{ sc: string; pre: number; }} */ a,/** @type {{ sc: any; pre: number; }} */ b)=>a.sc.localeCompare(b.sc) || b.pre-a.pre);

    /* get CEM stds */
    if(status.lv==='US') data.std={A:cfg.std.US.A,B:cfg.std.US.B};
    else if (status.lv==='MS') data.std={A:cfg.std.MS.A,B:cfg.std.MS.B};
    else if (status.lv==='LS') data.std={A:cfg.std.LS.A,B:cfg.std.LS.B};

    /* set context for rag and chances graphs view */
    let c=cfg.view.find((/** @type {{ context: string; }} */ el)=>el.context===status.context);

    if(c) data.view=c;
  
   
    /* get groups */
    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'groups',filter:{"pupil.pid":status.pid,lv:status.lv,yr:status.yr} ,projection:{g:1,sc:1,sl:1,ss:1}}),
        headers: {'content-type': 'application/json'}
    });
    res= await response.json();
    data.groups = res[0] ? res.sort((/** @type {{ sl: string; }} */ a,/** @type {{ sl: any; }} */ b)=>a.sl.localeCompare(b.sl)) : [];
    //console.log(data.groups);

    /* get assessments by status.context */
    
    /* testing */
    //status.context='parent';
    
    /** @type {any}*/
    let filter={"tag.archive":false,lv:status.lv,yr:status.yr};
    if(status.context==='overview') filter["tag.overview"]=true;
    if(status.context==='pupil') filter["tag.pupil"]=true;
    if(status.context==='parent') filter["tag.parent"]=true;
    //console.log(filter);
    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'assessments',filter:filter ,projection:{g:1,sc:1,sl:1,ss:1,dt:1,ds:1,total:1,grade:1,n:1,tag:1}}),
        headers: {'content-type': 'application/json'}
    });
    res= await response.json();
    data.assessments=res[0] ? res.sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>a.dt-b.dt) : [];
    //console.log(data.assessments);
    
    /* get results by status.pid */
    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'results',filter:{pid:status.pid,lv:status.lv,yr:status.yr} ,projection:{_id:1,pid:1,aoid:1,sc:1,sl:1,ss:1,gd:1,scr:1,pc:1,t:1,fb:1}}),
        headers: {'content-type': 'application/json'}
    });
    data.results= await response.json();

     /* get intake by status.pid */
     response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'intake',filter:{pid:status.pid,lv:status.lv,yr:status.yr} ,projection:{pid:1,base:1,pre:1}}),
        headers: {'content-type': 'application/json'}
    });
    res= await response.json();
    data.intake=res[0] && res[0].pre ? res[0].pre : [];

    console.log(data.intake);
    /* build table with n,ds,gd,pc, grade (assesment.grade),total (t,assessment totals) vs ss,sl,sc from groups */

    for(let group of data.groups) {
       

        let col=[];
        for(let assessment of data.assessments.filter((/** @type {{ sc: any; ss: any; }} */ el)=>el.sc===group.sc && el.ss===group.ss)) {
            let f=data.results.find((/** @type {{ aoid: any; }} */ el)=>el.aoid===assessment._id);
            
            /** @type {any[]} */
            let total=[];
            assessment.total.forEach((/** @type {{ n: any; t: any; w: any; }} */ item,/** @type {string | number} */ i)=>{total.push({scr:f&&f.t[i] ? f.t[i] : 0,n:item.n,t:item.t,w:item.w})});
            let a={ss:assessment.ss,sc:assessment.sc,gd:f?f.gd:'X',scr:f?f.scr:0,pc:f?f.pc:0,r:0,_id:f?f._id:'',n:assessment.n,ds:assessment.ds,dt:assessment.dt,grade:assessment.grade,total:total,tag:assessment.tag,fb:f?f.fb:''}
            
            col.push(a);
        }
        let f=data.intake.find((/** @type {{ sc: any; ss: any; }} */ el)=>el.sc===group.sc && el.ss===group.ss);

        let gds=cfg.grade.filter((/** @type {{ sc: any; }} */ el)=>el.sc===group.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
       
        
        let  s1=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===col[0].gd);
        for(let c of col) {
            let s2=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===c.gd); 
            c.r = s1>-1 && s2>-1 ? s1-s2 : 0; 
        }

        /* get academic reports */

        /**
         * @typedef {{ci:number,title:string,type:'teacher'|'hod',sc:string,sl:string,ss:string,sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}} Report 
         * @type {{current:Report[],past:Report[]}}
         * */
        let report={current:[],past:[]};

       
        
        console.log(publishedReports[0],cycles[0]);
        if(publishedReports[0] && cycles[0]!==undefined) {
             // current report
            let t=publishedReports.filter((/** @type {{ ci: any; ss: any; sc: any; author: { type: string; }; }} */ el)=>el.ci===cycles[0] && el.ss===group.ss && el.sc===group.sc && el.author.type==='teacher');
            //t=t[0] ? t.sort((a,b)=b.ci-a.ci || a.author.tid.localeCompare(b.author.tid)) : [];
            let h=publishedReports.find((/** @type {{ ci: any; ss: any; sc: any; author: { type: string; }; }} */ el)=>el.ci===cycles[0] && el.ss===group.ss && el.sc===group.sc && el.author.type==='hod');
            if(h) report.current.push({ci:h.ci,title:`${h.tt} ${h.ts} ${h.y}`,type:'hod',sl:group.sl,sc:h.sc,ss:h.ss,sal:h.author.sal,tid:h.author.tid,ec:h.ec,ep:h.ep,txt:h.txt});
            for(let x of t) {
                report.current.push({ci:x.ci,title:`${x.tt} ${x.ts} ${x.y}`,type:'teacher',sl:group.sl,sc:x.sc,ss:x.ss,sal:x.author.sal,tid:x.author.tid,ec:x.ec,ep:x.ep,txt:x.txt});
            }

            report.current=report.current.sort((a,b)=>a.type.localeCompare(b.type) || a.tid.localeCompare(b.tid) );
            
             // previous reports
            t=publishedReports.filter((/** @type {{ ci: any; ss: any; sc: any; author: { type: string; }; }} */ el)=>el.ci!==cycles[0] && el.ss===group.ss && el.sc===group.sc && el.author.type==='teacher');
            //t=t[0] ? t.sort((a,b)=b.ci-a.ci || a.author.tid.localeCompare(b.author.tid)) : [];
            h=publishedReports.filter((/** @type {{ ci: any; ss: any; sc: any; author: { type: string; }; }} */ el)=>el.ci!==cycles[0] && el.ss===group.ss && el.sc===group.sc && el.author.type==='hod');
            for(let x of h) {
                report.past.push({ci:x.ci,title:`${x.tt} ${x.ts} ${x.y}`,type:'hod',sl:group.sl,sc:x.sc,ss:x.ss,sal:x.author.sal,tid:x.author.tid,ec:x.ec,ep:x.ep,txt:x.txt});
            }
            for(let x of t) {
                report.past.push({ci:x.ci,title:`${x.tt} ${x.ts} ${x.y}`,type:'teacher',sl:group.sl,sc:x.sc,ss:x.ss,sal:x.author.sal,tid:x.author.tid,ec:x.ec,ep:x.ep,txt:x.txt});
            }

            report.past=report.past.sort((a,b)=>b.ci-a.ci || a.type.localeCompare(b.type) || a.tid.localeCompare(b.tid) );



        }
        



        let row={sl:group.sl,ss:group.ss,sc:group.sc,g:group.g,col:col,pre:{A:f?f.A:0,B:f?f.B:0},report:report};
        data.table.push(row);
    }

    console.log(data.table);
       
});



</script>



{#if data.table[0] && data.table.length}

<div class="container">


{#if detail}

            <div class="row">
                <div class="col">
                    <h4>{data.table[data.dIndex].sl} {data.detail.n} {data.detail.ds}</h4>
                </div>
                <div class="col">
                    <button class="button outline" on:click={()=>detail=false}>Back</button>
                </div>
            </div>
           
          
            <div class="row">
                <div class="col">
                    Grade 
                        {#if data.detail.tag.grade && data.detail.tag.open && data.detail.tag.pupiledit}
                        <input  type=text bind:value={data.detail.gd} on:input={validateGrade} on:blur={blurGrade}/>
                        {:else}
                            <span class="bold">{data.detail.gd}</span>
                        {/if}
                        
                        
                </div>
                {#if !data.detail.tag.grade && data.detail.gd!=='X'}
                    <div class="col">
                        {data.detail.pc}%
                    </div>
                {/if}
            </div>

            {#if data.detail.fb!=='' && data.view.fb}
            <div class="row">
                <fieldset id="fb" class="is-full-width">
                    <legend>Feedback</legend>
                        <textarea disabled>{data.detail.fb}</textarea>
                    </fieldset>
            </div>
            {/if}
           
            {#if !data.detail.tag.grade}
            <div class="row">
                <div class="col">
                    <table class="striped small">
                        <thead>
                            <tr>
                                <th>Section</th>
                                <th>Score</th>
                                <th>Weighting</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each data.detail.total as row,rowIndex}
                            <tr>
                                <td>{row.n}</td>
                                <td>{row.scr}/{row.t}</td>
                                <td>{row.w}</td>
                            </tr>
                            {/each}
                          
                        </tbody>
                    </table>
                </div>
           
                <div class="col">
                    <table class="striped small">
                        <thead>
                            <tr>
                                <th>Grade</th>
                                <th> % </th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each data.detail.grade as row,rowIndex}
                            <tr>
                                <td>{row.gd}</td>
                                <td>{row.pc}</td>
                              
                            </tr>
                            {/each}
                          
                        </tbody>
                    </table>
                </div>
            </div>
            {/if}

              

 
{/if}





{#if !detail}

{#each data.table as row,rowIndex}

<table>
    <tbody>
        <tr>
            <th></th>
            {#each row.col as col,colIndex}
            <td> <AssessmentTitle title={col.n} subtitle={col.ds}/></td>
            {/each}
        </tr>
        <tr>
            <td><span class="bold">{row.sl} ({row.sc})</span></td>
            {#each row.col as col,colIndex}

            <td>
                <div>
                    <!--<button on:click={()=>showDetail(rowIndex,colIndex)}></button>-->
                    {#if col.tag.pupiledit && col.tag.grade && col.tag.open}
                    <a href={'#'} on:click={()=>showDetail(rowIndex,colIndex)} on:keydown={()=>showDetail(rowIndex,colIndex)} class="button clear icon-only">
                         <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </a>
                    {:else}
                      <a href={'#'} on:click={()=>showDetail(rowIndex,colIndex)} on:keydown={()=>showDetail(rowIndex,colIndex)} class="button clear icon-only">
                     
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    </a>
                    {/if}
                    </div>
                <div>
                    <Cell color={data.view.rag} residual={col.r}>{col.gd}</Cell>
                </div>
            </td>
            {/each}
        </tr>
    
    </tbody>
</table>
{#if data.view.chance}


<div class="row">
    &nbsp;
</div>
<div class="row">
    <div class="col">
        <span class="small bold">Chance Graphs</span>
    </div>
    <div class="col">
        <div>
            <span class="tag small">{data.std.A}</span>
        </div>
        <div>
           
            <Chance grades={cfg.grade.filter((/** @type {{ sc: any; }} */ el)=>el.sc===row.sc)} score={row.pre.A ? row.pre.A : 0}/>
        </div>
        </div>
   
    <div class="col">
        <div>
            <span class="tag small">{data.std.B}</span>
        </div>
        <div>
            <Chance grades={cfg.grade.filter((/** @type {{ sc: any; }} */ el)=>el.sc===row.sc)} score={row.pre.B ? row.pre.B : 0}/>
        </div>
    </div>
</div>

{/if} <!--/ chances-->

<Report data={row.report}/>

<hr/>
{/each}

{/if}  <!-- /  !detail-->
</div>
{:else}
<p>harvesting data ...</p>
{/if}







<style>

.bold {
    font-weight:600;

}

.small {
    font-size:1.2rem;
}






</style>
