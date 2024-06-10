<script>

    import { onMount } from 'svelte';
    import {groups,teachers,config,alert} from '$lib/store';
    import Edit from './Edit.svelte';
    import Modal from '$lib/_Modal.svelte';
    import Detail from './Detail.svelte';
    import * as util from '$lib/util';

  

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
        user:'',
        sal:'',
        index:0,
        groups:[],
        tIndex:0,
        reports:[],
        next:0,
        cols:[],
        detail:{open:false,txt:'',type:'teacher',pid:0,sn:'',pn:''}
    };

    $:{
      

        if(data.reports[data.next]) {
            if(data.reports[data.next].txt!==null) {
                    document.getElementById(`c|${String(data.next)}`)?.focus();
            } 
        }

        
      

       
      
    }


    /**
     * 
     * @param {number} index
     */
    let openDetail=(index)=>{
        data.detail.pid=data.reports[index].pupil.pid;
        data.detail.pn=data.reports[index].pupil.pn;
        data.detail.sn=data.reports[index].pupil.sn;
        data.detail.open=true;
        
    };

    let update=async()=>{
        // set user
        data.user=status.teachers[data.tIndex].tid;
        data.sal=status.teachers[data.tIndex].sal;

        // get groups for user
        let response = await fetch('/edge/distinct', {
                method: 'POST',
                body: JSON.stringify({collection:'reports',match:{coid:status.cycle._id,"author.tid":data.user,type:"A"},aggregate:['fm','g','ss','sc','sl']}),
                headers: {'content-type': 'application/json'}
            });
            let res= await response.json();
            data.groups=res[0] ? res.sort((/** @type {{ fm: number; g: string; }} */ a,/** @type {{ fm: number; g: any; }} */ b)=>b.fm-a.fm || a.g.localeCompare(b.g)) :[];
            
            console.log(data.groups);
        

       await updateReports();
     

    };

    let updateReports=async()=>{
        let g=data.groups[data.index];

        data.reports=[];
      
        let gp=$groups.find(el=>el.ss===g.ss && el.sc===g.sc && el.g===g.g);

        if(gp) {

            /* get assessment cols */
            console.log(gp.g,gp.lv,gp.yr,gp.ss,gp.sc);
            let response = await fetch('/edge/read', {
                method: 'POST',
                body: JSON.stringify({collection:'results',filter:{lv:gp.lv,yr:gp.yr,ss:gp.ss,sc:gp.sc},projection:{}}),
                headers: {'content-type': 'application/json'}
            });
            let res= await response.json();
            console.log(res);

            data.cols=[];
            for(let item of res) {
                if(!data.cols.find((/** @type {{ n: any; dl: any; }} */ el)=>el.n===item.n && el.dl===item.dl)) {
                    data.cols.push({
                            n:item.n,
                            ds:item.dl?.length===10 ? item.dl[5]+item.dl[6]+"/" +item.dl[2]+item.dl[3]: '00/00',
                            dt:new Date(item.dl).getTime(),
                            dl:item.dl
                        });
                }
            }
            data.cols=data.cols.sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>a.dt-b.dt);
            console.log(data.cols);


            response = await fetch('/edge/read', {
                method: 'POST',
                body: JSON.stringify({collection:'reports',filter:{coid:status.cycle._id,type:"A",ss:gp.ss,sc:gp.sc,fm:gp.fm},projection:{}}),
                headers: {'content-type': 'application/json'}
            });
            let reports= await response.json();
            
            console.log('reports',reports);



            /* build report data */

            data.reports=[];

            for(let pupil of gp.pupil) {

                // find the report
                let f=reports.find((/** @type {{ author: { type: string; tid: any; }; pupil: { pid: number; }; g: any; ss: string; sc: string; }} */ el)=>el.author.type==='teacher' && el.author.tid===data.user && el.pupil.pid===pupil.pid && el.g===g.g && el.ss===gp.ss && el.sc===gp.sc);
                
                // associated hod statement
                let h=reports.find((/** @type {{ author: { type: string; }; pupil: { pid: number; }; fm: number; ss: string; sc: string; }} */ el)=>el.author.type==='hod' && el.pupil.pid===pupil.pid && el.fm===gp.fm && el.ss===gp.ss && el.sc===gp.sc);
                
                // associated reports from other staff
                /** @type {any}*/
                let t=reports.filter((/** @type {{ author: { type: string; tid: any; }; pupil: { pid: number; }; g: any; ss: string; sc: string; }} */ el)=>el.author.type==='teacher' && el.author.tid!==data.user && el.pupil.pid===pupil.pid && el.g===g.g && el.ss===gp.ss && el.sc===gp.sc);
                
                /** @type {{tid:string,txt:string|null,ec:string|null,ep:string|null}[]}*/
                let other=[];
                if(t && t[0]) {
                    for(let item of t) other.push({tid:item.author.tid,txt:item.txt,ec:item.ec,ep:item.ep});
                } 
                // build assesmsent results and residuals re first assessment
                let cols=[];
                for(let col of data.cols) {
                    let a=res.find((/** @type {{ pid: number; dl: any; n: any; }} */ el)=>el.pid===pupil.pid && el.dl===col.dl && el.n===col.n);
                    cols.push({gd:a?a.gd:'X',pc:a?a.pc:0,r:0,ds:col.ds,n:col.n});
                }

                let gds=$config.grade.filter((/** @type {{ sc: string; }} */ el)=>el.sc===gp.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
                let  s1=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===cols[0].gd);
                for(let col of cols) {
                    let s2=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===col.gd); 
                    col.r = s1>-1 && s2>-1 ? s1-s2 : 0; 
                }
                


                if(f) {     // found report, add to data.reports
                    f.hod=h?h.txt:'',
                    f.associated=other;
                    f.cols=cols;
                    data.reports.push(f);

                } else {    // not found, create and then add to data.reports

                    // get cycle ec,ep info for form 
                    let d=status.cycle.detail.find((/** @type {{ fm: number; }} */ el)=>el.fm===gp.fm);


                    /** @type {any} */
                    let obj={
                                coid:status.cycle._id,
                                ay:status.cycle.ay,
                                y:status.cycle.y,
                                tt:status.cycle.tt,
                                ts:status.cycle.ts,
                                min:status.cycle.length.A.min,
                                max:status.cycle.length.A.max,
                                type:'A',
                                author:{type:'teacher',tid:data.user,sal:data.sal},
                                ec:d && d.ec ? $config.report.e.default : null,
                                ep:d && d.ep ? $config.report.e.default : null,
                                txt:'',
                                fm:gp.fm,
                                g:gp.g,
                                sc:gp.sc,
                                ss:gp.ss,
                                sl:gp.sl,
                                lv:gp.lv,
                                yr:gp.yr,
                                log:`${status.user}|${util.getDateTime()}`,
                                pupil:{pid:pupil.pid,sn:pupil.sn,pn:pupil.pn,hse:pupil.hse,tg:pupil.tg,gnd:pupil.gnd,id:pupil.id},
                                hod:h?h.txt:'',
                                associated:other,
                                cols:cols
                            };

                            let response = await fetch('/edge/insert', {
                                method: 'POST',
                                body: JSON.stringify({collection:'reports',documents:[obj]}),
                                headers: {'content-type': 'application/json'}
                            });
                            let res= await response.json();

                            if(res[0]) {
                                $alert.msg=`Missing report created`;
                                console.log(`Missing report created`);
                                obj._id=res[0];
                                data.reports.push(obj);

                            } else {
                                $alert.type='error';
                                $alert.msg=`Error inserting report`;
    
                                console.log(`Error inserting report`);
                            }






                }
                
            } // end of pupil loop



        } // end og gp

        
        
        

        //data.reports=data.reports.sort((/** @type {{ g: string; sn: string; pn: string; }} */ a,/** @type {{ g: any; sn: any; pn: any; }} */ b)=>a.g.localeCompare(b.g) || a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn) );
        console.log(data.reports);


       



    };

    onMount(async () => {
       console.log('reports/Teacher.svelte mounted');

       data.user=status.user;

       
       data.tIndex=status.teachers.findIndex((/** @type {{ tid: any; }} */ el)=>el.tid===data.user);

      
        await update();

    });

