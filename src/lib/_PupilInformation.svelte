<script>
import {cycles,assessments,groups,config,pupils} from '$lib/store';
import { onMount } from 'svelte';



/** @type {{cIndex:number,view:{context:'overview'|'parent'|'pupil',chance:boolean,fb:boolean,rag:boolean,n:boolean}}}*/
let status= {
    cIndex:0,
    view:{context:'overview',chance:true,fb:true,rag:true,n:true}
};

/** @type {{pid:number,id:string,pn:string,sn:string,fm:number|null,hse:string,tg:string}}*/
export let data;


let getReport=async()=> {

console.log('building report for ',data.pid);

/** @type {{
 cycle:{tt:string,ts:string,y:number,txt:string},
    pupil:{sn:string,pn:string,pid:number,id:string,hse:string,tg:string,fm:number|null},
    A:{title:string,chance:{A:{std:string,grade:{pre:number,gd:string}[],pre:number},B:{std:string,grade:{pre:number,gd:string}[],pre:number}},col:{ds:string,txt:string,gd:string,r:number}[],statement:string|null,report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}[]
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
        col.push({txt:assessment.n,ds:assessment.ds,gd:f?f.gd:'X',r:0});
    }
    let gds=$config.grade.filter((/** @type {{ sc: any; }} */ el)=>el.sc===gp.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
    console.log(gp,gds,col);
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


    onMount(async () => {
        /** @type {any}*/
        let cycs=$cycles.filter((el)=>el.publish===true).sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>b.index-a.index);
        status.cIndex = cycs[0]? cycs[0].index : null; 
        
        await getReport();
    });

</script>


<p>{JSON.stringify(data)}</p>
<style>

</style>