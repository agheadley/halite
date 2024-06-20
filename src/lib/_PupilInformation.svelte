<script>
// @ts-nocheck

import {cycles,assessments,groups,config,pupils,alert} from '$lib/store';
import { onMount } from 'svelte';
import * as html from '$lib/html.js';
import * as util from '$lib/util.js';
import Cell from '$lib/_Cell.svelte';
import AssessmentTitle from '$lib/_AssessmentTitle.svelte';


/** @type {{cIndex:number,view:{context:'overview'|'parent'|'pupil',chance:boolean,fb:boolean,rag:boolean,n:boolean},data:any,detail:{r:number,c:number,edit:boolean,show:boolean,gd:string,assessment:any,_id:string,pc:number,t:number[]}}}*/
let status= {
    cIndex:0,
    view:{context:'overview',chance:true,fb:true,rag:true,n:true},
    data:{
        cycle:{tt:'',ts:'',y:0,txt:''},
        pupil:{id:0,sn:'',pn:'',pid:0,tg:'',hse:'',fm:null},
        A:[],
        E:[],
        P:[]
    },
    detail:{show:false,gd:'',assessment:{},_id:'',pc:0,t:[],edit:false}
};

/** @type {{pid:number,id:string,pn:string,sn:string,fm:number|null,hse:string,tg:string}}*/
export let data;

/** @type {string} */
export let user;



