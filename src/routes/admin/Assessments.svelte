<script>
import {cohorts,groups,config,alert} from '$lib/store';
import { onMount } from 'svelte';
import * as util from '$lib/util';
import * as file from '$lib/file';
import Modal from '$lib/_Modal.svelte';
	
/** @type {any}*/
export let status;


/** @type {any}*/
let data= {
    tabs:['Manage','Create'],
    tab:'Manage',
    create:{active:false,confirm:false,max:15,n:'',dl:'0000-00-00',ds:'',dt:0,lv:'',yr:0,tag:{open:true,grade:false,overview:false,pupil:false,parent:false,pupiledit:false,exam:true,archive:false}},
    assessments:{txt:'',confirm:false,index:0,list:[],records:[],results:[],tag:{archive:false,grade:false,pupiledit:false,exam:false,open:false,overview:false,pupil:false,parent:false}}

};





$:{
    if(!data.create.tag.grade) data.create.tag.pupiledit=false;
}


$:{
    if(!data.assessments.confirm) data.assessments.txt='';
}


let removeAssessments=async()=>{
    let a=data.assessments.list[data.assessments.index];
    let c=$cohorts.assessments.years.list[$cohorts.assessments.years.index];

    let response = await fetch('/edge/delete', {
        method: 'POST',
        body: JSON.stringify({collection:'assessments',filter:{n:a.n,dl:a.dl,lv:c.lv,yr:c.yr,"tag.archive":false,"tag.exam":true}}),
        headers: {'content-type': 'application/json'}
    });

  
    let res= await response.json();
  
    let msg='';
    if(res.deletedCount && res.deletedCount>=1 ) {
        msg=`Deleted ${res.deletedCount} assessments.`;
    } else {
        $alert.type='error';
        $alert.msg=`Error deleting assessments`;
    }

    response = await fetch('/edge/delete', {
        method: 'POST',
        body: JSON.stringify({collection:'results',filter:{n:a.n,dl:a.dl,lv:c.lv,yr:c.yr}}),
        headers: {'content-type': 'application/json'}
    });
    res= await response.json();
    if(res.deletedCount && res.deletedCount>=1 ) {
        $alert.msg=msg+` Deleted ${res.deletedCount} results.`;
    } else {
        $alert.type='error';
        $alert.msg=`Error deleting results`;
    }

};


let openConfirm=()=>{
    let c=$cohorts.assessments.years.list[$cohorts.assessments.years.index];
    data.create.lv=c.lv;
    data.create.yr=c.yr;
  
    data.create.ds=data.create.dl?.length===10 ? data.create.dl[5]+data.create.dl[6]+"/" +data.create.dl[2]+data.create.dl[3]: '00/00';
    data.create.dt=new Date(data.create.dl).getTime();
    data.create.confirm=true;
};


let validate=()=>{
        data.create.n=data.create.n.replace(/ /g,"_");
        data.create.n=data.create.n.replace(/[^A-Za-z0-9._-]/g,""); //replace(/\W+/g, "");

        data.create.n = data.create.n.length && data.create.n.length>data.create.max ? data.create.n.slice(0,(data.create.max-1)) : data.create.n;
    
};


