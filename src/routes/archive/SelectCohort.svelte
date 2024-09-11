<script>
import { onMount } from 'svelte';
import {cohorts,assessments,config} from '$lib/store';
export let status;

let updateSubjects=async()=>{

    let y=$cohorts.archive.years.list[$cohorts.archive.years.index];
    
    let s=$cohorts.archive.subjects.list[$cohorts.archive.subjects.index];
       
       
    /* adjust subjects.index if necessary */
    if(!(y.lv===s.lv && y.yr===s.yr)) $cohorts.archive.subjects.index=$cohorts.archive.subjects.list.findIndex((/** @type {{ lv: any; yr: any; }} */ el)=>el.lv===y.lv && el.yr===y.yr);
    s=$cohorts.archive.subjects.list[$cohorts.archive.subjects.index];

    await updateAssessments();
};


let updateAssessments=async()=>{
    let s=$cohorts.archive.subjects.list[$cohorts.archive.subjects.index];
    let y=$cohorts.archive.years.list[$cohorts.archive.years.index];

    console.log(status.grades);
    status.std.A=(y.lv==='US' || y.lv==='MS' || y.lv==='LS') ? $config.std[y.lv].A : '';
    status.std.B=(y.lv==='US' || y.lv==='MS' || y.lv==='LS') ? $config.std[y.lv].B : '';


    let as=$assessments.filter(el=>el.tag.archive===true && el.yr===y.yr && el.lv===y.lv && el.sc===s.sc && el.ss===s.ss).sort((a,b)=>a.dt-b.dt);
    //console.log(as);

    status.cols=as.map(el=>({n:el.n,ds:el.ds,dl:el.dl,grade:el.grade,total:el.total}));
    status.cols.push({n:"FINAL EXAM",ds:'',dl:'',grade:[],total:[]});

    //console.log(status.cols);

    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'results',filter:{lv:y.lv,yr:y.yr,sc:s.sc,ss:s.ss},projection:{}}),
        headers: {'content-type': 'application/json'}
    });

    let results= await response.json();
    //console.log(results);

    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'intake',filter:{lv:y.lv,yr:y.yr},projection:{}}),
        headers: {'content-type': 'application/json'}
    });

    let intake= await response.json();

    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'exams',filter:{lv:s.lv,yr:s.yr,sc:s.sc,ss:s.ss},projection:{}}),
        headers: {'content-type': 'application/json'}
    });

    let exams= await response.json();

    /**
	 * @type {{ pid: any; sn: any; pn: any; g: any; }[]}
	 */
    let ps=[];
    for(let item of results) {
        if(!ps.find(el=>el.pid===item.pid)) ps.push({pid:item.pid,sn:item.sn,pn:item.pn,g:item.g});
    }
    
    ps=ps.sort((a,b)=>a.g.localeCompare(b.g) || a.sn.localeCompare(b.sn) ||  a.pn.localeCompare(b.pn));

    //console.log(ps);

    status.table=[];
    for(let p of ps) {
            let i={overall:{A:0,B:0},pre:{A:0,B:0}};

            let x=intake.find((/** @type {{ pid: any; }} */ el)=>el.pid===p.pid);
            console.log(x);
            if(x) {
                let b=x.base.find((/** @type {{ type: string; }} */ el)=>el.type==='overall');
                if(b) {
                    i.overall.A=b.A;
                    i.overall.B=b.B;
                }
                let pre=x.pre.find((/** @type {{ sc: any; ss: any; }} */ el)=>el.sc===s.sc && el.ss===s.ss);
                if(pre) {
                    i.pre.A=pre.A;
                    i.pre.B=pre.B;
                }
            }

            let cols=[];
            for(let a of as) {

                let f=results.find((/** @type {{ aoid: string; pid: any; }} */ el)=>el.aoid===a._id && el.pid===p.pid);
                
                let gd=f?f.gd :'X';
                let t=f?`[${f.t.toString()}]`:'[0]';
                cols.push({n:a.n,ds:a.ds,gd:gd,t:t})
            };

            let e=exams.find((/** @type {{ pid: any; }} */ el)=>el.pid===p.pid);
            cols.push({n:'FINAL EXAM',ds:'',gd:e?e.gd:'',t:'[0]'});


            let row={pn:p.pn,sn:p.sn,pid:p.pid,g:p.g,i:i,cols:cols};
            status.table.push(row);

    }


    console.log(status.table);


    // let parent page react!
    status.select=true;
    


};


onMount(async () => {
    await updateSubjects();
});


</script>



<div class="col is-vertical-align">
          
    <fieldset id="cohort" class="is-full-width">
        <legend>Cohort</legend>
        <p class="grouped">
        <select  id="cohort" bind:value={$cohorts.archive.years.index} on:change={updateSubjects}>
            <optgroup label="Form Level ExamYear">
                    {#each $cohorts.archive.years.list as item,index}
                        <option value={index}> {item.lv} {item.yr}</option>
                    {/each}
            </optgroup>
          </select>
        </p>
        </fieldset>
    
    
</div>
<div class="col is-vertical-align">
    <fieldset id="subject" class="is-full-width">
      
        <legend>Subject</legend>
        <p class="grouped">
        <select id="subject" bind:value={$cohorts.archive.subjects.index} on:change={updateAssessments}>
            <optgroup label="Subject (Course)">
                    {#each $cohorts.archive.subjects.list as item,index}
                        {#if item.yr===$cohorts.archive.years.list[$cohorts.archive.years.index].yr && item.lv===$cohorts.archive.years.list[$cohorts.archive.years.index].lv}
                        <option value={index}>{item.sl} ({item.sc})</option>
                        {/if}
                    {/each}
            </optgroup>
          </select>
        </p>
      
    </fieldset>
   
</div>