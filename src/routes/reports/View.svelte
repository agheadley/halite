<script>

import { onMount } from 'svelte';
import {groups,teachers,config,alert,pupils} from '$lib/store';
import * as html from '$lib/html';
import * as util from '$lib/util';
/** @type {any}*/
export let status;

/** @type {any}*/
let data={
    user:'',
    tIndex:0,
    pupils:[],
    all:false,
    cycles:[],
    cIndex:0,
    view:{context:'parent',rag:false,chance:false,fb:false},
    context:'parent',
    assessments:[],
    reports:[],
    print:false
};

let selectAll=()=>{
    for(let item of data.pupils) item.select=data.all;
    data.pupils=data.pupils;
};


let update=async()=>{
        data.user=status.teachers[data.tIndex].tid;

        let response = await fetch('/edge/distinct', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',match:{coid:status.cycle._id,"pupil.tg":data.user},aggregate:['fm','pupil']}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        
        console.log(res);
       
        if(res[0]) {
            data.pupils=[];
            for(let item of res) {
                if(!data.pupils.find((/** @type {{ fm: any; pid: any; }} */ el)=>el.fm===item.fm && el.pid===item.pupil.pid)) {
                    data.pupils.push({pid:item.pupil.pid,sn:item.pupil.sn,pn:item.pupil.pn,tg:item.pupil.tg,hse:item.pupil.hse,fm:item.fm,select:false,report:{}});
                }
            }
            data.pupils=data.pupils.sort((/** @type {{ sn: string; pn: string; }} */ a,/** @type {{ sn: any; pn: any; }} */ b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn) );
        
        } else data.pupils=[];

        console.log(data.pupils);


        /*
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',filter:{type:'P',coid:status.cycle._id,"author.tid":data.user},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        data.reports=res[0] ? res.sort((a,b)=>a.pupil.sn.localeCompare(b.pupil.sn) || a.pupil.pn.localeCompare(b.pupil.pn) ) :[];
        */
        
       


        console.log(data);
    };


    /**
     * 
     * @param {number} pid
     * @param {{pn:string,sn:string,fm:number,hse:string,tg:string}} detail
     */
    let getReport=async(pid,detail)=> {
        console.log('building report for ',pid);

        /** @type {{
         cycle:{tt:string,ts:string,y:number,txt:string},
         pupil:{sn:string,pn:string,pid:number,hse:string,tg:string,fm:number},
         A:{title:string,chance:{A:{std:string,grade:{pre:number,gd:string}[],pre:number},B:{std:string,grade:{pre:number,gd:string}[],pre:number}},col:{ds:string,txt:string,gd:string,r:number}[],statement:string|null,report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}[]
         E:{title:string,report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}[],
         P:{title:string,report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}[]
         }
        }}*/
        let out={
            cycle:{tt:data.cycles[data.cIndex].tt,ts:data.cycles[data.cIndex].ts,y:data.cycles[data.cIndex].y,txt:''},
            pupil:{sn:detail.sn,pn:detail.sn,pid:pid,tg:detail.tg,hse:detail.hse,fm:detail.fm},
            A:[],
            E:[],
            P:[]
        };

        // get reports
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',filter:{coid:data.cycles[data.cIndex]._id,"pupil.pid":pid},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        let reports= await response.json();
        
        // get groups
        /** @type {{g:string,ss:string,sc:string,sl:string,lv:string,yr:number}[]}*/
        let gps=$groups.filter(el=>el.pupil.find(element=>(element.pid===pid))).map(el=>({g:el.g,ss:el.ss,sc:el.sc,sl:el.sl,lv:el.lv,yr:el.yr}));
        console.log(gps);

        

        // get cohorts (in case of F7 pupil retaking F6 etc)
        /** @type {{lv:string,yr:number}[]}*/
        let cohorts=[];
        for(let gp of gps) {
            if(!cohorts.find(el=>el.lv===gp.lv && el.yr===gp.yr)) cohorts.push({lv:gp.lv,yr:gp.yr});
        }
        console.log(cohorts);

        // get results
        response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'results',filter:{pid:pid} ,projection:{_id:1,pid:1,aoid:1,sc:1,sl:1,ss:1,gd:1,scr:1,pc:1,t:1,fb:1,lv:1,yr:1}}),
            headers: {'content-type': 'application/json'}
        });
        let results= await response.json();

         response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'intake',filter:{pid:status.pid} ,projection:{pid:1,base:1,pre:1,lv:1,yr:1}}),
            headers: {'content-type': 'application/json'}
        });
        let intake= await response.json();
    

        //groups=groups.sort((/** @type {{ sl: string; }} */ a,/** @type {{ sl: any; }} */ b)=>a.sl.localeCompare(b.sl));
        
        // get grades,view context and standards (assume same lv even if two cohorts!)
        $config.grade=$config.grade.sort((/** @type {{ sc: string; pre: number; }} */ a,/** @type {{ sc: any; pre: number; }} */ b)=>a.sc.localeCompare(b.sc) || b.pre-a.pre);
        let c=$config.view.find((/** @type {{ context: string; }} */ el)=>el.context===data.context);
        if(c) data.view=c;
        
        // build academic reports

        for(let gp of gps) {
            let line={title:`${gp.sl} (${gp.sc})`};
            let res=reports.find((/** @type {{ ss: string; sc: string; ci: any; author: { type: string; }; }} */ el)=>el.ss===gp.ss && el.sc===gp.sc && el.ci===data.cycles[data.cIndex].index && el.author.type==='hod');
            let s=res ? res.txt : '';
            res=reports.filter((/** @type {{ ss: string; sc: string; ci: any; author: { type: string; }; }} */ el)=>el.ss===gp.ss && el.sc===gp.sc && el.ci===data.cycles[data.cIndex].index && el.author.type==='teacher');
            let r=[];
            for(let item of res) {
                r.push(
                    {sal:item.author.sal,tid:item.author.tid,ec:item.ec!==null?`${item.ec}/${$config.report.e.default}`:null,ep:item.ep!==null?`${item.ep}/${$config.report.e.default}`:null,txt:item.txt}
                );
            }


            let col=[];
            let a=data.assessments.filter((/** @type {{ sc: any; ss: any; yr: any; lv: any; }} */ el)=>el.sc===gp.sc && el.ss===gp.ss && el.yr===gp.yr && el.lv===gp.lv)
                .sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>a.dt-b.dt);
            for(let assessment of a) {
                //console.log(a);
                let f=results.find((/** @type {{ aoid: any; }} */ el)=>el.aoid===assessment._id); 
                col.push({txt:assessment.n,ds:assessment.ds,gd:f?f.gd:'X',r:0});
            }
            let gds=$config.grade.filter((/** @type {{ sc: any; }} */ el)=>el.sc===gp.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
       
        
            let  s1=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===col[0].gd);
            for(let c of col) {
                let s2=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===c.gd); 
                c.r = s1>-1 && s2>-1 ? s1-s2 : 0; 
            }

            let std={A:'',B:''};
            if(gp.lv==='US') std=$config.std.US;
            else if(gp.lv==='MS') std=$config.std.MS;
            else if(gp.lv==='LS') std=$config.std.LS;
            
            
            let chance={
                A:{std:std.A,grade:gds.map((/** @type {{ gd: any; pre: any; }} */ el)=>({gd:el.gd,pre:el.pre})),pre:0},
                B:{std:std.B,grade:gds.map((/** @type {{ gd: any; pre: any; }} */ el)=>({gd:el.gd,pre:el.pre})),pre:0}
            };


            let f=intake.find((/** @type {{ lv: string; yr: number; }} */ el)=>el.lv===gp.lv && el.yr===gp.yr);
            if(f) {
                let i=f.pre.find((/** @type {{ ss: string; sc: string; }} */ el)=>el.ss===gp.ss && el.sc===gp.sc);
                if(i) {
                    chance.A.pre=i.A;
                    chance.B.pre=i.B;
                }

            }
        
            
        

            out.A.push({
                title:`${gp.sl} (${gp.sc})`,
                col:col,
                chance:chance,
                statement:s,
                report:r
            });

        }
        


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




        // use html.js functions to generate reports!!!!

        return out;

    };

    let printSelected=async()=>{

        // disbale button whilst in progress,
        // progress alerts
        // ec/4 etc
        data.print=true;
        $alert.msg='building reports...';
        let count=0;
        data.reports=[];
        for(let item of data.pupils) {
            if(item.select) {
                let r=await getReport(item.pid,{pn:item.pn,sn:item.sn,tg:item.tg,hse:item.hse,fm:item.fm});
                data.reports.push(r);
                count+=1;
                $alert.msg=`${item.pn} ${item.sn}`;
            }
        }

        console.log(data.reports);
        await util.wait(2000);
        $alert.msg=`built ${count} reports`;
        data.print=false;

        let markup=html.generate(data.reports,data.view);

        const url = URL.createObjectURL(new Blob([markup], { type: "text/html" }));
        const win = window.open(url);	
       


    };
    
    onMount(async () => {
    console.log('reports/View.svelte mounted');
    data.user=status.user;
    data.tIndex=status.teachers.findIndex((/** @type {{ tid: any; }} */ el)=>el.tid===data.user);

    // get report cycles
    let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'cycles',filter:{},projection:{}}),
            headers: {'content-type': 'application/json'}
    });
    let res= await response.json();
    //console.log(res);

    data.cycles=res.sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>b.index-a.index);
    data.cIndex=0;

    // get assessments
    /** @type {any}*/
    let filter={"tag.archive":false};
    filter["tag."+data.context]=true;
    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'assessments',filter:filter ,projection:{g:1,sc:1,sl:1,ss:1,dt:1,ds:1,n:1,tag:1,lv:1,yr:1}}),
        headers: {'content-type': 'application/json'}
    });
    data.assessments= await response.json();
    console.log(data.assessments);




    await update();

    });