let create=async()=>{

    data.create.active=true;
    // don't generate exams for sc===X' e.g. EAL, ToK
    /** @type {any}*/
    let subjects=[];
    for(let item of $groups.filter(el=>el.lv===data.create.lv && el.yr===data.create.yr && el.sc!=='X')) {
        if(!subjects.find((/** @type {{ sc: string; ss: string; }} */ el)=>el.sc===item.sc && el.ss===item.ss)) subjects.push({sc:item.sc,ss:item.ss,sl:item.sl});
    }
    console.log(subjects);

    let results=[];

    for(let subject of subjects) {

        let gps=$groups.filter(el=>el.lv===data.create.lv && el.yr===data.create.yr && el.sc===subject.sc && el.ss===subject.ss);

        let grades=[];
        let gds=$config.grade.filter((/** @type {{ sc: any; }} */ el)=>el.sc===subject.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr)
        for(let item of gds) grades.push({gd:item.gd,pc:item.pc,scr:item.scr,active:true});
    

        let document={
            lv:data.create.lv,
            yr:data.create.yr,
            n:data.create.n,
            dl:data.create.dl,
            ds:data.create.ds,
            dt:data.create.dt,
            sc:subject.sc,
            sl:subject.sl,
            ss:subject.ss,
            tag:{
                open:data.create.tag.open,
                grade:data.create.tag.grade,
                overview:data.create.tag.overview,
                pupil:data.create.tag.pupil,
                parent:data.create.tag.parent,
                exam:data.create.tag.exam,
                archive:data.create.tag.archive,
                pupiledit:data.create.tag.pupiledit
            },
            total:[{t:100,w:100,n:'P1'}],
            grade:grades,
            log:`${status.user}|${util.getDateTime()}`

        };

        console.log(document);
        let response = await fetch('/edge/insert', {
		    method: 'POST',
		    body: JSON.stringify({collection:'assessments',documents:[document]}),
		    headers: {'content-type': 'application/json'}
	    });
        let res= await response.json();


        if(res.length && res.length===1) {
                let aoid=res[0];

                for(let g of gps) {
            


                    for(let p of g.pupil) {
                        results.push({
                            aoid:aoid,
                            lv:data.create.lv,
                            yr:data.create.yr,
                            n:data.create.n,
                            dl:data.create.dl,
                            sc:subject.sc,
                            ss:subject.ss,
                            pid:p.pid,
                            sn:p.sn,
                            pn:p.pn,
                            g:g.g,
                            t:[0],
                            gd:'U',
                            pc:0,
                            scr:0,
                            fb:'',
                            log:`${status.user}|${util.getDateTime()}`
                        });
                    }
                }


                


            
        } else {
            $alert.type='error';
            $alert.msg=`Error creating 'assessments' documents ${subject.sl}`;
        }


      


    } // end of subjects



    let response = await fetch('/edge/insert', {
        method: 'POST',
        body: JSON.stringify({collection:'results',documents:results}),
        headers: {'content-type': 'application/json'}
    });

    let res= await response.json();
    console.log(res);
    if(res.length && res.length>0) {
        $alert.msg=`${res.length} pupil 'results' documents created`;
    } else {
        $alert.type='error';
        $alert.msg=`Error creating 'results' documents`;
    }


    data.create.active=false;
};

let updateResults=async()=>{
    let a=data.assessments.list[data.assessments.index];
    let c=$cohorts.assessments.years.list[$cohorts.assessments.years.index];
    
    // get matching assessments
    data.assessments.records=[];
    let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'assessments',filter:{n:a.n,dl:a.dl,lv:c.lv,yr:c.yr,"tag.archive":false,"tag.exam":true},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
    let res= await response.json();
    data.assessments.records=res[0] ? res.sort((/** @type {{ sc: string; sl: string; }} */ a,/** @type {{ sc: any; sl: any; }} */ b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl)): [];

    data.assessments.tag=res[0] && res[0].tag ? res[0].tag : {archive:false,grade:false,pupiledit:false,exam:false,open:false,overview:false,pupil:false,parent:false};
   
    // get results
    data.assessments.results=[];
    response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'results',filter:{n:a.n,dl:a.dl,lv:c.lv,yr:c.yr},projection:{}}),
            headers: {'content-type': 'application/json'}
    });
    res= await response.json();
    data.assessments.results=res[0]? res : [];
   
    console.log(data.assessments.results);
    
    
    
};

let update=async()=>{
    
    let c=$cohorts.assessments.years.list[$cohorts.assessments.years.index];
    
    let response = await fetch('/edge/distinct', {
            method: 'POST',
            body: JSON.stringify({collection:'assessments',match:{lv:c.lv,yr:c.yr,"tag.archive":false,"tag.exam":true},aggregate:['lv','yr','dl','n','dt']}),
            headers: {'content-type': 'application/json'}
        });
    let res= await response.json();
        
   
    data.assessments.list=res[0] ? res.sort((/** @type {{ dt: number; n: string; }} */ a,/** @type {{ dt: number; n: any; }} */ b)=>a.dt-b.dt || a.n.localeCompare(b.n)): [];
    data.assessments.index=0;

   
    if(data.assessments.list[0]) await updateResults();
};

