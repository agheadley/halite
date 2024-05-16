<script>

import { onMount } from 'svelte';
import AssessmentTitle from '$lib/_AssessmentTitle.svelte';
import GradeCell from '$lib/_GradeCell.svelte';
import Chance from '$lib/_Chance.svelte';
import {config} from '$lib/store';

/** @type {{pid:number,sn:string,pn:string,gnd:string,hse:string,tg:string,lv:string,yr:number,context:string}}*/ 
export let status;

/** @type {any}*/
let data={
    groups:[],
    assessments:[],
    results:[],
    intake:{},
    table:[],
    std:{A:'',B:''}
};
import {fade} from 'svelte/transition';

/* inner modal for boundaries/totals/feedback */
/** @type {boolean} */
export let detail = false;

/**
 * 
 * @param {number} rowIndex
 * @param {number} colIndex
 */
let showDetail=(rowIndex,colIndex)=>{
    detail=true;
};

onMount(async () => {
    
    if(status.lv==='US') data.std={A:$config.std.US.A,B:$config.std.US.B};
    else if (status.lv==='MS') data.std={A:$config.std.MS.A,B:$config.std.MS.B};
    else if (status.lv==='L1') data.std={A:$config.std.L1.A,B:$config.std.L1.B};

   
    
    /* get groups */
    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'groups',filter:{"pupil.pid":status.pid,lv:status.lv,yr:status.yr} ,projection:{g:1,sc:1,sl:1,ss:1}}),
        headers: {'content-type': 'application/json'}
    });
    let res= await response.json();
    data.groups = res[0] ? res.sort((/** @type {{ sl: string; }} */ a,/** @type {{ sl: any; }} */ b)=>a.sl.localeCompare(b.sl)) : [];
    //console.log(data.groups);

    /* get assessments by status.context */
    
    /* testing */
    //status.context='parent';
    
    /** @type {any}*/
    let filter={"tag.archive":false,lv:status.lv,yr:status.yr};
    if(status.context==='overview') filter["tag.overview"]=true;
    if(status.context==='pupil') filter["tag.pupil"]=true;
    if(status.context==='parent') filter["tag.parent"]=true;
    //console.log(filter);
    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'assessments',filter:filter ,projection:{g:1,sc:1,sl:1,ss:1,dt:1,ds:1,total:1,grade:1,n:1,tag:1}}),
        headers: {'content-type': 'application/json'}
    });
    res= await response.json();
    data.assessments=res[0] ? res.sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>a.dt-b.dt) : [];
    //console.log(data.assessments);
    
    /* get results by status.pid */
    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'results',filter:{pid:status.pid,lv:status.lv,yr:status.yr} ,projection:{pid:1,aoid:1,sc:1,sl:1,ss:1,gd:1,scr:1,pc:1,t:1}}),
        headers: {'content-type': 'application/json'}
    });
    data.results= await response.json();

     /* get intake by status.pid */
     response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'intake',filter:{pid:status.pid,lv:status.lv,yr:status.yr} ,projection:{pid:1,base:1,pre:1}}),
        headers: {'content-type': 'application/json'}
    });
    res= await response.json();
    data.intake=res[0] && res[0].pre ? res[0].pre : [];

    console.log(data.intake);
    /* build table with n,ds,gd,pc, grade (assesment.grade),total (t,assessment totals) vs ss,sl,sc from groups */

    for(let group of data.groups) {
       

        let col=[];
        for(let assessment of data.assessments.filter((/** @type {{ sc: any; ss: any; }} */ el)=>el.sc===group.sc && el.ss===group.ss)) {
            let f=data.results.find((/** @type {{ aoid: any; }} */ el)=>el.aoid===assessment._id);
            
            /** @type {any[]} */
            let total=[];
            assessment.total.forEach((/** @type {{ n: any; t: any; w: any; }} */ item,/** @type {string | number} */ i)=>{total.push({scr:f&&f.t[i] ? f.t[i] : 0,n:item.n,t:item.t,w:item.w})});
            let a={gd:f?f.gd:'X',scr:f?f.scr:0,pc:f?f.pc:0,n:assessment.n,ds:assessment.ds,dt:assessment.dt,grade:assessment.grade,total:total,tag:assessment.tag}
            
            col.push(a);
        }
        let f=data.intake.find((/** @type {{ sc: any; ss: any; }} */ el)=>el.sc===group.sc && el.ss===group.ss);


        let row={sl:group.sl,ss:group.ss,sc:group.sc,g:group.g,col:col,pre:{A:f?f.A:0,B:f?f.B:0}};
        data.table.push(row);
    }

    console.log(data.table);
       
});



