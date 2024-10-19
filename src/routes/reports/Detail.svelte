<script>
import { onMount } from 'svelte';
import {config,alert,assessments} from '$lib/store';
import Cell from '$lib/_Cell.svelte';
import * as util from '$lib/util';
import AssessmentTitle from '$lib/_AssessmentTitle.svelte';

/** @type {string}*/
export let type; // hm,tutor (editiable), teacher, enrichment, hod (read only)

/** @type {any}*/
export let detail;

/** @type {any}*/
let data={
    reports:[]
};

/**
 * 
 * @param {number} index
 */
 let openEdit=(index)=>{
    data.reports[index].edit=true;
};

/**
 * 
 * @param {number} index
 */
 let save=async(index)=>{

data.report[index].log=`${detail.user}|${util.getDateTime()}`;



let response = await fetch('/edge/update', {
    method: 'POST',
    body: JSON.stringify({
        collection:'reports',
        filter:{"_id": { "$oid": data.report[index]._id} },
        update:{txt: data.report[index].txt,log: data.report[index].log}
    }),
    headers: {'content-type': 'application/json'}
});

let res= await response.json();
        
if(res.matchedCount===1) {
    $alert.msg=`Saved report`;
    data.report[index].edit=false;

    detail._id=data.report[index]._id;
    detail.txt= data.report[index].txt;

} else {
    $alert.type='error';
    $alert.msg=`Error saving report`;
    detail.txt='';
    detail._id='';
}





};