let updateTag=async()=>{
    let a=data.assessments.list[data.assessments.index];
    let c=$cohorts.assessments.years.list[$cohorts.assessments.years.index];
   
    console.log('updating tag',data.assessments.tag);

    $alert.msg='requesting update ...';
    
    let response = await fetch('/edge/update', {
		    method: 'POST',
		    body: JSON.stringify({
                collection:'assessments',
                filter:{n:a.n,dl:a.dl,lv:c.lv,yr:c.yr},
                update:{tag:data.assessments.tag}
                }),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);

        if(res.matchedCount>=1) {
            $alert.msg=`tag updates saved to ${res.matchedCount} assessments. ${res.modifiedCount} changes made`;
            await update();
   
        } else {
            $alert.type='error';
            $alert.msg=`Error updating assessments tags`;
        }
};

let exportResults=()=>{
    /** @type {string[][]}*/
    let out=[];

    
    out[0]=['_id','aoid','lv','yr','ss','sc','n','dl','pid','pn','sn','g','t','gd','pc','scr','fb','log'];
   
    for(let row of data.assessments.results) {

        /** @type {string[]}*/
        let line=[
            row._id,
            row.aoid,
            row.lv,
            row.yr,
            row.ss,
            row.sc,
            row.n,
            row.dl,
            row.pid,
            row.pn.replace(/,/g,' '),
            row.sn.replace(/,/g,' '),
            row.g,
            row.t.toString().replace(/,/g,'|'),
            row.gd,
            row.pc,
            row.scr,
            row.fb.replace(/,/g,' '),
            row.log.replace(/,/g,'')
        ];
       




        out.push(line);
    }

    console.log(out);
    file.csvDownload(out,"ASSESSMENT-RESULTS.csv");




};

let exportAssessments=()=>{
     /** @type {string[][]}*/
     let out=[];

    
    out[0]=['_id','lv','yr','n','dl','ds','dt','sl','ss','sc','log','tag','total','grade'];

    for(let row of data.assessments.records) {

        /** @type {string[]}*/
        let line=[
            row._id,
            row.lv,
            row.yr,
            row.n,
            row.dl,
            row.ds,
            row.dt,
            row.sl.replace(/,/g,' '),
            row.ss,
            row.sc,
            (row.log+',').replace(/,/g,''),
            (JSON.stringify(row.tag)+',').replace(/,/g,'|'),
            (JSON.stringify(row.total)+',').replace(/,/g,'|'),
            (JSON.stringify(row.grade)+',').replace(/,/g,'|'),
        
        
        
        ];
   




    out.push(line);
}

    console.log(out);
    file.csvDownload(out,"ASSESSMENTS.csv");
};

onMount(async () => {
       
        console.log(`$admin/Assessments mounted`);
        await update();
      
        
});
    

</script>

<hr/>

{#if data.create.confirm}
<Modal bind:open={data.create.confirm}>
    <div class="row">
        <div class="col">
            <h4>Generate Assessments/Results documents?</h4>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <p><span class="tag">{data.create.lv} {data.create.yr}</span></p>
            <p><span class="tag">n</span> {data.create.n} <span class="tag">dl</span> {data.create.dl}</p>
            <p><span class="tag">Grades Only</span> {data.create.tag.grade?'TRUE':'FALSE'}</p>
            <p><span class="tag">Pupil Grade Entry</span> {data.create.tag.pupiledit?'TRUE':'FALSE'}</p>
            <p>&nbsp;</p>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <button disabled={data.create.active} class="button error" on:click={create}>Generate</button>
        </div>
        <div class="col">
            <button class="button outline" on:click={()=>data.create.confirm=false}>Cancel</button>
        </div>
    </div>
</Modal>

{/if}


{#if data.assessments.confirm}
<Modal bind:open={data.assessments.confirm}>
    <div class="row">
        <div class="col">
            <h4>Remove Assessments</h4>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <p><span class="tag bg-error text-white">This can't be undone!</span></p>
           
           
            <p>&nbsp;</p>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <fieldset>
                <legend>Type 'DELETE' to confirm</legend>
                <input type=text bind:value={data.assessments.txt} class={data.assessments.txt==='DELETE' ? 'success' : 'error'}/>

            </fieldset>
           
           
            <p>&nbsp;</p>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <button disabled={data.assessments.txt!=='DELETE'} class="button error" on:click={removeAssessments}>Delete</button>
        </div>
        <div class="col">
            <button class="button outline" on:click={()=>data.assessments.confirm=false}>Cancel</button>
        </div>
    </div>
</Modal>

{/if}

<div class="row">
    <div class="col">
        <div class="tabs">
            {#each data.tabs as tab,tabIndex}
            <a href={'#'} on:click={()=>data.tab=tab} on:keydown={()=>data.tab=tab} class={data.tab===tab ?'active':''}>{tab}</a>
            {/each}
        </div>
    </div>
</div>


{#if data.tab==='Manage'}

<div class="row">
    <div class="col is-vertical-align">
        <h4>Manage Whole Year Group Assessments</h4>
    </div>
</div>


<div class="row">
    <div class="col is-vertical-align">
      
        <fieldset id="cohort" class="is-full-width">
            <legend>Cohort</legend>
            <p class="grouped">
            <select  id="cohort" bind:value={$cohorts.assessments.years.index} on:change={update}>
                <optgroup label="Form Level ExamYear">
                        {#each $cohorts.assessments.years.list as item,index}
                            <option value={index}>F{item.fm} {item.lv} {item.yr}</option>
                        {/each}
                </optgroup>
              </select>
            </p>
            </fieldset>
        
        
    </div>
    <div class="col is-vertical-align">
      
        <fieldset id="assessments" class="is-full-width">
            <legend>Cohort</legend>
            {#if data.assessments.list[0]}
            <p class="grouped">
            <select  id="assessments" bind:value={data.assessments.index} on:change={updateResults}>
                <optgroup label="Form Level ExamYear">
                        {#each data.assessments.list as item,index}
                            <option value={index}>{item.n} {item.dl} ({item.lv} {item.yr}) </option>
                        {/each}
                </optgroup>
              </select>
            </p>
            {:else}
            <span class="tag">No assessments found</span>
            {/if}
            </fieldset>
            
   
    </div>
    <div class="col is-vertical-align">
        <button class="button error" on:click={()=>data.assessments.confirm=true}>Delete</button>
    </div>
</div>


<div class="row">
    <div class="col is-vertical-align">
        {#if data.assessments.list[0]}
       {#each Object.keys(data.assessments.tag) as col,colIndex}
            {col}<input type=checkbox bind:checked={data.assessments.tag[col]}/>&nbsp;&nbsp;
       {/each}
       {:else}
       &nbsp;
       {/if}
    </div>
    <div class="col is-vertical-align">
        <button class="button dark" on:click={updateTag}>Update</button>
    </div>
</div>
<hr/>

<div class="row">
    <div class="col">
        <button on:click={exportResults} class="button outline fixed-width">Results&nbsp;
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
        <button on:click={exportAssessments} class="button outline fixed-width">Assessments&nbsp;
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
        
    </div>
</div>

<table class="striped small">
    <thead>
        <tr>
            <th>Assessment</th>
            <th>Subject</th>
            <th>Pupil</th>
            <th>Results</th>
        </tr>
    </thead>
    <tbody>
        {#each data.assessments.results as row,rowIndex}
        {#if rowIndex<10}
            <tr>
                <td>{row.n} {row.dl}</td>
                <td>{row.ss} {row.sc} {row.g}</td>
                <td>{row.pn} {row.sn}</td>
                <td>[{row.t.toString()}] {row.pc}% {row.gd}</td>
                
            </tr>
        {/if}
        {/each}
    </tbody>
</table>


{/if}


{#if data.tab==='Create'}
  
    <div class="row">
        <div class="col is-vertical-align">
            <h4>Create Whole Year Group Assessments</h4>
        </div>
    </div>
    <div class="row">
        <div class="col is-vertical-align">
            <span class="tag text-white bg-error">Ensure unique combination of date and name (for the cohort)</span>
        </div>
    </div>

    <div class="row">
        <div class="col is-vertical-align">
          
            <fieldset id="cohort" class="is-full-width">
                <legend>Cohort</legend>
                <p class="grouped">
                <select  id="cohort" bind:value={$cohorts.assessments.years.index}>
                    <optgroup label="Form Level ExamYear">
                            {#each $cohorts.assessments.years.list as item,index}
                                <option value={index}>F{item.fm} {item.lv} {item.yr}</option>
                            {/each}
                    </optgroup>
                  </select>
                </p>
                </fieldset>
            
            
        </div>
        <div class="col is-vertical-align">
        </div>
        <div class="col is-vertical-align">
        </div>
    </div>


    <div class="row">
        <div class="col is-vertical-align">
            <fieldset>    
                <legend>Assessment Name (max {data.create.max})</legend>
                    <input type=text bind:value={data.create.n} class={data.create.n!=='' ? 'success' : 'error'} on:input={validate}/>
            </fieldset>
        </div>
        <div class="col is-vertical-align">
            <fieldset>
                <legend>Assessment Date</legend>
                <input type=date bind:value={data.create.dl} class={data.create.dl!=='' && data.create.dl!=='0000-00-00' ? 'success' : 'error'}/>
            </fieldset>
        </div>
        <div class="col is-vertical-align">
        </div>
    </div>

    <div class="row">
        <div class="col">
            <input type=checkbox bind:checked={data.create.tag.grade} /> Grade Only?
            <input disabled={!data.create.tag.grade} type=checkbox bind:checked={data.create.tag.pupiledit}/> Pupil Grade Entry?
        </div>
        <div class="col">
         
        </div>
        <div class="col is-vertical-align">
        </div>
    </div>
   

    <div class="row">
        <div class="col">
            <button disabled={data.create.dl==='0000-00-00' || data.create.n===''} class="button dark" on:click={openConfirm}>Create</button>
        </div>
    </div>


{/if}








<style>

.small {
    font-size:1.2rem;
}
</style>