</script>




{#if detail}
<div class="parent" transition:fade={{ duration: 200 }}>
    <div role="cell" tabindex=0 class="background" on:keydown={()=>detail=false} on:click={()=>detail=false}/>
    <div class="modal">
        <slot>
            XYZ
        </slot>
    </div>
</div>
{/if}


<div class="container">
<div class="row">
    <div class="col">
        <h4>{status.pn} {status.sn} ({status.hse})</h4>
      
    </div>
</div>
<hr/>


{#if data.table[0] && data.table.length}
{#each data.table as row,rowIndex}
<div class="container">
<table>
    <tbody>
        <tr>
            <th></th>
            {#each row.col as col,colIndex}
            <td> <AssessmentTitle title={col.n} subtitle={col.ds}/></td>
            {/each}
        </tr>
        <tr>
            <td><span class="bold">{row.sl} ({row.sc})</span></td>
            {#each row.col as col,colIndex}

            <td>
                <div>
                    <!--<button on:click={()=>showDetail(rowIndex,colIndex)}></button>-->
                    <a href={'#'} on:click={()=>showDetail(rowIndex,colIndex)} on:keydown={()=>showDetail(rowIndex,colIndex)} class="button clear icon-only">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-eye"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                      </a>
                </div>
                <div>
                {#if status.context==='assessments'}
                <GradeCell color={colIndex===0 ? false :true} base={row.col[0].gd} grade={col.gd} grades={$config.grade.filter(el=>el.sc===row.sc)}>{col.gd}</GradeCell>
                {/if}
                </div>
            </td>
            {/each}
        </tr>
    
    </tbody>
</table>
{#if status.context!=='parent'}
<div class="row">
    &nbsp;
</div>
<div class="row">
    <div class="col">
        CHANCES ({data.std.A})
    </div>
    <div class="col">
        <div>
            <span class="tag">{data.std.A}</span>
        </div>
        <div>
            <Chance grades={$config.grade.filter(el=>el.sc===row.sc)} score={row.pre.A ? row.pre.A : 0}/>
        </div>
        </div>
   
    <div class="col">
        <div>
            <span class="tag">{data.std.B}</span>
        </div>
        <div>
            <Chance grades={$config.grade.filter(el=>el.sc===row.sc)} score={row.pre.B ? row.pre.B : 0}/>
        </div>
    </div>
</div>
{/if}
</div>

{/each}

{:else}
<p>harvesting data ...</p>
{/if}



</div> <!--/container-->



<style>

.bold {
    font-weight:600;

}
.parent{
    position:fixed;
    top:0px;
    left:0px;
    width:100vw;
    height:100vh;
    z-index:100000;
}

.background{
    position:fixed;
    top:0px;
    left: 0px;
    width:100%;
    height:100%;
    background-color:#333;
    opacity: 0.0;
}

.modal{
    padding:2rem;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width:20rem;
    /*max-width:50rem;*/
    max-width:90vw;
    min-height:20rem;
    background-color: white;
    border-radius:0.3rem;
    border:1px solid #333;
}

.name {
    max-width:20rem;
    width:20rem;
}

.group {
    max-width:5rem;
    width:5rem;
}
</style>
