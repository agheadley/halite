<script>
    import {groups} from '$lib/store';
    import {alert,config,teachers} from '$lib/store';
	import { onMount } from 'svelte';
    import * as util from '$lib/util';


    /** @type {any}*/
    export let status;


    /** @type {any}*/
    let data={
        index:0,
        subjects:[],
        reports:[],
        txt:'',
        all:false
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

        let response = await fetch('/edge/read', {
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
                                obj._id=res[0];
                                data.reports.push[0];

                            } else {
                                console.log(`Error inserting report`);
                            }

                }

                let tchs=status.reports.filter((/** @type {{ author: { type: string; }; pupil: { pid: number; }; fm: number; ss: string; sc: string; }} */ el)=>el.author.type==='teacher' && el.pupil.pid===pupil.pid && el.fm===gp.fm && el.ss===gp.ss && el.sc===gp.sc);
               
                for(let item of tchs) data.reports.push(item);

            }
        }

        console.log(data.reports);
    };

    let updateSubjects=()=>{

        data.subjects=status.subjects;
        
        let x=status.subjects.filter((/** @type {{ tid: any; }} */ el)=>el.tid===status.user);
        console.log(x,x.length);
        if(x[0] && !data.all) data.subjects=x;
        
        console.log(data.subjects);

    };


    onMount(async () => {
       
        updateSubjects();
        await update();
    });



</script>



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
          <input type=checkbox bind:checked={data.all} on:change={updateSubjects}/>
        </p>
        </fieldset>
 
    </div>
    <div class="col is-vertical-align">
        &nbsp;
    </div>

</div>


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
        <tr>
            {#if row.author.type==='hod'}
                
            <td>
                <div>
                    {row.pupil.pn} {row.pupil.sn}
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
                <td>{#if row.txt!==null}<textarea class="comment" disabled bind:value={row.txt}></textarea>{/if}</td>
            
            {/if}
        </tr>
        {/each}
   </tbody>

</table>
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