</script>


<div class="row">
    <div class="col">
        <h4>Individual Pupils</h4>
    </div>
</div>

<hr/>

<div class="row">
    <div class="col is-vertical-align">
        <h4>Tutor Reports</h4>
    </div>
    <div class="col is-vertical-align">
        <fieldset>
            <legend>Select Tutor</legend>
           
        <select  id="Tutor" bind:value={data.tIndex} on:change={update}>
            <optgroup label="Tutor">
                    {#each status.teachers as item,index}
                        <option value={index}>({item.tid}) {item.pn} {item.sn}</option>
                    {/each}
            </optgroup>
          </select>
          </fieldset>
 
    </div>
    <div class="col is-vertical-align">
        <fieldset>
            <legend>Cycle</legend>           
            <select  id="Cycle" bind:value={data.cIndex}>
            <optgroup label="Cycle">
                    {#each data.cycles as item,index}
                        <option value={index}>{item.tt} {item.ts} {item.y}</option>
                    {/each}
            </optgroup>
            </select>
        </fieldset>
    </div>
    <div class="col is-vertical-align">
        <button disabled={data.print} class="button dark" on:click={printSelected}>Print View</button>
    </div>
</div>

<div class="row">
    <div class="col is-vertical-align">
        {#if data.pupils[0]}
            <table>
                <thead>
                    <tr>
                        <td><input type=checkbox bind:checked={data.all} on:change={selectAll}></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        <td></td>
                        
                    </tr>
                </thead>
                <tbody>

                
            {#each data.pupils as row,rowIndex}
                    <tr>
                        <td><input type=checkbox bind:checked={row.select}></td>
                       
                        <td>{row.pn} {row.sn}</td>
                        <td>{row.fm}</td>
                        <td>{row.tg}</td>
                        <td>{row.hse}</td>
                    </tr>
            {/each}
            </tbody>
            </table>
            

        {:else}
            <p>No pupil reports found for this tutor</p>
        {/if}
    </div>
</div>


<style>

</style>