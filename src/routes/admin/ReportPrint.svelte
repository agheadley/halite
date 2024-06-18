<script>
import { onMount } from 'svelte';
import * as file from '$lib/file';
import * as util from '$lib/util';
import {alert,config,groups,teachers,pupils} from '$lib/store';
import Modal from '$lib/_Modal.svelte';

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
    results:[],
    print:false,
    fm:7,
    out:[]

};

let generate=async()=>{
    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'reports',filter:{coid:data.cycles[data.cIndex]._id,fm:data.fm},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    data.reports= await response.json();


    // ignore any F7 pupil in F6 - will have to manaully update this from the client and save the PDF as a correct ID.
    let f=$groups.find(el=>el.fm===data.fm);
    console.log(f);
    if(f) {
        response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'results',filter:{lv:f.lv,yr:f.yr},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        data.results= await response.json();

    }

    

    for(let pupil of $pupils.filter(el=>el.fm===data.fm)) {
       
        
        /** @type {{
         cycle:{tt:string,ts:string,y:number,txt:string},
         pupil:{sn:string,pn:string,pid:number,id:string,hse:string,tg:string,fm:number},
         A:{title:string,chance:{A:{std:string,grade:{pre:number,gd:string}[],pre:number},B:{std:string,grade:{pre:number,gd:string}[],pre:number}},col:{ds:string,txt:string,gd:string,r:number}[],statement:string|null,report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}[]
         E:{title:string,report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}[],
         P:{title:string,report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}[]
         }
        }}*/
        let out={
            cycle:{tt:data.cycles[data.cIndex].tt,ts:data.cycles[data.cIndex].ts,y:data.cycles[data.cIndex].y,txt:''},
            pupil:{id:pupil.id,sn:pupil.sn,pn:pupil.pn,pid:pupil.pid,tg:pupil.tg,hse:pupil.hse,fm:pupil.fm},
            A:[],
            E:[],
            P:[]
        };

        //console.log(pupil.sn);
        /** @type {any} */
        let gps=pupil.groups.sort((a,b)=>a.sl.localeCompare(b.sl));


        // add assessments and comments
        for(let gp of gps) {
            let line={title:`${gp.sl} (${gp.sc})`};
            let res=data.reports.find((/** @type {{ pupil: { pid: number; }; ss: any; sc: any; ci: any; author: { type: string; }; }} */ el)=>el.pupil.pid===pupil.pid && el.ss===gp.ss && el.sc===gp.sc && el.ci===data.cycles[data.cIndex].index && el.author.type==='hod');
            let s=res ? res.txt : '';
            res=data.reports.filter((/** @type {{ pupil: { pid: number; }; ss: any; sc: any; ci: any; author: { type: string; }; }} */ el)=>el.pupil.pid===pupil.pid && el.ss===gp.ss && el.sc===gp.sc && el.ci===data.cycles[data.cIndex].index && el.author.type==='teacher');
            let r=[];
            for(let item of res) {
                r.push(
                    {sal:item.author.sal,tid:item.author.tid,ec:item.ec!==null?`${item.ec}/${$config.report.e.default}`:null,ep:item.ep!==null?`${item.ep}/${$config.report.e.default}`:null,txt:item.txt}
                );
            }

            let group=$groups.find(el=>el.sc===gp.sc && el.ss===gp.ss && el.g===gp.g);
            let std={A:'',B:''};
            if(group) {
                if(group.lv==='US') std=$config.std.US;
                else if(group.lv==='MS') std=$config.std.MS;
                else if(group.lv==='LS') std=$config.std.LS;
            }
           
            
            let gds=$config.grade.filter((/** @type {{ sc: any; }} */ el)=>el.sc===gp.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
       

            let chance={
                A:{std:std.A,grade:gds.map((/** @type {{ gd: any; pre: any; }} */ el)=>({gd:el.gd,pre:el.pre})),pre:0},
                B:{std:std.B,grade:gds.map((/** @type {{ gd: any; pre: any; }} */ el)=>({gd:el.gd,pre:el.pre})),pre:0}
            };

            if(gp?.pre?.A>0) chance.A.pre=gp.pre.A;
            if(gp?.pre?.B>0) chance.A.pre=gp.pre.B;



            let col=[];

            if(group) {
                let a=data.assessments.filter((/** @type {{ sc: any; ss: any; yr: any; lv: any; }} */ el)=>el.sc===gp.sc && el.ss===gp.ss && el.yr===group.yr && el.lv===group.lv)
                .sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>a.dt-b.dt);
                for(let assessment of a) {
                    //console.log(a);
                    let f=data.results.find((/** @type {{ aoid: any; }} */ el)=>el.aoid===assessment._id); 
                    col.push({txt:assessment.n,ds:assessment.ds,gd:f?f.gd:'X',r:0});
                }
          
                let  s1=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===col[0].gd);
                for(let c of col) {
                    let s2=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===c.gd); 
                    c.r = s1>-1 && s2>-1 ? s1-s2 : 0; 
                }




            }
          

            out.A.push({
                title:`${gp.sl} (${gp.sc})`,
                col:col,
                chance:chance,
                statement:s,
                report:r
            });


        } // end of group for


        // add enrichment reports
        let p=data.reports.filter((/** @type {{ type: string; pupil: { pid: number; }; }} */ el)=>el.type==='E' && el.pupil.pid===pupil.pid);
        for(let item of p) {
            out.E.push({
                title:item.sl,report:[{sal:item.author.sal,tid:item.author.tid,ec:item.ec!==null?`${item.ec}/${$config.report.e.default}`:null,ep:item.ep!==null?`${item.ep}/${$config.report.e.default}`:null,txt:item.txt}]
            });
        }
        out.E=out.E.sort((a,b)=>a.title.localeCompare(b.title));

        // add pastoral reports
        p=data.reports.filter((/** @type {{ type: string; pupil: { pid: number; }; }} */ el)=>el.type==='P' && el.pupil.pid===pupil.pid);
        for(let item of p) {
            out.P.push({
                title:(item.author.type==='hm' ? 'housemaster' : item.author.type).toUpperCase(),report:[{sal:item.author.sal,tid:item.author.tid,ec:item.ec!==null?`${item.ec}/${$config.report.e.default}`:null,ep:item.ep!==null?`${item.ep}/${$config.report.e.default}`:null,txt:item.txt}]
            });
        }
        out.P=out.P.sort((a,b)=>a.title.localeCompare(b.title));

        //console.log(pupil.sn,out.P.length,out.E.length);
        data.out.push(out);


    } // end of pupil
    
    // testing !
    file.download(JSON.stringify(data.out),'report-data.json');

    console.log(data.out);


};

onMount(async () => {
    console.log('/admin ReportPrint.svelte');
    console.log(status);


    let f=$config.view.find((/** @type {{ context: any; }} */ el)=>el.context===data.view.context);
    data.view={context:'parent',rag:f?f.rag:false,chance:f?f.chance:false,fb:f?f.fb:false};
    console.log(f);

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

    /** @type {any}*/
    let filter={"tag.archive":false};
    filter["tag."+data.context]=true;
    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'assessments',filter:filter ,projection:{_id:1,g:1,sc:1,sl:1,ss:1,dt:1,ds:1,n:1,tag:1,lv:1,yr:1}}),
        headers: {'content-type': 'application/json'}
    });
    data.assessments= await response.json();
    console.log(data.assessments);

    /*
    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'reports',filter:{coid:data.cycles[data.cIndex]._id},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    let reports= await response.json();
    */
   
});

</script>


<h4>Generate Report Data</h4>

<div class="row">
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
    <div class="col is-vertical-align">
        <button class="button dark" on:click={generate}>Generate Report Data</button>
    </div>
</div>


<div class="row">
    <div class="col is-vertical-align">
        <h1>Output 30 odd records in a file for easy pdf generation?</h1>
    </div>
</div>
<style>

</style>