</script>



{#if data.detail.open}
    <Modal bind:open={data.detail.open}>
        <div class="row">
            <div class="col">
                <h4>{data.detail.pn}  {data.detail.sn}</h4>
            </div>
            <div class="col is-right">
                <button class="button outline" on:click={()=>data.detail.open=false}>Close</button>
            </div>
        </div>
        <div class="row">
            <Detail pid={data.detail.pid} type={'teacher'}/>
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
        <h4>Teacher Comments </h4>
    </div>
    <div class="col is-vertical-align">
        <fieldset>
            <legend>Select Teacher</legend>
           
        <select  id="Teacher" bind:value={data.tIndex} on:change={update}>
            <optgroup label="Teacher">
                    {#each status.teachers as item,index}
                        <option value={index}>({item.tid}) {item.pn} {item.sn}</option>
                    {/each}
            </optgroup>
          </select>
        </fieldset>
 
    </div>
    <div class="col is-vertical-align">
        <fieldset>
            <legend>Select Group</legend>
        
        <select  id="Groups" bind:value={data.index} on:change={updateReports}>
            <optgroup label="Groups">
                    {#each data.groups as item,index}
                        <option value={index}>{item.g} {item.ss}</option>
                    {/each}
            </optgroup>
          </select>
        </fieldset>
 
 
    </div>
    <div class="col is-vertical-align">
        &nbsp;
    </div>

</div>



{#if data.reports[0]}


<table>
    <tbody>
        {#each data.reports as row,rowIndex}
            <tr>
                <td><div><a href={'#'} on:click={()=>openDetail(rowIndex)}>{row.pupil.pn} {row.pupil.sn}</a></div><div><span class="small">{row.g}</span></div></td>
                <td>
                    <Edit bind:data={row} index={rowIndex}  bind:next={data.next} user={status.user}/>
                   
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