<script>
import { onMount } from 'svelte';
import {pupils,teachers,config} from '$lib/store';
import Pedit from './Pedit.svelte';
    
/** @type {any}*/
export let status;

/** @type {any}*/
let data={
    user:'',
    tutors:[],
    tIndex:0,
    reports:[],
    index:0,
    next:0
};

$:{
      

      if(data.reports[data.next]) {
          if(data.reports[data.next].txt!==null) {
                  document.getElementById(`c|${String(data.next)}`)?.focus();
          } 
      }

      if(data.reports[data.next-1]) {
          let x=data.reports[data.next-1];
          console.log(x.sn,x.data._id);
          let f=status.reports.find((/** @type {{ _id: any; }} */ el)=>el._id===x.data._id);
          if(f) {
              f.txt=x.data.txt;
              f.ec=x.data.ec;
              f.ep=x.data.ep;
              f.log=x.data.log;
              
              
          }
      }
       
  }

let update=async()=>{
        data.user=data.tutors[data.tIndex].tg;
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
            let p=status.reports.filter((/** @type {{ pupil: { pid: number; }; type: string; author: { type: string; }; }} */ el)=>el.pupil.pid===pupil.pid && el.type==='P' && el.author.type!=='tutor');
            let a=status.reports.filter((/** @type {{ pupil: { pid: number; }; type: string; author: { type: string; }; }} */ el)=>el.pupil.pid===pupil.pid &&  el.type==='A' && el.author.type==='teacher');
            let h=status.reports.filter((/** @type {{ pupil: { pid: number; }; type: string; author: { type: string; }; }} */ el)=>el.pupil.pid===pupil.pid  && el.type==='A' && el.author.type==='hod');
            let e=status.reports.filter((/** @type {{ pupil: { pid: number; }; type: string; }} */ el)=>el.pupil.pid===pupil.pid  && el.type==='E');

            /* find matching tutor report */
            let f=status.reports.find(( /** @type {{ pupil: { pid: number; tg: any; }; type: string; author: { type: string; }; }} */ el)=>el.pupil.pid===pupil.pid && el.pupil.tg===data.user && el.type==='P' && el.author.type==='tutor');
            
            /* process, sort pastoral reports */
            let ps=[];
            for(let item of p) ps.push({sal:item.author.sal,tid:item.author.tid,_id:item._id,txt:item.txt,title:item.author.type,sl:null,sc:null,ss:null,g:null,ec:item.ec,ep:item.ep}); 
            ps=ps.sort((a,b)=>a.title.localeCompare(b.title));

            /* process, sort enrichment reports */
            let es=[];
            for(let item of e) es.push({sal:item.author.sal,tid:item.author.tid,_id:item._id,txt:item.txt,title:item.author.type,sl:null,sc:null,ss:null,g:null,ec:item.ec,ep:item.ep}); 
            es=es.sort((a,b)=>a.title.localeCompare(b.title));

            /* process, sort academic reports */
            /** @type {any}*/
            let as=[];
            for(let item of a) as.push({cols:[],hod:'',sal:item.author.sal,tid:item.author.tid,_id:item._id,txt:item.txt,title:item.author.type,sl:item.sl,sc:item.sc,ss:item.ss,g:item.gp,ec:item.ec,ep:item.sp}); 
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
                console.log(pupil.pid,pupil.sn,subject.ss,subject.sc,subject.cols);


                for(let col of subject.cols) {
                    let f=pupilResults.find(el=>el.n===col.n && el.dl===col.dl);
                    col.g=f?f.gd:'X';
                    col.pc=f?f.pc:0;
                }

                let gds=$config.grade.filter((/** @type {{ sc: string; }} */ el)=>el.sc===subject.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
                let  s1=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===subject.cols[0].gd);
                for(let col of subject.cols) {
                    let s2=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===col.gd); 
                    col.r = s1>-1 && s2>-1 ? s1-s2 : 0; 
                }


            }
           



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
                            a:as,
                            p:ps,
                            e:es
                            
                        }
            });
        }

        console.log(data.reports.filter((/** @type {{ data: { valid: any; }; }} */ el)=>el.data.valid));
};

onMount(async () => {
    console.log('reports/Tutor.svelte mounted');

    data.user=status.user;

   

    //testing ......
    for(let item of $pupils) item.tg='XXX';
    for(let item of $pupils.filter(el=>el.hse==='Spear' && el.fm===6) ) item.tg='AGH';

    console.log($pupils);

    data.tutors=[];
    for(let item of $pupils) {
        if(!data.tutors.find((/** @type {{ tg: string; }} */ el)=>el.tg===item.tg)) {
            let f=$teachers.find(el=>el.tid===item.tg);
            data.tutors.push({tg:item.tg,tid:f?f.tid:'',sal:f?f.sal:'',sn:f?f.sn:'',pn:f?f.pn:''});
        }
    }
    data.tutors.sort((/** @type {{ sn: string; pn: string; }} */ a,/** @type {{ sn: any; pn: any; }} */ b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn));

    console.log(data.tutors);
    data.tIndex=data.tutors.findIndex((/** @type {{ tid: any; }} */ el)=>el.tid===data.user);

    
    await update();
  
});


</script>

<div class="row">
    <div class="col is-vertical-align">
        <h4>Tutor Comments </h4>
    </div>
    <div class="col is-vertical-align">

        <select  id="Tutor" bind:value={data.tIndex} on:change={update}>
            <optgroup label="Tutor">
                    {#each data.tutors as item,index}
                        <option value={index}>({item.tg}) {item.pn} {item.sn}</option>
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
                    <td><div>{row.pn} {row.sn}</div><div><span class="small">{row.hse}</span></div><div><span class="small">{row.tg}</span></div>
                </td>
                <td>
                    {#if row.data.valid}
                  
                        <Pedit bind:data={row.data} index={rowIndex}  bind:next={data.next} user={data.user}/>
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