let getReport=async()=> {

console.log('building report for ',data.pid);

/** @type {{
 cycle:{tt:string,ts:string,y:number,txt:string},
    pupil:{sn:string,pn:string,pid:number,id:string,hse:string,tg:string,fm:number|null},
    A:{title:string,chance:{A:{std:string,grade:{pre:number,gd:string}[],pre:number},B:{std:string,grade:{pre:number,gd:string}[],pre:number}},col:{_id:string,aoid:string,edit:boolean,ds:string,txt:string,gd:string,r:number}[],statement:string|null,report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}[]
    E:{title:string,report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}[],
    P:{title:string,report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}[]
    }
}}*/
let out={
    cycle:{tt:$cycles[status.cIndex].tt,ts:$cycles[status.cIndex].ts,y:$cycles[status.cIndex].y,txt:''},
    pupil:{id:data.id,sn:data.sn,pn:data.pn,pid:data.pid,tg:data.tg,hse:data.hse,fm:data.fm},
    A:[],
    E:[],
    P:[]
};

// get reports
let reports=[];
if(status.cIndex!==null) {
    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'reports',filter:{coid:$cycles[status.cIndex]._id,"pupil.pid":data.pid},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    reports= await response.json();
};
// get groups
/** @type {{g:string,ss:string,sc:string,sl:string,lv:string,yr:number}[]}*/
let gps=$groups.filter(el=>el.pupil.find(element=>(element.pid===data.pid))).map(el=>({g:el.g,ss:el.ss,sc:el.sc,sl:el.sl,lv:el.lv,yr:el.yr}));
console.log(gps);

        


// get cohorts (in case of F7 pupil retaking F6 etc)
/** @type {{lv:string,yr:number}[]}*/
let cohorts=[];
for(let gp of gps) {
    if(!cohorts.find(el=>el.lv===gp.lv && el.yr===gp.yr)) cohorts.push({lv:gp.lv,yr:gp.yr});
}
console.log(cohorts);

// get results
let response = await fetch('/edge/read', {
    method: 'POST',
    body: JSON.stringify({collection:'results',filter:{pid:data.pid} ,projection:{_id:1,pid:1,aoid:1,sc:1,sl:1,ss:1,gd:1,scr:1,pc:1,t:1,fb:1,lv:1,yr:1}}),
    headers: {'content-type': 'application/json'}
});
let results= await response.json();
console.log(results);

// get grades,view context and standards (assume same lv even if two cohorts!)
$config.grade=$config.grade.sort((/** @type {{ sc: string; pre: number; }} */ a,/** @type {{ sc: any; pre: number; }} */ b)=>a.sc.localeCompare(b.sc) || b.pre-a.pre);

        
// build academic reports
for(let gp of gps) {
   let r=[];
   let s='';
    if(status.cIndex!==null) {
        let res=reports.find((/** @type {{ ss: string; sc: string; ci: any; author: { type: string; }; }} */ el)=>el.ss===gp.ss && el.sc===gp.sc && el.ci===$cycles[status.cIndex].index && el.author.type==='hod');
        s=res ? res.txt : '';
        res=reports.filter((/** @type {{ ss: string; sc: string; ci: any; author: { type: string; }; }} */ el)=>el.ss===gp.ss && el.sc===gp.sc && el.ci===$cycles[status.cIndex].index && el.author.type==='teacher');
        for(let item of res) {
            r.push(
                {sal:item.author.sal,tid:item.author.tid,ec:item.ec!==null?`${item.ec}/${$config.report.e.default}`:null,ep:item.ep!==null?`${item.ep}/${$config.report.e.default}`:null,txt:item.txt}
            );
        }

    }
   



    let col=[];
    let a=$assessments.filter((el)=>el.tag.archive===false && el.tag[status.view.context]===true && el.sc===gp.sc && el.ss===gp.ss && el.yr===gp.yr && el.lv===gp.lv)
        .sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>a.dt-b.dt);
    for(let assessment of a) {
        //console.log(a);
        let f=results.find((/** @type {{ aoid: any; }} */ el)=>el.aoid===assessment._id); 
        col.push({txt:assessment.n,ds:assessment.ds,t:f?f.t:[],pc:f?f.pc:0,gd:f?f.gd:'X',r:0,_id:f?f._id:'',aoid:f?f.aoid:'',edit:assessment.tag.pupiledit && assessment.tag.open?true:false});
    }
    let gds=$config.grade.filter((/** @type {{ sc: any; }} */ el)=>el.sc===gp.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
    //console.log(gp,gds,col);
    if(col[0]) {
        let  s1=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===col[0].gd);
        for(let c of col) {
            let s2=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===c.gd); 
            c.r = s1>-1 && s2>-1 ? s1-s2 : 0; 
        }
    }
   

    let std={A:'',B:''};
    if(gp.lv==='US') std=$config.std.US;
    else if(gp.lv==='MS') std=$config.std.MS;
    else if(gp.lv==='LS') std=$config.std.LS;
    
    
    let chance={
        A:{std:std.A,grade:gds.map((/** @type {{ gd: any; pre: any; }} */ el)=>({gd:el.gd,pre:el.pre})),pre:0},
        B:{std:std.B,grade:gds.map((/** @type {{ gd: any; pre: any; }} */ el)=>({gd:el.gd,pre:el.pre})),pre:0}
    };


    /** @type {any}*/
    let f=$pupils.find(el=>el.pid===data.pid);
    if(f) {
        /** @type {any}*/
        let x=f.groups.find((/** @type {{ g: string; }} */ el)=>el.g===gp.g);
        if(x && x.pre) {
            chance.A.pre=x.pre.A;
            chance.B.pre=x.pre.B;
        }
    }

  
    


    out.A.push({
        title:`${gp.sl} (${gp.sc})`,
        col:col,
        chance:chance,
        statement:s,
        report:r
    });

    } // end of for groups
            

    if(status.cIndex!==null) {

         // add enrichment reports
        let p=reports.filter((/** @type {{ type: string; }} */ el)=>el.type==='E');
        for(let item of p) {
            out.E.push({
                title:item.sl,report:[{sal:item.author.sal,tid:item.author.tid,ec:item.ec!==null?`${item.ec}/${$config.report.e.default}`:null,ep:item.ep!==null?`${item.ep}/${$config.report.e.default}`:null,txt:item.txt}]
            });
        }
        out.E=out.E.sort((a,b)=>a.title.localeCompare(b.title));

        // add pastoral reports
        p=reports.filter((/** @type {{ type: string; }} */ el)=>el.type==='P');
        for(let item of p) {
            out.P.push({
                title:(item.author.type==='hm' ? 'housemaster' : item.author.type).toUpperCase(),report:[{sal:item.author.sal,tid:item.author.tid,ec:item.ec!==null?`${item.ec}/${$config.report.e.default}`:null,ep:item.ep!==null?`${item.ep}/${$config.report.e.default}`:null,txt:item.txt}]
            });
        }
        out.P=out.P.sort((a,b)=>a.title.localeCompare(b.title));





    }
   


    // use html.js functions to generate reports!!!!

    console.log(out);
    return out;

};

