<script>

import { onMount } from 'svelte';
import {config,location,alert,assessments,cycles} from '$lib/store';
import * as html from '$lib/html';
import * as util from '$lib/util';
import AssessmentTitle from '$lib/_AssessmentTitle.svelte';
import Cell from '$lib/_Cell.svelte';
import Modal from '$lib/_Modal.svelte';


let selection={context:'pupil',pid:0,index:0};

/** @type {any}*/
let report = {
    cycle:{tt:'',ts:'',y:0,txt:'',index:0},
    pupil:{id:'',sn:'',pn:'',pid:selection.pid,tg:'',hse:'',fm:null},
    A:[],
    E:[],
    P:[]
};

/** @type {{context:string,n:boolean,rag:boolean,chance:boolean,fb:boolean}}*/
let view;


/** @type {any}*/
let detail={show:false,r:0,c:0,grade:[],total:[],sc:'',tag:{grade:false}};


/** @type {any}*/
export let data;

let getReport=async()=>{

    console.log(`getReports()`);

selection.pid=Number(data.user.name);

// get cycles
let cycs=$cycles.filter(el=>el.publish===true).sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>b.index-a.index);


// get context info
let f=$config.view.find((/** @type {{ context: string; }} */ el)=>el.context===selection.context);
view=f?{context:f.context,fb:f.fb,n:f.n,rag:f.rag,chance:f.chance}:{context:'pupil',fb:false,n:true,rag:false,chance:false};

// populate cycle, pupil of report obj
if(cycs[0]) report.cycle={tt:cycs[0]?cycs[0].tt:'',ts:cycs[0]?cycs[0].ts:'',y:cycs[0]?cycs[0].y:0,txt:'',index:cycs[0].index};
    



//console.log(report);

// get reports
let reports=[];
if(cycs[0]) {
    console.log('getting reports',cycs[0],cycs[0]._id,selection.pid);
    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'reports',filter:{coid:cycs[0]._id,"pupil.pid":selection.pid},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    reports= await response.json();
    console.log(reports);
};
// get groups
let response = await fetch('/edge/read', {
    method: 'POST',
    body: JSON.stringify({collection:'groups',filter:{"pupil.pid":selection.pid},projection:{"pupil.$":1,g:1,_id:1,sc:1,sl:1,ss:1,dt:1,dl:1,ds:1,n:1,tag:1,lv:1,yr:1}}),
    headers: {'content-type': 'application/json'}
});
let groups= await response.json();
console.log(groups);

report.pupil=groups[0] ? {id:groups[0].pupil[0].id,sn:groups[0].pupil[0].sn,pn:groups[0].pupil[0].pn,pid:selection.pid,tg:groups[0].pupil[0].tg,hse:groups[0].pupil[0].hse,fm:''} : {id:'',sn:'',pn:'',pid:selection.pid,tg:'',hse:'',fm:''};
/*
let fPupil=$pupils.find((el)=>el.pid===selection.pid);
if(fPupil) report.pupil={id:fPupil.id,sn:fPupil.sn,pn:fPupil.pn,pid:fPupil.pid,tg:'',hse:fPupil.hse,fm:''};
*/


/** @type {{g:string,ss:string,sc:string,sl:string,lv:string,yr:number}[]}*/
let gps=groups.map((/** @type {{  g: any; ss: any; sc: any; sl: any; lv: any; yr: any; }} */ el)=>({g:el.g,ss:el.ss,sc:el.sc,sl:el.sl,lv:el.lv,yr:el.yr}));
//console.log(reports,gps);

// get results
response = await fetch('/edge/read', {
    method: 'POST',
    body: JSON.stringify({collection:'results',filter:{pid:selection.pid} ,projection:{_id:1,pid:1,aoid:1,sc:1,sl:1,ss:1,gd:1,scr:1,pc:1,t:1,fb:1,lv:1,yr:1}}),
    headers: {'content-type': 'application/json'}
});
let results= await response.json();
//console.log(results);

$config.grade=$config.grade.sort((/** @type {{ sc: string; pre: number; }} */ a,/** @type {{ sc: any; pre: number; }} */ b)=>a.sc.localeCompare(b.sc) || b.pre-a.pre);