onMount(async () => {
    console.log('reports/Detail.svelte mounted',type);
    console.log(detail);

    let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',filter:{coid:detail.cycleID,"pupil.pid":detail.pid},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
    let res= await response.json();


    //console.log(res);

    /** @type {any}*/
    let results=[];
    /** @type {string[]}*/
    let as=[];

    if(res[0]) {
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'results',filter:{lv:res[0].lv,yr:res[0].yr,pid:detail.pid},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        results= await response.json();

        // get assessments tag.overview=true , filter results based upon this!
        /*
        response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'assessments',filter:{lv:res[0].lv,yr:res[0].yr,"tag.overview":true,"tag.archive":false},projection:{_id:1}}),
            headers: {'content-type': 'application/json'}
        });
        let x=await response.json();
        */
        let x=$assessments.filter(el=>el.lv===res[0].lv && el.yr===res[0].yr && el.tag.pupil===true && el.tag.archive===false);
        as=x[0] ? x.map((/** @type {{ _id: any; }} */ el)=>el._id) : [];
        results=results.filter((/** @type {{ aoid: string; }} */ el)=>as.includes(el.aoid));
        
    }

    // add academic reports
    for(let report of res.filter((/** @type {{ type: string; author: { type: string; }; }} */ el)=>el.type==='A' && el.author.type==='teacher').sort((/** @type {{ sc: string; sl: string; author: { tid: string; }; }} */ a,/** @type {{ sc: any; sl: any; author: { tid: any; }; }} */ b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl) || a.author.tid.localeCompare(b.author.tid) )) {
        
        // add hod comment
        let h=res.find((/** @type {{ author: { type: string; }; sl: any; sc: any; }} */ el)=>el.author.type==='hod' && el.sl===report.sl && el.sc===report.sc);
        report.hod=h?h.txt:'';
        

        // get cols for assessment data
        /** @type {any}*/
        let cols=[];
        let pupilResults=results.filter((/** @type {{ pid: number; ss: any; sc: any; }} */ el)=>el.ss===report.ss && el.sc===report.sc);
                for(let item of pupilResults) {
                    if(!cols.find((/** @type {{ n: any; dl: any; }} */ el)=>el.n===item.n && el.dl===item.dl)) {
                        cols.push({
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
                cols=cols.sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>a.dt-b.dt);
             
                if(cols[0]) {
                    for(let col of cols) {
                        let f=pupilResults.find((/** @type {{ n: any; dl: any; }} */ el)=>el.n===col.n && el.dl===col.dl);
                        col.gd=f?f.gd:'X';
                        col.pc=f?f.pc:0;
                    }

                    let gds=$config.grade.filter((/** @type {{ sc: string; }} */ el)=>el.sc===report.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
                    let  s1=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===cols[0].gd);
                    for(let col of cols) {
                        let s2=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===col.gd); 
                        col.r = s1>-1 && s2>-1 ? s1-s2 : 0; 
                    }
                }

                report.cols=cols;


        
       
        data.reports.push(report);

        for(let item of data.reports) item.edit=false;



    }

    // add enrichments reports
    for(let report of res.filter((/** @type {{ type: string; }} */ el)=>el.type==='E').sort((/** @type {{ sl: string; author: { tid: string; }; }} */ a,/** @type {{ sl: any; author: { tid: any; }; }} */ b)=>a.sl.localeCompare(b.sl) || a.author.tid.localeCompare(b.author.tid))) {
        data.reports.push(report);
    }

    // add pastoral reports
    for(let report of res.filter((/** @type {{ type: string; }} */ el)=>el.type==='P').sort((/** @type {{ author: { type: any; tid: string; }; }} */ a,/** @type {{ author: { type: string; tid: any; }; }} */ b)=>b.author.type.localeCompare(a.author.type) || a.author.tid.localeCompare(b.author.tid))) {
        report.sl=report.author.type.toUpperCase();
        if(report.author.type==='xsa') report.sl='SA';
        data.reports.push(report);
    }

    //console.log(results);


    console.log(data.reports);

    data.report=data.reports;

});


</script>

{#if data.reports[0]}

        {#each data.reports as row,rowIndex}
        {#if row.type==='A'}
      
        <table>
            <tbody>
      
       
        {#if rowIndex===0 || (data.reports[rowIndex-1] && (row.ss!==data.reports[rowIndex-1].ss || row.sc!==data.reports[rowIndex-1].sc)) }
      
        <tr>
          
            <td>
                <span class="small bold">{row.sl} ({row.sc})</span>
             
            </td>
            <td>
                <div class="responsive">
                <table>
                    <tbody>
                        <tr>
                            {#each row.cols as col,colIndex}
                                <td><AssessmentTitle title={col.n} subtitle={col.ds}/></td>
                            {/each}
                        </tr>
                        <tr>
                            {#each row.cols as col,colIndex}
                                <td><Cell color={true} residual={col.r}>{col.gd}</Cell></td>
                            {/each}
                        </tr>
                    </tbody>
                </table>
                </div>
            </td>
        </tr>
        <tr>
            <td></td>
            <td>
            <span class="small">
           
                <p><span class="tag is-small lowercase">HoD</span> {row.hod}</p>
               
            </span>
            </td>
        </tr>
        {/if}
          
        <tr>
            <td>
                <div>
                    {#if row.txt && row.txt.length}
                    {#if !row.edit}
                    <button  class="button outline small" on:click={()=>openEdit(rowIndex)}>Edit</button>
                    {:else}
                    <button disabled={row.txt && row.txt.length && (row.txt.length<row.min || row.txt.length>row.max)} class="button outline small" on:click={()=>save(rowIndex)}>Save</button>
                    {/if}
                    {/if}
                 
                </div>
                <div>
                    {#if row.type==='A'}
                    <span class="small">EC {row.ec!==null ? row.ec : '.'} / EP {row.ep!==null ? row.ep : '.'}</span>
                    {/if}
                    {#if row.type==='E' || row.type==='P'}
                        <span class="small bold">{row.sl}</span>
                    {/if}
                    
                </div>
                <div>
                    <span class="small">{row.author.tid}</span>
                </div>
            </td>
            <td>
                {#if row.txt && row.txt.length}
                {#if row.edit}
                <textarea class={row.txt.length<row.min || row.txt.length>row.max ? 'red edit-comment' : 'green edit-comment'} bind:value={row.txt}/> 
              
                {:else}
                <textarea disabled class={row.txt.length<row.min || row.txt.length>row.max ? 'comment red small' : 'comment green small'} bind:value={row.txt}/> 
              
                {/if}
                {/if}
                 
                <div class="report-information">
                    <div><span class="small">{row.log}</span></div>
                    <div><span class="small">{row.author.sal}</span></div>
                </div>
                
               </td>
        </tr>
        </tbody>
        </table>
        {/if}
        {/each}

            <hr/>

{#each data.reports as row,rowIndex}
{#if row.type==='P' || row.type==='E'}
<table>
    <tbody>

<tr>
    <td>
        <div>
            {#if row.txt && row.txt.length}
            {#if !row.edit}
            <button class="button outline small" on:click={()=>openEdit(rowIndex)}>Edit</button>
            {:else}
            <button disabled={row.txt && row.txt.length && (row.txt.length<row.min || row.txt.length>row.max)} class="button outline small" on:click={()=>save(rowIndex)}>Save</button>
            {/if}
            {/if}
           
        </div>
        <div>
            {#if row.type==='A'}
            <span class="small">EC {row.ec!==null ? row.ec : '.'} / EP {row.ep!==null ? row.ep : '.'}</span>
            {/if}
            {#if row.type==='E' || row.type==='P'}
                <span class="small bold">{row.sl}</span>
            {/if}
            
        </div>
        <div>
            <span class="small">{row.author.tid}</span>
        </div>
    </td>
    <td>
       {#if row.txt && row.txt.length}
        {#if row.edit}
        <textarea class={row.txt && row.txt.length<row.min || row.txt.length>row.max ? 'red edit-comment' : 'green edit-comment'} bind:value={row.txt}/> 
      
        {:else}
        <textarea disabled class={row.txt.length<row.min || row.txt.length>row.max ? 'comment red small' : 'comment green small'} bind:value={row.txt}/> 
      
        {/if}
        {/if}
       
        <div class="report-information">
            <div><span class="small">{row.log}</span></div>
            <div><span class="small">{row.author.sal}</span></div>
        </div>
        
       </td>
</tr>
</tbody>
</table>
{/if}
{/each}

{:else}
<div class="row">
    <div class="col">
        &nbsp;
    </div>
</div>
<div class="row">
    <div class="col">
        <span class="tag">Harvesting pupil data...</span>
    </div>
</div>
<div class="row">
    <div class="col">
        &nbsp;
    </div>
</div>
<div class="row">
    <div class="col">
        &nbsp;
    </div>
</div>
{/if}



<style>

.responsive {
        overflow-x:auto;
    }
.small {
        font-size:1.2rem;
    }

    .edit-comment {
        width:70rem;
        height:14rem;
        font-size:normal;
    }
    .comment {
        width:70rem;
        height:7rem;
    }

    .bold {
        font-weight:600;
    }

    .red {
    background:rgba(178,34,34,0.15);
   
}

.lowercase {
    text-transform: none;
}

.green {
    background:rgba(34,139,34,0.15);
}

.report-information {
    display:flex;
    flex-direction:row;
    justify-content:space-between;
    width:100%;
    padding-bottom:0.25rem;
    padding-top:0.25rem;  
}


</style>


