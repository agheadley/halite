<script>
    import {groups} from '$lib/store';
    import {alert,config,teachers,assessments} from '$lib/store';
	import { onMount } from 'svelte';
    import * as util from '$lib/util';
    import Modal from '$lib/_Modal.svelte';
    import Detail from './Detail.svelte';
    import Cell from '$lib/_Cell.svelte';
    import AssessmentTitle from '$lib/_AssessmentTitle.svelte';

    /** @type {any}*/
    export let status;


    /** @type {any}*/
    let data={
        index:0,
        subjects:[],
        reports:[],
        results:[],
        cols:[],
        txt:'',
        all:false,
        detail:{open:false,txt:'',_id:'',type:'hod',pid:0,sn:'',pn:'',user:'',cycleID:''}
    };

     /**
     * 
     * @param {number} index
     */
     let openDetail=(index)=>{
        data.detail.pid=data.reports[index].pupil.pid;
        data.detail.pn=data.reports[index].pupil.pn;
        data.detail.sn=data.reports[index].pupil.sn;
        data.detail.open=true;
        data.detail.user=status.user;
        data.detail.cycleID=status.cycle._id;
        
    };

    let save=async()=>{

        let count=0;
        let total=0;

        let log=`${status.user}|${util.getDateTime()}`;

        

        for(let row of data.reports) {
            if(row.author.type==='hod') {
                total+=1;
                let response = await fetch('/edge/update', {
                    method: 'POST',
                    body: JSON.stringify({
                        collection:'reports',
                        filter:{"_id": { "$oid": row._id } },
                        update:{txt:data.txt,log:log}
                    }),
                    headers: {'content-type': 'application/json'}
                });

                let res= await response.json();
            
                if(res.matchedCount===1) {
                    count+=1;
                    $alert.msg=`Updated ${count}/${total} reports`;
                    row.txt=data.txt;
                } else {
                    $alert.type='error';
                    $alert.msg=`Error updating`;
                }
                
            }
        }

        if(count<total) {
            $alert.type='error';
            $alert.msg=`Only ${count}/${total} reports correctly updated.`;
        } else {
            data.txt='';
        }
    };

    let update=async()=>{

        data.reports=[];
        let s=data.subjects[data.index];
        console.log(s);


        let t=$teachers.find(el=>el.tid===s.tid);

        let gps=$groups.filter(el=>el.ss===s.ss && el.sc===s.sc && el.fm===s.fm);
        console.log(gps);

        data.cols=$assessments.filter(el=>el.yr===s.yr && el.lv===s.lv && el.ss===s.ss && el.sc===el.sc);
        data.cols=data.cols.sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>a.dt-b.dt);

        console.log(data.cols);




        let response = await fetch('/edge/read', {
                method: 'POST',
                body: JSON.stringify({collection:'results',filter:{lv:s.lv,yr:s.yr,ss:s.ss,sc:s.sc},projection:{}}),
                headers: {'content-type': 'application/json'}
        });
        data.results= await response.json();
        console.log(data.results);
        console.log(s);
        //data.cols=[];
        for(let item of data.results) {
            /*
            if(!data.cols.find((el)=>el.n===item.n && el.dl===item.dl)) {
                
                let f=$assessments.find(el=>el.yr===s.yr && el.lv===s.lv && el.ss===s.ss && el.sc===el.sc && el.n===item.n && el.dl===item.dl);
                console.log(f);
                let p=f?f.tag.pupil:false;
                let o=f?f.tag.overview:false;
                
                data.cols.push({
                        n:item.n,
                        ds:item.dl?.length===10 ? item.dl[5]+item.dl[6]+"/" +item.dl[2]+item.dl[3]: '00/00',
                        dt:new Date(item.dl).getTime(),
                        dl:item.dl,
                        pupil:p,
                        overview:o
                    });
            }
            */
        }
        data.cols=data.cols.sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>a.dt-b.dt);
        console.log(data.cols);

        response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',filter:{coid:status.cycle._id,fm:s.fm,ss:s.ss,sc:s.sc},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        let reports=res[0] ? res : [];
    
        
        data.reports=[];

        for(let gp of gps) {
            for(let pupil of gp.pupil) {
                // find hod report
                let f=reports.find((/** @type {{ author: { type: string; }; pupil: { pid: number; }; fm: number; ss: string; sc: string; }} */ el)=>el.author.type==='hod' && el.pupil.pid===pupil.pid && el.fm===gp.fm && el.ss===gp.ss && el.sc===gp.sc);
                
                // get cycle ec,ep info for form 
                let d=status.cycle.detail.find((/** @type {{ fm: number; }} */ el)=>el.fm===gp.fm);


                if(f) {     // found, add to data reports
                    f.g=gp.g;   // set group to current group, in case of set change
                    data.reports.push(f);

                } else {    // not found, create and add
                    
                    /** @type {any} */
                    let obj={
                                coid:status.cycle._id,
                                ci:status.cycle.index,
                                ay:status.cycle.ay,
                                y:status.cycle.y,
                                tt:status.cycle.tt,
                                ts:status.cycle.ts,
                                min:status.cycle.length.A.min,
                                max:status.cycle.length.A.max,
                                type:'A',
                                author:{type:'hod',tid:t?t.tid:'',sal:t?t.sal:''},
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
                                pupil:{pid:pupil.pid,sn:pupil.sn,pn:pupil.pn,hse:pupil.hse,tg:pupil.tg,gnd:pupil.gnd,id:pupil.id}
                         
                            };

                            let response = await fetch('/edge/insert', {
                                method: 'POST',
                                body: JSON.stringify({collection:'reports',documents:[obj]}),
                                headers: {'content-type': 'application/json'}
                            });
                            let res= await response.json();

                            if(res[0]) {
                                console.log(`Missing reports created`);
                                $alert.msg=`Missing report created`;
    
                                obj._id=res[0];
                                data.reports.push[obj];

                            } else {
                                console.log(`Error inserting report`);
                                $alert.type='error';
                                $alert.msg=`Error inserting report`;
                            }
    
                            

                }

                let tchs=reports.filter((/** @type {{ author: { type: string; }; pupil: { pid: number; }; fm: number; ss: string; sc: string; }} */ el)=>el.author.type==='teacher' && el.pupil.pid===pupil.pid && el.fm===gp.fm && el.ss===gp.ss && el.sc===gp.sc);
               
                for(let item of tchs) data.reports.push(item);

            }
        }


       
        console.log(data.reports);
    };

    let updateSubjects=async()=>{

        data.subjects=status.subjects;
        
        let x=status.subjects.filter((/** @type {{ tid: any; }} */ el)=>el.tid===status.user);
        console.log(x,x.length);
        if(x[0] && !data.all) data.subjects=x;
        
        console.log(data.subjects);

        await update();
    

    };


    onMount(async () => {
        /* update $assessments with changes */
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'assessments',filter:{},projection:{_id:1,sc:1,sl:1,ss:1,dt:1,dl:1,ds:1,n:1,tag:1,lv:1,yr:1,grade:1,total:1}}),
            headers: {'content-type': 'application/json'}
        });
        $assessments= await response.json();

        updateSubjects();
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
            <Detail type={'enrichment'} bind:detail={data.detail}/>
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
        <h4>HoD Statement</h4>
    </div>
    <div class="col is-vertical-align">
       <fieldset>
        <legend>Select Subject</legend>
        <p class="grouped">
        <select  id="subject" bind:value={data.index} on:change={update}>
            <optgroup label="Subject">
                    {#each data.subjects as item,index}
                        <option value={index}>{item.fm} ({item.sc}) {item.sl} </option>
                    {/each}
            </optgroup>
          </select>
          <!--<input type=checkbox bind:checked={data.all} on:change={updateSubjects}/>-->
        </p>
        </fieldset>
 
    </div>
    <div class="col is-vertical-align">
        &nbsp;
    </div>

</div>


    <table>
        <tbody>
            <tr>
                {#each data.cols as col,colIndex}
                    <td><AssessmentTitle title={col.n} subtitle={col.ds}/></td>
                {/each}
            </tr>
        <tr>
            {#each data.cols as col,colIndex}
                <td>
                    {#if col.tag.pupil}
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-activity"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    {/if}
                </td>
            {/each}
        </tr>
    </tbody>
    </table>



{#if data.reports[0]}


<table>
    <thead>  
        <tr>
            <th></th>
            <td>
                <div>
                    <textarea class={data.txt.length<status.cycle.length.A.min || data.txt.length>status.cycle.length.A.max ? 'comment red' : 'comment green' } bind:value={data.txt}/>
                </div>
                <div class="flex-row">
                    <span class="tag small">{data.txt.length} / {status.cycle.length.A.min} [{status.cycle.length.A.max}]</span>
                </div>
            </td>
          
        </tr>
        <tr>
            <th></th>
         
            <th><button disabled={data.txt.length<status.cycle.length.A.min || data.txt.length>status.cycle.length.A.max} class="button dark" on:click={save}>Save HoD Comment</button></th>
             
            </tr>     
    </thead>
   <tbody>
    {#each data.reports as row,rowIndex}
        <tr>{row.pupil.pid}</tr>
        <tr>
            {#if row.author.type==='hod'}
                
            <td>
                <div>
                    <a href={'#'} on:click={()=>openDetail(rowIndex)}>{row.pupil.pn} {row.pupil.sn}</a>
                  
                </div>
                <div><span class="small">{row.g}</span></div>
                <div><span class="bold small">HoD</span></div>
            </td>
            <td>
                    <div>
                        <textarea class="comment bold" disabled bind:value={row.txt}></textarea>
                    </div>
                    <div class="flex-row">
                        <div>
                            <span class="small">{row.author.sal}</span>
                        </div>
                        {#if data.txt!==null}
                        <div>
                            <span class="small">{row.txt.length} / {status.cycle.length.A.min} [{status.cycle.length.A.max}]</span>
                        </div>
                        {/if}
                        <div>
                            <span class="small">{row.log}</span>
                        </div>
                    </div>
               
            </td>

            {:else}

                <td>
                    <div>
                        <span class="small">{row.author.tid}
                    </div>
                    <div>
                        <span class="small">EC {row.ec!==null ? row.ec : '.'} / EP {row.ep!==null ? row.ep : '.'}</span>
                    </div>
                </td>
                <td>{#if row.txt!==null}<textarea class="comment small" disabled bind:value={row.txt}></textarea>{/if}</td>
            
            {/if}
        </tr>
        {/each}
   </tbody>

</table>
{:else}

<p>No report found for this cycle</p>
{/if}


<style>

.flex-row {
    display:flex;
    flex-direction:row;
    justify-content:space-between;
    width:70rem;
    padding-bottom:0.25rem;
    padding-top:0.25rem;
}

.comment {
        width:70rem;
        height:10rem;
    }

.red {
    background:rgba(178,34,34,0.15);
   
}

.green {
    background:rgba(34,139,34,0.15);
}

.small {
    font-size:1.2rem;
}

.bold {
    font-weight:600;
}
</style>