// build academic reports
for(let gp of gps) {
    let r=[];
    let s='';
    if(cycs[0]) {
        let res=reports.find((/** @type {{ ss: string; sc: string; ci: any; author: { type: string; }; }} */ el)=>el.ss===gp.ss && el.sc===gp.sc && el.ci===cycs[0].index && el.author.type==='hod');
        s=res ? res.txt : '';
        res=reports.filter((/** @type {{ ss: string; sc: string; ci: any; author: { type: string; }; }} */ el)=>el.ss===gp.ss && el.sc===gp.sc && el.ci===cycs[0].index && el.author.type==='teacher');
        for(let item of res) {
            r.push(
                {sal:item.author.sal,tid:item.author.tid,ec:item.ec!==null?`${item.ec}/${$config.report.e.default}`:null,ep:item.ep!==null?`${item.ep}/${$config.report.e.default}`:null,txt:item.txt}
            );
        }

    }
    

    //console.log(gp,assessments);

    let col=[];
    // @ts-ignore
    let a=$assessments.filter((el)=>el.tag.archive===false && (el.tag.pupiledit===true || el.tag[view.context]===true) && el.sc===gp.sc && el.ss===gp.ss && el.yr===gp.yr && el.lv===gp.lv)
        .sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>a.dt-b.dt);
    for(let assessment of a) {
        //console.log(a);
        let f=results.find((/** @type {{ aoid: any; }} */ el)=>el.aoid===assessment._id); 
        col.push({txt:assessment.n,ds:assessment.ds,t:f?f.t:[],pc:f?f.pc:0,gd:f?f.gd:'X',r:0,_id:f?f._id:'',aoid:f?f.aoid:'',edit:assessment.tag.pupiledit && assessment.tag.open?true:false,fb:f?f.fb:''});
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

    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'intake',filter:{pid:selection.pid} ,projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    let intake= await response.json();
    //console.log(intake);

    /** @type {any}*/
    if(intake[0]) {
        /** @type {any}*/
        // @ts-ignore
        let x=intake.find((el)=>el.lv===gp.lv && el.yr===gp.yr);
        //console.log(x);
        if(x && x.pre[0]) {
            //console.log(chance);
            let p=x.pre.find((/** @type {{ sc: string; ss: string; }} */ el)=>el.sc===gp.sc && el.ss===gp.ss);
            chance.A.pre=p?p.A:0;
            chance.B.pre=p?p.B:0;
        }
    }

    
    


    report.A.push({
        title:`${gp.sl} (${gp.sc})`,
        col:col,
        chance:chance,
        statement:s,
        report:r
    });

    } // end of for groups
            

    if(cycs[0]) {

            // add enrichment reports
        let p=reports.filter((/** @type {{ type: string; }} */ el)=>el.type==='E');
        for(let item of p) {
            report.E.push({
                title:item.sl,report:[{sal:item.author.sal,tid:item.author.tid,ec:item.ec!==null?`${item.ec}/${$config.report.e.default}`:null,ep:item.ep!==null?`${item.ep}/${$config.report.e.default}`:null,txt:item.txt}]
            });
        }
        report.E=report.E.sort((/** @type {{ title: string; }} */ a,/** @type {{ title: any; }} */ b)=>a.title.localeCompare(b.title));

        // add pastoral reports
        p=reports.filter((/** @type {{ type: string; }} */ el)=>el.type==='P');
        for(let item of p) {
            let title='';
            if(item.author.type==='hm') title='housemaster';
            if(item.author.type==='tutor') title='tutor';
            if(item.author.type==='xsa') title='pupil self-assessment';
            report.P.push({
                
                title:title.toUpperCase(),report:[{sal:item.author.sal,tid:item.author.tid,ec:item.ec!==null?`${item.ec}/${$config.report.e.default}`:null,ep:item.ep!==null?`${item.ep}/${$config.report.e.default}`:null,txt:item.txt}]
            });
        }
        report.P=report.P.sort((/** @type {{ title: string; }} */ a,/** @type {{ title: any; }} */ b)=>b.title.localeCompare(a.title));





    }

    
    console.log(report);
    detail.show=false;


};



let validateGrade=()=>{
    console.log(report.A[detail.r].col[detail.c]);
    if(detail.sc!=='') {
        let gds=$config.grade.filter((/** @type {{ sc: any; }} */ el)=>el.sc===detail.sc).map((/** @type {{ gd: any; }} */ el)=>el.gd);
        if(!gds.includes(report.A[detail.r].col[detail.c].gd)) report.A[detail.r].col[detail.c].gd='';
    }
    
};

let blurGrade=async()=>{
    let x={gd:'X',scr:0,pc:0};
    if(report.A[detail.r].col[detail.c].gd!=='') {
        let gds=$config.grade.filter((/** @type {{ sc: any; }} */ el)=>el.sc===detail.sc);
        let f=gds.find((/** @type {{ gd: string; }} */ el)=>el.gd===report.A[detail.r].col[detail.c].gd);
       
        if(f) {
            x.gd=report.A[detail.r].col[detail.c].gd
            x.scr=f.scr;
            x.pc=x.pc;
        }

        let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({
                collection:'results',
                filter:{"_id":{"$oid":report.A[detail.r].col[detail.c]._id }},
                update:{
                    gd:x.gd,
                    scr:x.scr,
                    pc:x.pc,
                    log:`${data.user.name}|${util.getDateTime()}`
                }
            }),
		    headers: {'content-type': 'application/json'}
	    });
        let res= await response.json();
        console.log(res);
        if(res.matchedCount!==1) {
            $alert.type='error';
            $alert.msg=`Error updating result`;
        } else  $alert.msg=`Grade saved`; 




    }

};

    
/**
 * 
 * @param {number} r
 * @param {number} c
 */
    let showDetail=(r,c)=>{
    //console.log(report.A[r].col[c]);
    detail.r=r;
    detail.c=c;
    detail.show=true;
};

