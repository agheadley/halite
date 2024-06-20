<script>
import {cohorts,config,pupils} from '$lib/store';
import { onMount } from 'svelte';
import * as util from '$lib/util';

/** @type {any}*/
export let status;


let update=async()=>{
    let y=$cohorts.overview.years.list[$cohorts.overview.years.index];
    let h=$cohorts.overview.houses.list[$cohorts.overview.houses.index];
   
    /* adjust houses.index if necessary */
    if(!(y.lv===h.lv && y.yr===h.yr)) $cohorts.overview.houses.index=$cohorts.overview.houses.list.findIndex((/** @type {{ lv: any; yr: any; }} */ el)=>el.lv===y.lv && el.yr===y.yr);
    h=$cohorts.overview.houses.list[$cohorts.overview.houses.index];


    status.std.A=(y.lv==='US' || y.lv==='MS' || y.lv==='L1') ? $config.std[y.lv].A : '';
    status.std.B=(y.lv==='US' || y.lv==='MS' || y.lv==='L1') ? $config.std[y.lv].B : '';

    status.table=[];

    /* get cohort results */
    let response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'results',filter:{lv:y.lv,yr:y.yr},projection:{}}),
        headers: {'content-type': 'application/json'}
    });
    let results= await response.json();

    console.log(results);

    /* get cohort assessments */
    response = await fetch('/edge/read', {
        method: 'POST',
        body: JSON.stringify({collection:'assessments',filter:{lv:y.lv,yr:y.yr,"tag.archive":false,"tag.overview":true},projection:{}}),
        headers: {'content-type': 'application/json'}
    });

    let assessments= await response.json();
    console.log(assessments);

    /* get results data */  

    /** @type {{pid:number,gd:string,pc:number,scr:number,dt:number,n:string,dl:string,ds:string,sl:string,sc:string,ss:string,fb:string,tag:{exam:boolean,grade:boolean}}[]}*/
    let data=[];
    for(let result of results) {
        let f=assessments.find((/** @type {{ _id: any; }} */ el)=>el._id===result.aoid);
        if(f) {
            data.push({
                pid:result.pid,
                gd:result.gd,
                pc:result.pc,
                scr:result.scr,
                dt:f.dt,
                n:f.n,
                dl:f.dl,
                ds:f.ds,
                tag:{exam:f.tag.exam,grade:f.tag.grade},
                sc:f.sc,
                ss:f.ss,
                sl:f.sl,
                fb:result.fb
            });
        }
    };

    status.results=data;



    response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'overview',filter:{},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
    let res= await response.json();
    let overview=res.sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>a.index-b.index);

    
    /* grab columns / section */
    let sections=overview.filter((/** @type {{ lv: any; yr: any; }} */ el)=>el.lv===y.lv && el.yr===y.yr);
    for(let section of sections) {
        section.ds=section.dl?.length===10 ? section.dl[5]+section.dl[6]+"/" +section.dl[2]+section.dl[3]: '00/00';
        section.dsFrom=section.from?.length===10 ? section.from[5]+section.from[6]+"/" +section.from[2]+section.from[3]: '00/00';
        section.dsTo=section.to?.length===10 ? section.to[5]+section.to[6]+"/" +section.to[2]+section.to[3]: '00/00';
    }

    //console.log(sections);

    /* cycle through each pupil */

    for(let pupil of $pupils.filter(el=>el.lv===y.lv && el.yr===y.yr)) {

        /** @type {{gd:string,pc:number|null,scr:number,r:number,u:number,d:number,title:string,date:string,sc:string,results:any[]}[]}*/
        let cols=[];

        for(let section of sections) {
            let from=new Date(section.from).getTime();
            let to=new Date(section.to).getTime();

            /* find all the results matching the overview column for each pupil */
            let f = section.exam ?
                data.filter(el=>el.pid===pupil.pid && el.n===section.n && el.dl===section.dl && el.tag.exam===true && el.gd!=='X') :
                data.filter(el=>el.pid===pupil.pid &&el.dt>=from && el.dt<=to && el.tag.exam===false && el.gd!=='X');




            /* does the section need and 2D export - e.g. IntEx */
            section.export=false;
            if(section.exam && f[0]) section.export = f[0].tag.grade===false ? true : false; 
            section.title=section.exam ? section.n : 'ASSESSMENTS';
            section.date=section.exam ? section.ds : `${section.dsFrom}-${section.dsTo}`; 



            /* find mean grade,pc and scr and residuals */

            let t=section.exam ? section.n : 'ASSESSMENTS';
            let d=section.exam ? section.ds : `${section.dsFrom}-${section.dsTo}`; 

            /** @type {{gd:string,pc:number|null,scr:number,r:number,u:number,d:number,title:string,date:string,sc:string,results:any[]}} */
            let col={gd:'X',pc:0,scr:0,r:0,u:0,d:0,title:t,date:d,sc:'A',results:f};

            if(f) {

                // find correct course for closest grade
                let sc=f.map(el=>el.sc);
                let course='A';
                if(y.lv==='US' && sc.includes('A')) course='A';
                if(y.lv==='US' && sc.includes('I')) course='I';
                if(y.lv==='US' && sc.includes('I') && !sc.includes('I') && !sc.includes('A')) course='B';
                if(y.lv==='MS') course='G';
                
                col.sc=course;

                let scrs=f.map(el=>el.scr);
                let scr=scrs?.length>0?scrs.reduce((/** @type {any} */ a,/** @type {any} */ v)=>a+v)/scrs.length:0;

                

                let gd=scrs?.length>0 ? util.getClosestGrade(scr,course,$config.grade):'X';
                let pcs=f.map(el=>el.pc);
                let pc=pcs?.length>0 && !f[0].tag.grade?pcs.reduce((/** @type {any} */ a,/** @type {any} */ v)=>a+v)/pcs.length:null;
                


                //if(section.n==='TIG') console.log(pupil.pid,f,scrs,gd);

                col.pc=pc;
                col.scr=scr;
                col.gd=gd;




            }
            cols.push(col);

            


            //console.log(pupil.sn,pupil.pn,from,to,section.n,section.dt,f.length);
        }


        /* add sections to status.cols for table header display */
        status.cols=sections;

         /* add grade residuals from first col of set averages */
        let gds=$config.grade.filter((/** @type {{ sc: string; }} */ el)=>el.sc===cols[0].sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
        let  s1=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===cols[0].gd);
        for(let col of cols) {
            let s2=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===col.gd); 
            col.r = s1>-1 && s2>-1 ? s1-s2 : 0; 
        }

        /* find grades up and down (u & d) cf first assessment */
        for(let col of cols) {
            for(let result of col.results) {
                let f=cols[0].results.find(el=>el.sc===result.sc && el.ss===result.ss);
                //if(f) console.log(`match ${pupil.pid} ${col.title} ${f.ss} ${f.sc}`);
                if(f) {
                    let gds=$config.grade.filter((/** @type {{ sc: string; }} */ el)=>el.sc===f.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
                    let  s1=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===f.gd);
                    let  s2=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===result.gd); 
                    let r= s1>-1 && s2>-1 ? s1-s2 : 0;
                    if(r<0) col.d+=r;
                    if(r>0) col.u+=r;
        
                }
            }
            col.d=Math.abs(col.d);
        }
       
        status.table.push({
            show:true,
            select:true,
            pupilShow:false,
            id:pupil.id,
            fm:pupil.fm,
            sn:pupil.sn,
            pn:pupil.pn,
            pid:pupil.pid,
            hse:pupil.hse,
            tg:pupil.tg,
            gnd:pupil.gnd,
            overall:{A:pupil.overall.A,B:pupil.overall.B},
            cols:cols
        });


        
    }


   

  
    console.log(status.table);

    updateDisplay();
   
   


   
};

