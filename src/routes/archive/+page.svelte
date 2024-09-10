<script>
import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import {assessments,location} from '$lib/store';
import * as file from '$lib/file';
import SelectCohort from './SelectCohort.svelte';

/** @type {any}*/
let cohorts={list:[],index:0,subjects:[],sIndex:0,results:[],total:[],grade:[]};

let update=async()=>{
    let s=cohorts.subjects[cohorts.sIndex];
    let i=cohorts.list.findIndex((/** @type {{ ss: any; sc: any; }} */ el)=>el.ss===s.ss && el.sc===s.sc);
    cohorts.index = i>-1 ? i : 0;
    await getData();
};


let getData=async()=>{
    let l=cohorts.list[cohorts.index];
    console.log('getting assessment,result data',l._id);

    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'assessments',filter:{_id:{$oid:l._id}},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    let res= await response.json();
    console.log(res);
    let a=res[0] ? res[0] : null;
    cohorts.grade=a? a.grade : [];
    cohorts.total=a? a.total : [];
    


    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'results',filter:{aoid:l._id},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    res= await response.json();
    
    cohorts.results = res[0] ? res.sort((/** @type {{ g: string; sn: string; pn: string; }} */ a,/** @type {{ g: any; sn: any; pn: any; }} */ b)=>a.g.localeCompare(b.g) || a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn) ) : [];


    console.log(cohorts.results);
};

let exportResults=()=>{
    let l=cohorts.list[cohorts.index];
    let out=[];
    out[0]=['pid','g','pn','sn','scrs','gd','pc',`${l.lv} ${l.yr} ${l.ss} (${l.sc}) ${l.n} ${l.ds}`];

    for(let row of cohorts.results) out.push([row.pid,row.g,row.pn,row.sn,row.t.toString(),row.gd,row.pc]);

    out.push(['section','total','weight']);
    for(let row of cohorts.total) out.push([row.n,row.t,row.w]);
    out.push(['grade','pc']);
    for(let row of cohorts.grade) out.push([row.gd,row.pc]);
    console.log(out);
    file.csvDownload(out,"ARCHIVE.csv");




        
};

onMount(async () => {
        $location='/assessments';
        console.log(`archive mounted`);
        cohorts.list=$assessments.filter(el=>el.tag.archive===true)
            .sort((a,b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl) || b.lv.localeCompare(b.lv) || b.yr-a.yr || a.dt-b.dt)
            .map(el=>({_id:el._id,sc:el.sc,sl:el.sl,ss:el.ss,lv:el.lv,yr:el.yr,n:el.n,dl:el.dl,ds:el.ds,dt:el.dt}));
        cohorts.subjects=[];
        for(let item of cohorts.list) {
            if(!cohorts.subjects.find((/** @type {{ sc: any; ss: any; }} */ el)=>el.sc===item.sc && el.ss===item.ss)) cohorts.subjects.push({sc:item.sc,ss:item.ss,sl:item.sl});
        }

    console.log(cohorts);
    await getData();
       
});
    

</script>
<SelectCohort/>

<div class="row">
    <div class="col">
        <h4>Assessment Archive</h4>
    </div>
    <div class="col">
        <a href={'/assessments'} class="button outline">Back</a>
    </div>
</div>


<div class="row">
    <div class="col is-vertical-align">
          
        <fieldset id="subject" class="is-full-width">
            <legend>Cohort</legend>
            <p class="grouped">
            <select  id="subject" bind:value={cohorts.sIndex} on:change={update}>
                <optgroup label="Subject (course)">
                        {#each cohorts.subjects as item,index}
                            <option value={index}>{item.sl} ({item.sc})</option>
                        {/each}
                </optgroup>
              </select>
            </p>
            </fieldset>
        
        
    </div>
    <div class="col is-vertical-align">
          
        <fieldset id="assessment" class="is-full-width">
            <legend>Cohort</legend>
            <p class="grouped">
            <select  id="assessment" bind:value={cohorts.index} on:change={getData}>
                <optgroup label="">
                        {#each cohorts.list as item,index}
                        {#if item.sc===cohorts.subjects[cohorts.sIndex].sc && item.ss===cohorts.subjects[cohorts.sIndex].ss}
                            <option value={index}>{item.ss} ({item.sc}) {item.lv} {item.yr} {item.n} {item.ds}</option>
                        {/if}
                        {/each}
                </optgroup>
              </select>
            </p>
            </fieldset>
        
        
    </div>
</div>


<div class="row">
    <div class="col">
        <button on:click={exportResults} class="button outline fixed-width">Archive&nbsp;
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
    </div>
</div>
<div class="row">

    <div class="col">
        <table class="striped small">
            <thead>
                <tr>
                    <th>pid</th>
                    <th>group</th>
                    <th>pupil</th>
                    <th>scores</th>
                    <th>gd</th>
                    <th>pc</th>   
                </tr>
            </thead>
            <tbody>
                {#each cohorts.results as row,rowIndex}
                    {#if rowIndex<10}
                        <tr>
                            <td>{row.pid}</td>
                            <td>{row.g}</td>
                            <td>{row.pn} {row.sn}</td>
                            <td>{row.t.toString()}</td>
                            <td>{row.gd}</td>
                            <td>{row.pc}</td>
                        </tr>
                    {/if}
                {/each}
            </tbody>
        </table>
    </div>


</div>


<style>

.small {
    font-size:1.2rem;
}
</style>