let getDetail=async()=>{
    //console.log('getting details ...');
    let aoid=report.A[detail.r].col[detail.c].aoid;
    
    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'assessments',filter:{"_id":{"$oid":aoid}} ,projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    let res= await response.json();
    let assessment=res[0] ? res[0] : null;
    if(assessment!==null) {
        detail.grade=assessment.grade;
        detail.total=assessment.total;
        detail.tag.grade=assessment.tag.grade;
        detail.sc=assessment.sc;

    }

    //console.log(assessment);



};

onMount(async () => {
    console.log(data.user);
    //await getReport();

});
</script>

<svelte:head>
	<title>Pupil</title>
	<meta name="description" content="Halite" />
</svelte:head>




<Modal bind:open={detail.show}>
    <div class="row">
        <div class="col"><span class="tag">{report.A[detail.r].title}</span><span class="bold">{report.A[detail.r].col[detail.c].txt} {report.A[detail.r].col[detail.c].ds}</span></div>
        <div class="col"><button class="button outline" on:click={()=>detail.show=false}>Close</button> </div>
    </div>
    {#await getDetail()}
    <div class="row">
        <div class="col">Finding assessment data</div>
    </div>
    {:then}
        <div class="row">
            <div class="col">
                GRADE
            </div>
            <div class="col">
                {#if report.A[detail.r].col[detail.c].edit}
                <input  type=text bind:value={report.A[detail.r].col[detail.c].gd} on:input={validateGrade} on:blur={blurGrade}/>
                {:else}
                    <span class="bold">{report.A[detail.r].col[detail.c].gd}</span>{#if !detail.tag.grade}&nbsp;&nbsp;({report.A[detail.r].col[detail.c].pc} %){/if}
                {/if}
                  
            </div>
        </div>
        {#if view.fb && report.A[detail.r].col[detail.c].fb}
        <div class="row">
            <div class="col">
                <span class="tag">Feedback</span><p>{report.A[detail.r].col[detail.c].fb}</p>
            </div>
        </div>
        {/if}
        {#if !detail.tag.grade}
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
                        {#each detail.total as row,rowIndex}
                        <tr>
                            <td>{row.n}</td>
                            <td>{report.A[detail.r].col[detail.c].t[rowIndex]}/{row.t}</td>
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
                        {#each detail.grade as row,rowIndex}
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
    {:catch error}
    <div class="row">
        <div class="col">Error finding assessment</div>
    </div>
    {/await}
    
</Modal>





{#await getReport()}
<div class="row">
    <div class="col">Harvesting pupil data ...</div>
</div>
{:then}
<!-- main report here-->

<div class="row">
    <div class="col">
        <h4>{report.pupil.pn} {report.pupil.sn}</h4>
    </div>
    <div class="col">
    </div>
</div>

<hr/>

{#each report.A as row,rowIndex}

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
                {#if view.n}
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
            <Cell color={true} residual={col.r}>{col.gd}</Cell>
        </td>
       {/each}
        </tr></tbody></table>
    </div>
    <div class="col">
       <!--{#if view.chance}-->
        <div class="report-information-left">
            <div><span class="tag">{row.chance.A.std}</span></div>
            <div>{@html html.getChance(row.chance.A)}</div>
            <div><span class="tag">{row.chance.B.std}</span></div>
            <div>{@html html.getChance(row.chance.B)}</div>
        </div>
        <!--{/if}-->
    </div>
        
 
</div>

<div class="row">
    <div class="col">
        {#if row.report[0]}
        <div class="report-information-right"><span class="bold">{report.cycle.tt} {report.cycle.ts} {report.cycle.y}</span></div>
        {/if}
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

{#if report.E[0]}
<div class="report-information-right"><span class="bold">{report.cycle.tt} {report.cycle.ts} {report.cycle.y}</span></div>        
{/if}
{#each report.E as row,rowIndex}
{@html html.getItem(row)}
{/each}

{#if report.P[0]}
<hr/>
<div class="report-information-right"><span class="bold">{report.cycle.tt} {report.cycle.ts} {report.cycle.y}</span></div>        
{/if}
{#each report.P as row,rowIndex}
{@html html.getItem(row)}
{/each}





<!-- / main report-->
{:catch error}
<div class="row">
    <div class="col">Error finding data</div>
</div>
{/await}

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