/**
 * 
 * @param {number} rowIndex
 * @param {number} colIndex
 */
 let showDetail=async(rowIndex,colIndex)=>{
    console.log(status.data.A[rowIndex].col[colIndex]);
    status.detail.r=rowIndex;
    status.detail.c=colIndex;

    //status.detail.assessment=$assessments.find(el=>el._id===status.data.A[rowIndex].col[colIndex].aoid);

    let response = await fetch('/edge/read', {
    method: 'POST',
    body: JSON.stringify({collection:'assessments',filter:{"_id":{"$oid":status.data.A[rowIndex].col[colIndex].aoid}} ,projection:{}}),
    headers: {'content-type': 'application/json'}
    });
    let res= await response.json();
    if(res[0]) status.detail.assessment=res[0];

    console.log(res);

    console.log(status.detail);

    status.detail.edit=status.data.A[rowIndex].col[colIndex].edit;
    status.detail.gd=status.data.A[rowIndex].col[colIndex].gd;
    status.detail.pc=status.data.A[rowIndex].col[colIndex].pc;
    status.detail.t=status.data.A[rowIndex].col[colIndex].t;
    
    status.detail._id=status.data.A[rowIndex].col[colIndex]._id;
    status.detail.show=true;


};


let validateGrade=()=>{
    if(status.detail?.assessment?.sc!=='') {
        let gds=$config.grade.filter(el=>el.sc===status.detail.assessment.sc).map(el=>el.gd);
        if(!gds.includes(status.detail.gd)) status.detail.gd='';
    }
    
};

