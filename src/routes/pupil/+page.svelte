<script>

    import { onMount } from 'svelte';
    import {config,location} from '$lib/store';
	import { getAssessmentCols } from '$lib/util.js';
    
    export let data;

    /** @type {any}*/
    let pupil={
        report:{cycles:[],data:[]},
        groups:[],
        std:{A:'',B:''},
        context:'pupil',
        view:{context:'',chance:false,fb:false,rag:false},
        assessments:[],
        results:[],
        intake:[],
        table:[]
    };


    let getReports=async()=>{
        console.log('getReports() ...');
         /*get published report cycles*/
         let response = await fetch('/edge/read', {
                method: 'POST',
                body: JSON.stringify({collection:'cycles',filter:{publish:true},projection:{}}),
                headers: {'content-type': 'application/json'}
            });
        /** @type {any}*/
        let res= await response.json();
        //console.log(res);

        pupil.report.cycles=res.map((/** @type {{ index: any; }} */ el)=>el.index);
        //console.log(pupil.report.cycles);
        pupil.report.cycles = pupil.report.cycles.sort((/** @type { number} */ a,/** @type { number } */ b)=>b-a);
        console.log('publish cycles',pupil.report.cycles);

        /*get published reports for pupil*/
        response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',filter:{"pupil.pid":data.pid},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        res= await response.json();
        //console.log('found reports',res);
 
        pupil.report.data=res.filter((/** @type {{ ci: any; }} */ el)=>pupil.report.cycles.includes(el.ci));
        console.log('published reports',pupil.report.data);
    };

    let getGroups=async()=>{
        /* get groups */
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'groups',filter:{"pupil.pid":data.pid} ,projection:{_id:0,g:1,sc:1,sl:1,ss:1,lv:1,yr:1}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        pupil.groups = res[0] ? res.sort((/** @type {{ sl: string; }} */ a,/** @type {{ sl: any; }} */ b)=>a.sl.localeCompare(b.sl)) : [];
        console.log(pupil.groups);

    };

    let getConfig=()=>{
        $config.gradee=$config.grade.sort((/** @type {{ sc: string; pre: number; }} */ a,/** @type {{ sc: any; pre: number; }} */ b)=>a.sc.localeCompare(b.sc) || b.pre-a.pre);

         /* get CEM stds - assume even F7 pupils doing F6 courses have same lv! */
        if(pupil.groups[0].lv==='US') pupil.std={A:$config.std.US.A,B:$config.std.US.B};
        else if (pupil.groups[0].lv==='MS') pupil.std={A:$config.std.MS.A,B:$config.std.MS.B};
        else if (pupil.groups[0].lv==='LS') pupil.std={A:$config.std.LS.A,B:$config.std.LS.B};

    /* set context for rag and chances graphs view */
    let c=$config.view.find((/** @type {{ context: string; }} */ el)=>el.context===pupil.context);

    if(c) pupil.view=c;

    };

    let getAssessments=async()=>{

    // is the pupil in 2 chorts, e.g. F6 lessons, but in F6 (repeating)
    /** @type {{lv:string,yr:number}[]}*/
    let cohorts=[];
    for(let gp of pupil.groups) {
        if(!cohorts.find(el=>el.lv===gp.lv && el.yr===gp.yr)) cohorts.push({lv:gp.lv,yr:gp.yr});
    }
    console.log(cohorts);


    /** @type {any}*/
    let filter={"tag.archive":false};
    if(pupil.context==='overview') filter["tag.overview"]=true;
    if(pupil.context==='pupil') filter["tag.pupil"]=true;
    if(pupil.context==='parent') filter["tag.parent"]=true;
    //console.log(filter);
    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'assessments',filter:filter ,projection:{g:1,sc:1,sl:1,ss:1,dt:1,ds:1,total:1,grade:1,n:1,tag:1,id:1,lv:1,yr:1}}),
        headers: {'content-type': 'application/json'}
    });
    let res= await response.json();

    pupil.assessments=[];
    for(let cohort of cohorts) pupil.assessments=pupil.assessments.concat(res.filter((/** @type {{ lv: string; yr: number; }} */ el)=>el.lv===cohort.lv && el.yr===cohort.yr));
      
    

    pupil.assessments= pupil.assessments.sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>a.dt-b.dt);
    console.log(pupil.assessments);
    
    /* get results by status.pid */
    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'results',filter:{pid:data.pid} ,projection:{_id:1,pid:1,aoid:1,sc:1,sl:1,ss:1,gd:1,scr:1,pc:1,t:1,fb:1,lv:1,yr:1}}),
        headers: {'content-type': 'application/json'}
    });
    pupil.results= await response.json();

     /* get intake by status.pid */
     response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'intake',filter:{pid:data.pid} ,projection:{pre:1,lv:1,yr:1}}),
        headers: {'content-type': 'application/json'}
    });
    res= await response.json();
    console.log(res);
    pupil.intake=[];
    for(let cohort of cohorts) {
        let x=res.find((/** @type {{ lv: string; yr: number; }} */ el)=>el.lv===cohort.lv && el.yr===cohort.yr);
        console.log(cohort.lv,cohort.yr,x,res);
        if(x && x.pre) {
            let out=[];
            for(let y of x.pre) out.push({lv:x.lv,yr:x.yr,ss:y.ss,sc:y.sc,A:y.A,B:y.B});
            pupil.intake=pupil.intake.concat(out);
        } 
    }
   

    };


    let buildTable=()=>{
        for(let group of pupil.groups) {
       

            let col=[];
            for(let assessment of pupil.assessments.filter((/** @type {{ sc: any; ss: any; lv: any; yr: any; }} */ el)=>el.sc===group.sc && el.ss===group.ss && el.lv===group.lv && el.yr===group.yr)) {
                let f=pupil.results.find((/** @type {{ aoid: any; }} */ el)=>el.aoid===assessment._id);
                
                /** @type {any[]} */
                let total=[];
                assessment.total.forEach((/** @type {{ n: any; t: any; w: any; }} */ item,/** @type {string | number} */ i)=>{total.push({scr:f&&f.t[i] ? f.t[i] : 0,n:item.n,t:item.t,w:item.w})});
                let a={ss:assessment.ss,sc:assessment.sc,gd:f?f.gd:'X',scr:f?f.scr:0,pc:f?f.pc:0,r:0,_id:f?f._id:'',n:assessment.n,ds:assessment.ds,dt:assessment.dt,grade:assessment.grade,total:total,tag:assessment.tag,fb:f?f.fb:''}
                
                col.push(a);
            }
            let f=pupil.intake.find((/** @type {{ sc: any; ss: any; lv: any; yr: any; }} */ el)=>el.sc===group.sc && el.ss===group.ss && el.lv===group.lv && el.yr===group.yr);

            let gds=$config.grade.filter((/** @type {{ sc: any; }} */ el)=>el.sc===group.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
            
            
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

            
            
            
            if(pupil.report.data[0] && pupil.report.cycles[0]!==undefined) {
                    // current report
                let t=pupil.report.data.filter((/** @type {{ ci: any; ss: any; sc: any; author: { type: string; }; }} */ el)=>el.ci===pupil.report.cycles[0] && el.ss===group.ss && el.sc===group.sc && el.author.type==='teacher');
                //t=t[0] ? t.sort((a,b)=b.ci-a.ci || a.author.tid.localeCompare(b.author.tid)) : [];
                let h=pupil.report.data.find((/** @type {{ ci: any; ss: any; sc: any; author: { type: string; }; }} */ el)=>el.ci===pupil.report.cycles[0] && el.ss===group.ss && el.sc===group.sc && el.author.type==='hod');
                if(h) report.current.push({ci:h.ci,title:`${h.tt} ${h.ts} ${h.y}`,type:'hod',sl:group.sl,sc:h.sc,ss:h.ss,sal:h.author.sal,tid:h.author.tid,ec:h.ec,ep:h.ep,txt:h.txt});
                for(let x of t) {
                    report.current.push({ci:x.ci,title:`${x.tt} ${x.ts} ${x.y}`,type:'teacher',sl:group.sl,sc:x.sc,ss:x.ss,sal:x.author.sal,tid:x.author.tid,ec:x.ec,ep:x.ep,txt:x.txt});
                }

                report.current=report.current.sort((a,b)=>a.type.localeCompare(b.type) || a.tid.localeCompare(b.tid) );
                
                    // previous reports
                t=pupil.report.data.filter((/** @type {{ ci: any; ss: any; sc: any; author: { type: string; }; }} */ el)=>el.ci!==pupil.report.cycles[0] && el.ss===group.ss && el.sc===group.sc && el.author.type==='teacher');
                //t=t[0] ? t.sort((a,b)=b.ci-a.ci || a.author.tid.localeCompare(b.author.tid)) : [];
                h=pupil.report.data.filter((/** @type {{ ci: any; ss: any; sc: any; author: { type: string; }; }} */ el)=>el.ci!==pupil.report.cycles[0] && el.ss===group.ss && el.sc===group.sc && el.author.type==='hod');
                for(let x of h) {
                    report.past.push({ci:x.ci,title:`${x.tt} ${x.ts} ${x.y}`,type:'hod',sl:group.sl,sc:x.sc,ss:x.ss,sal:x.author.sal,tid:x.author.tid,ec:x.ec,ep:x.ep,txt:x.txt});
                }
                for(let x of t) {
                    report.past.push({ci:x.ci,title:`${x.tt} ${x.ts} ${x.y}`,type:'teacher',sl:group.sl,sc:x.sc,ss:x.ss,sal:x.author.sal,tid:x.author.tid,ec:x.ec,ep:x.ep,txt:x.txt});
                }

                report.past=report.past.sort((a,b)=>b.ci-a.ci || a.type.localeCompare(b.type) || a.tid.localeCompare(b.tid) );



            }
            



            let row={sl:group.sl,ss:group.ss,sc:group.sc,g:group.g,col:col,pre:{A:f?f.A:0,B:f?f.B:0},report:report};
            pupil.table.push(row);
        }

        console.log(pupil.table);

        pupil.table=pupil.table;
    };


    onMount(async () => {
        $location='/pupil';

        pupil.context='pupil';

        pupil.table=[];

        //console.log(data);
        await getReports();
        await getGroups();
        if(pupil.groups[0]) {
            getConfig();
            await getAssessments();
            buildTable();
        }
        
        console.log(pupil);



    });
    
    
    </script>
    
    <svelte:head>
        <title>Pupil</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
    {#if pupil.table[0]}

    Hello
    {/if}


    {#if !pupil.table[0]}
    <div class="row">
        <div class="col">
            <blockquote>Gathering additional data ...</blockquote>
        </div>
    </div>
    {/if}
    
    <style>
    </style>
    