let updateDisplay=()=>{
    status.pid=[];
    for(let row of status.table) {
        if($cohorts.overview.houses.all || $cohorts.overview.houses.list[$cohorts.overview.houses.index].hse===row.hse) {
            row.show=true;
            row.select=true;
        } else {
            row.show=false;
            row.select=false;
        }
    }
    console.log(status.pid);

    status.select=true;

};



onMount(async () => {
    console.log('overview/SelectCohort.svelte mounted');
    //console.log($pupils);
    await update();
});

</script>







 <div class="col is-vertical-align">
   
     <fieldset id="cohort" class="is-full-width">
         <legend>Cohort</legend>
         <p class="grouped">
         <select  id="cohort" bind:value={$cohorts.overview.years.index} on:change={update}>
             <optgroup label="Form Level ExamYear">
                     {#each $cohorts.overview.years.list as item,index}
                         <option value={index}>F{item.fm} {item.lv} {item.yr}</option>
                     {/each}
             </optgroup>
           </select>
         </p>
         </fieldset>
     
     
 </div>

 <div class="col is-vertical-align">
    <fieldset id="cohort" class="is-full-width">
          
        <legend>House</legend>
        <p class="grouped">
        <select disabled='{$cohorts.overview.houses.all}' id="house" bind:value={$cohorts.overview.houses.index} on:change={updateDisplay}>
            <optgroup label="House">
                    {#each $cohorts.overview.houses.list as item,index}
                    {#if item.yr===$cohorts.overview.years.list[$cohorts.overview.years.index].yr && item.lv===$cohorts.overview.years.list[$cohorts.overview.years.index].lv}
                        <option value={index}>{item.hse}</option>
                    {/if}
                    {/each}
            </optgroup>
          </select>
          <label for='all'>All?</label>
          <input id='add' type=checkbox bind:checked={$cohorts.overview.houses.all} on:change={updateDisplay}/>
         </p>
      
    </fieldset>
</div>