let blurGrade=async()=>{
    let x={gd:'X',scr:0,pc:0};
    if(status.detail.gd!=='') {
        let gds=$config.grade.filter(el=>el.sc===status.detail.assessment.sc);
        let f=gds.find(el=>el.gd===status.detail.gd);
       
        if(f) {
            x.gd=status.detail.gd;
            x.scr=f.scr;
            x.pc=x.pc;
        }
    }
    status.data.A[status.detail.r].col[status.detail.c].gd=status.detail.gd;
    status.data=status.data;

    console.log('blurGrade',x);

    let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({
                collection:'results',
                filter:{"_id":{"$oid":status.detail._id }},
                update:{
                    gd:status.detail.gd,
                    scr:x.scr,
                    pc:x.pc,
                    log:`${user}|${util.getDate()}`
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
    /** @type {any}*/
    let cycs=$cycles.filter((el)=>el.publish===true).sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>b.index-a.index);
    status.cIndex = cycs[0]? cycs[0].index : null; 
    

    let f=$config.view.find((/** @type {{ context: string; }} */ el)=>el.context==='overview');
    status.view={context:'overview',chance:f?f.chance:false,fb:f?f.fb:false,rag:f?f.rag:false,n:f?f.n:false};


    status.data=await getReport();
});

</script>

<div class="row">
    <div class="col is-vertical-align">
        <h4>{status.data.pupil.pn} {status.data.pupil.sn}</h4>
    </div>
    <div class="col is-vertical-align">
        {status.data.pupil.fm!==null ? 'F'+status.data.pupil.fm : ''} {status.data.pupil.hse}
    </div>
</div>
<hr/>

{#if status.detail.show}
    <div class="row">
        <div class="col">
            <h4>{status.detail.assessment.sl} <span class="tag">{status.detail.assessment.n} {status.detail.assessment.ds}</span></h4>
        </div>
        <div class="col">
            <button class="button outline" on:click={()=>status.detail.show=false}>Back</button>
        </div>
        
    </div>
    <div class="row">
        <div class="col">
            {#if status.detail.assessment.tag.grade}
            {#if status.detail.edit}

                GRADE <input  type=text bind:value={status.detail.gd} on:input={validateGrade} on:blur={blurGrade}/>
           
            {:else}
                GRADE <span class="bold">{status.detail.gd}</span>
            {/if}
            
            {:else}
            GRADE <span class="bold">{status.detail.gd}</span>
                (<span class="bold">{status.detail.pc}</span>%)
            {/if}
        </div>
    </div>

    {#if !status.detail.assessment.tag.grade}
           
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
                    {#each status.detail.assessment.total as row,rowIndex}
                    <tr>
                        <td>{row.n}</td>
                        <td>{status.detail.t[rowIndex]}/{row.t}</td>
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
                    {#each status.detail.assessment.grade as row,rowIndex}
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


{#if !status.detail.show}

{#each status.data.A as row,rowIndex}
    <section style="break-inside:avoid;">
	<div class="row"><div class="col">
            <span class="bold">{row.title}<span>
    </div></div>

    <div class="row">
        <div class="col">
            <table><tbody><tr>
            
           {#each row.col as col,colIndex}
           <td>
                <div>
                    {#if status.view.n}
                        <AssessmentTitle title={col.txt} subtitle={col.ds}/>
                    {:else}
                    <span class="small">{col.ds}</span>
                    {/if}    
                </div>
                <div>
                    {#if col.edit}
                        <a href={'#'} on:click={()=>showDetail(rowIndex,colIndex)} on:keydown={()=>showDetail(rowIndex,colIndex)} class="button clear icon-only">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </a>
        
                    {:else}

                        <a href={'#'} on:click={()=>showDetail(rowIndex,colIndex)} on:keydown={()=>showDetail(rowIndex,colIndex)} class="button clear icon-only"> 
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </a>

                    {/if}
                </div>
                <Cell color={status.view.rag} residual={col.r}>{col.gd}</Cell>
            </td>
           {/each}
            </tr></tbody></table>
        </div>
        <div class="col">
            {#if status.view.chance}
            <div class="report-information-left">
                <div><span class="tag">{row.chance.A.std}</span></div>
                <div>{@html html.getChance(row.chance.A)}</div>
                <div><span class="tag">{row.chance.B.std}</span></div>
                <div>{@html html.getChance(row.chance.B)}</div>
            </div>
            {/if}
        </div>
            
     
    </div>

    <div class="row">
        <div class="col">
            <div class="report-information-right"><span class="bold">{status.data.cycle.tt} {status.data.cycle.ts} {status.data.cycle.y}</span></div>
            <div class="statement-txt">{row.statement}</div>
            {#each row.report as item,itemIndex}
            {#if item.txt!==null && item.txt!==''}
                <div class="report-txt">{item.txt}</div>

            {/if}
            <div class="report-information"><div><span>{item.sal}</span></div><div><span class="tag">EFFORT {item.ec===null ? '' : `CLASS ${item.ec}`} {item.ep===null ? '' : `PREP ${item.ep}`}</span></div></div>

            {/each}
 
        </div>
	
    </div>


<hr/>
</section>

{/each}

{#each status.data.E as row,rowIndex}
    <section style="break-inside:avoid;">
        <div class="row"><div class="col">

        <div class="report-information">
            <div><span class="bold">{row.title}<span></div>
            <div></div>
        </div>
	
        {#each row.report as col,colIndex}
				<div class="report-txt">{#if col.txt!==null && col.txt!==''}{col.txt}{/if}</div>
		        <div class="report-information"><div><span>{col.sal}</span></div><div></div></div>
        {/each}
	
	    </div></div>
        </section>
	
{/each}
<hr/>
	    

{#each status.data.P as row,rowIndex}
    <section style="break-inside:avoid;">
        <div class="row"><div class="col">

        <div class="report-information">
            <div><span class="bold">{row.title}<span></div>
            <div></div>
        </div>
	
        {#each row.report as col,colIndex}
				<div class="report-txt">{#if col.txt!==null && col.txt!==''}{col.txt}{/if}</div>
		        <div class="report-information"><div><span>{col.sal}</span></div><div></div></div>
        {/each}
	
	    </div></div>
        </section>
	
{/each}

{/if}

<style>

.report-information-left {
    display:flex;
    flex-direction:row;
    justify-content:start;
    width:100%;
    padding-bottom:0.25rem;
    padding-top:0.25rem;  
}

.report-information-right {
    display:flex;
    flex-direction:row;
    justify-content:end;
    width:100%;
    padding-bottom:0.25rem;
    padding-top:0.25rem;  
}
.statement-txt {
    background: white;
    padding:0.2rem;
    border-radius:0.5rem;
    
}

.report-txt {
    background: rgba(51,51,51,0.1);
    padding:0.2rem;
    border-radius:0.5rem;
    
}

.report-information {
    display:flex;
    flex-direction:row;
    justify-content:space-between;
    width:100%;
    padding-bottom:0.25rem;
    padding-top:0.25rem;  
}


.bold {font-weight:600;}

.small {font-size:1.2rem;}

</style>

