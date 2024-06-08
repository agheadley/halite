<script>
    import { onMount } from 'svelte';
    import {pupils,teachers,config} from '$lib/store';
    import Pedit from './Pedit.svelte';
    import Pdetail from './Pdetail.svelte';
    import Modal from '$lib/_Modal.svelte';
    
    /** @type {any}*/
    export let status;
    
    /** @type {any}*/
    let data={
        user:'',
        hms:[],
        hIndex:0,
        reports:[],
        index:0,
        next:0,
        detail:{open:false,index:0},
        active:{_id:'',log:'',txt:''}
    };
    
    $:{
          
        if(data.active._id!=='') {
    
            //console.log('updating status.reports.',data.active);
    
            let f=status.reports.find((/** @type {{ _id: any; }} */ el)=>el._id===data.active._id);
            if(f) {
                f.txt=data.active.txt;
                f.log=data.active.log;
            }
            data.active={_id:'',log:'',txt:''};
    
    
        }
    
        if(data.reports[data.next]) {
            if(data.reports[data.next].txt!==null) {
                    document.getElementById(`c|${String(data.next)}`)?.scrollIntoView();
                    //data.reports[data.next].detail=true;
            } 
        }
    
        if(data.reports[data.next-1]) {
            let x=data.reports[data.next-1];
            //x.detail=false;
            console.log(x.sn,x.data._id);
            let f=status.reports.find((/** @type {{ _id: any; }} */ el)=>el._id===x.data._id);
            if(f) {
                f.txt=x.data.txt;
                f.ec=x.data.ec;
                f.ep=x.data.ep;
                f.log=x.data.log;
                
                
            }

            /* update to reflect changes */
            console.log(x);
            
            let d=x.data.detail.find((/** @type {{ tid: any; title: string; }} */ el)=>el.tid===data.user && el.title==='hm');
            if(d) {
                d.txt=x.data.txt;
                d.log=x.data.log;
            }


            
        }
           
      }
    
      /**
       * 
       * @param {number} index
       */
      let openDetail=(index)=>{
        data.detail={open:true,index:index};
        
      };
    
    let update=async()=>{
            data.user=data.hms[data.hIndex].tg;
            data.reports=[];
           
            let pups=$pupils.filter(el=>el.tg===data.user);
    
            /** @type {any}*/
            let res=[];
    
            if(pups[0]) {
                let response = await fetch('/edge/read', {
                method: 'POST',
                body: JSON.stringify({collection:'results',filter:{lv:pups[0].lv,yr:pups[0].yr},projection:{}}),
                headers: {'content-type': 'application/json'}
                });
                res= await response.json();
                //console.log(res);
            }
           
    
    
            for(let pupil of pups) {
    
                /* get other pupil reports */
                let p=status.reports.filter((/** @type {{ pupil: { pid: number; }; type: string; author: { type: string; }; }} */ el)=>el.pupil.pid===pupil.pid && el.type==='P');
                let a=status.reports.filter((/** @type {{ pupil: { pid: number; }; type: string; author: { type: string; }; }} */ el)=>el.pupil.pid===pupil.pid &&  el.type==='A' && el.author.type==='teacher');
                let h=status.reports.filter((/** @type {{ pupil: { pid: number; }; type: string; author: { type: string; }; }} */ el)=>el.pupil.pid===pupil.pid  && el.type==='A' && el.author.type==='hod');
                let e=status.reports.filter((/** @type {{ pupil: { pid: number; }; type: string; }} */ el)=>el.pupil.pid===pupil.pid  && el.type==='E');
    
                /* find matching tutor report */
                let f=status.reports.find(( /** @type {{ pupil: { pid: number; tg: any; }; type: string; author: { type: string; }; }} */ el)=>el.pupil.pid===pupil.pid && el.pupil.tg===data.user && el.type==='P' && el.author.type==='hm');
                
                /* process, sort pastoral reports */
                let ps=[];
                for(let item of p) ps.push({type:"P",sal:item.author.sal,tid:item.author.tid,_id:item._id,txt:item.txt,title:item.author.type,sl:null,sc:null,ss:null,g:null,ec:item.ec,ep:item.ep,min:item.min,max:item.max,log:item.log}); 
                ps=ps.sort((a,b)=>a.title.localeCompare(b.title));
    
                /* process, sort enrichment reports */
                let es=[];
                for(let item of e) es.push({type:"E",sal:item.author.sal,tid:item.author.tid,_id:item._id,txt:item.txt,title:item.author.type,sl:null,sc:null,ss:null,g:null,ec:item.ec,ep:item.ep,min:item.min,max:item.max,log:item.log}); 
                es=es.sort((a,b)=>a.title.localeCompare(b.title));
    
                /* process, sort academic reports */
                /** @type {any}*/
                let as=[];
                for(let item of a) as.push({type:"A",cols:[],hod:'',sal:item.author.sal,tid:item.author.tid,_id:item._id,txt:item.txt,title:item.author.type,sl:item.sl,sc:item.sc,ss:item.ss,g:item.gp,ec:item.ec,ep:item.ep,min:item.min,max:item.max,log:item.log}); 
                as=as.sort((/** @type {{ sc: string; sl: string; }} */ a,/** @type {{ sc: any; sl: any; }} */ b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl));
    
                /* add matching hods comments */
                for(let item of as) {
                    let f=h.find((/** @type {{ ss: any; sc: any; }} */ el)=>el.ss==item.ss && el.sc===item.sc);
                    item.hod=f?f.txt:'';
                }
    
                /* add assessment results */
                for(let subject of as) {
                    subject.cols=[];
                    let pupilResults=res.filter((/** @type {{ pid: number; ss: any; sc: any; }} */ el)=>el.pid===pupil.pid && el.ss===subject.ss && el.sc===subject.sc);
                    for(let item of pupilResults) {
                        if(!subject.cols.find((/** @type {{ n: any; dl: any; }} */ el)=>el.n===item.n && el.dl===item.dl)) {
                            subject.cols.push({
                                    n:item.n,
                                    ds:item.dl?.length===10 ? item.dl[5]+item.dl[6]+"/" +item.dl[2]+item.dl[3]: '00/00',
                                    dt:new Date(item.dl).getTime(),
                                    dl:item.dl,
                                    gd:'X',
                                    pc:0,
                                    r:0
                            });
                        }
                    }
                    subject.cols=subject.cols.sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>a.dt-b.dt);
                    //console.log(pupil.pid,pupil.sn,subject.ss,subject.sc,subject.cols);
    
                    if(subject.cols[0]) {
                        for(let col of subject.cols) {
                            let f=pupilResults.find((/** @type {{ n: any; dl: any; }} */ el)=>el.n===col.n && el.dl===col.dl);
                            col.gd=f?f.gd:'X';
                            col.pc=f?f.pc:0;
                        }
    
                        let gds=$config.grade.filter((/** @type {{ sc: string; }} */ el)=>el.sc===subject.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
                        let  s1=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===subject.cols[0].gd);
                        for(let col of subject.cols) {
                            let s2=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===col.gd); 
                            col.r = s1>-1 && s2>-1 ? s1-s2 : 0; 
                        }
                    }
                   
    
    
                }
    
                let linked=[];
                for(let item of as) linked.push(item);
                for(let item of es) linked.push(item);
                for(let item of ps) linked.push(item);
                for(let item of linked) item.edit=false;
    
    
    
                data.reports.push({
                    pid:pupil.pid,
                    sn:pupil.sn,
                    pn:pupil.pn,
                    tg:pupil.tg,
                    hse:pupil.hse,    
                            data:{
                                valid:f?true:false,
                                min:f?f.min:0,
                                max:f?f.max:0,
                                ec:null,
                                ep:null,
                                txt:f?f.txt:'',
                                _id:f?f._id:'',
                                sal:f?f.author.sal:'',
                                log:f?f.log:'',
                                detail:linked
                                
                            }
                });
            }
    
            console.log(data.reports);
    
            data.reports=data.reports;
    };
    
    onMount(async () => {
        console.log('reports/Tutor.svelte mounted');
    
        data.user=status.user;
    
       
    
        //testing ......
        for(let item of $pupils) item.tg='XXX';
        for(let item of $pupils.filter(el=>el.hse==='Spear' && el.fm===6) ) item.tg='AGH';
    
        console.log($pupils);
    
        data.hms=[];
        for(let item of $config.report.hm) {
            if(!data.hms.find((el)=>el.hse===item.hse)) {
                let f=$teachers.find(el=>el.tid===item.tid);
                data.hms.push({hse:item.hse,tid:item.tid,sal:item.sal,sn:f?f.sn:'',pn:f?f.pn:''});
            }
        }
        data.hms.sort((/** @type {{ sn: string; pn: string; }} */ a,/** @type {{ sn: any; pn: any; }} */ b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn));
    
        console.log(data.hms);
        data.hIndex=data.hms.findIndex((/** @type {{ tid: any; }} */ el)=>el.tid===data.user);
    
        
        await update();
      
    });
    
    
    </script>
    
    
    {#if data.detail.open}
        <Modal bind:open={data.detail.open}>
            <div class="row">
                <div class="col">
                    <h4>{data.reports[data.detail.index].pn}  {data.reports[data.detail.index].sn}</h4>
                </div>
                <div class="col is-right">
                    <button class="button outline" on:click={()=>data.detail.open=false}>Close</button>
                </div>
            </div>
            <div class="row">
                <Pdetail  bind:active={data.active} data={data.reports[data.detail.index].data} user={status.user}/>
            </div>
            <div class="row">
                <div class="col">
                   
                </div>
                <div class="col is-right">
                    <button class="button outline" on:click={()=>data.detail.open=false}>Close</button>
                </div>
            </div>
        
            
           
        </Modal>
        {/if}
    
    
    
    <div class="row">
        <div class="col is-vertical-align">
            <h4>Tutor Comments </h4>
        </div>
        <div class="col is-vertical-align">
    
            <select  id="Tutor" bind:value={data.hIndex} on:change={update}>
                <optgroup label="Tutor">
                        {#each data.hms as item,index}
                            <option value={index}>({item.hse}) {item.pn} {item.sn}</option>
                        {/each}
                </optgroup>
              </select>
     
        </div>
    </div>
    
    
    
    
    
    {#if data.reports[0]}
    
    
    <table>
        <thead>
            <tr>
                <th></th>
                <th>
    
    
                </th>
              
            </tr>   
    
        </thead>
        <tbody>
            {#each data.reports as row,rowIndex}
              
               
                <tr>
                    <td>
                        <div>
                            <button class="button small dark" on:click={()=>openDetail(rowIndex)}>Review</button>
             
                        </div>
                       <div>{row.pn} {row.sn}</div><div><span class="small">{row.hse}</span></div><div><span class="small">{row.tg}</span></div>
                    </td>
                    <td>
                        {#if row.data.valid}
                            <Pedit bind:data={row.data} index={rowIndex}  bind:next={data.next} user={status.user}/>
                        {:else}
                            <span class="tag">Error - Report missing</span>
                        {/if}
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
    
    {/if}
    
    
    
    
    
    <style>
    
    .small {
        font-size:1.2rem;
    }
    </style>