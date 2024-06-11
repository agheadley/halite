<script>
import {cohorts,groups,config,alert} from '$lib/store';
import * as util from '$lib/util';
import Modal from '$lib/_Modal.svelte';

/** @type {any}*/
export let status;


/** @type {any}*/
let data= {
    tabs:['Manage','Create'],
    tab:'Manage',
    create:{active:false,confirm:false,max:15,n:'',dl:'0000-00-00',ds:'',dt:0,lv:'',yr:0,tag:{open:true,grade:false,overview:false,pupil:false,parent:false,pupiledit:false,exam:true,archive:false}}
};





$:{
    if(!data.create.tag.grade) data.create.tag.pupiledit=false;
}


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



<div class="row">
    <div class="col">
        <div class="tabs">
            {#each data.tabs as tab,tabIndex}
            <a href={'#'} on:click={()=>data.tab=tab} on:keydown={()=>data.tab=tab} class={data.tab===tab ?'active':''}>{tab}</a>
            {/each}
        </div>
    </div>
</div>

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


{#if data.tab==='Manage'}
    Edit exam visiblity, open etc
    Download, delete
{/if}





<style>

</style>