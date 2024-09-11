<script>
import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import {assessments,location,cohorts,config} from '$lib/store';
import * as file from '$lib/file';
import SelectCohort from './SelectCohort.svelte';
import IntakeBar from '$lib/_IntakeBar.svelte';
import AssessmentTitle from '$lib/_AssessmentTitle.svelte';
import Cell from '$lib/_Cell.svelte';


 /** @type {any}*/    
 let status={
        table:[],
        std:{A:'',B:''},
        cols:[],
        grades:[],
        select:false,
        user:'',
        view:'grade', /* grade/percentage */
        download:false,
        rag:false
    };

    $:{
        if(status.select) {
            console.log('changed cohort...');

           
            let s=$cohorts.archive.subjects.list[$cohorts.archive.subjects.index];
            console.log(s.sc);
            status.grades=$config.grade.filter((/** @type {{ sc: any; }} */ el)=>el.sc===s.sc)
                .map((/** @type {{ gd: any; pre: any; }} */ el)=>({gd:el.gd,pre:el.pre}));
            console.log(status.grades);
            status.table=status.table;
            status.select=false;
         
        }
    }

let update=async()=>{

};


let getData=async()=>{
   
};

/**
 * 
 * @param {number} index
 */
let exportResults=(index)=>{
    
    let l=$cohorts.archive.subjects.list[$cohorts.archive.subjects.index];

    let out=[];
    out[0]=['pid','g','pn','sn',`BASE ${status.std.A}`,`BASE ${status.std.B}`,`PRED ${status.std.A}`,`PRED ${status.std.B}`,'scrs','gd',`${l.lv} ${l.yr} ${l.ss} (${l.sc}) ${status.cols[index].n} ${status.cols[index].ds}`];

    for(let row of status.table) out.push([row.pid,row.g,row.pn,row.sn,row.i.overall.A,row.i.overall.B,row.i.pre.A,row.i.pre.B,row.cols[index].t.toString(),row.cols[index].gd]);

    
    out.push(['section','total','weight']);
    for(let row of status.cols[index].total) out.push([row.n,row.t,row.w]);
    out.push(['grade','pc']);
    for(let row of status.cols[index].grade) out.push([row.gd,row.pc]);
    
    console.log(out);
    
    file.csvDownload(out,"ARCHIVE.csv");
    



        
};

onMount(async () => {
        $location='/assessments';
        console.log(`archive mounted`);
     
       
});
    

</script>
<div class="row">
    <div class="col is-vertical-align">
        <h4>Archive</h4>
    </div>
    <SelectCohort bind:status={status}/>
    <div class="col is-vertical-align">
        <a href={'/assessments'} class="button outline">Back</a>
    </div>
</div>


<div class="responsive">
    <table>
        <thead>
            <tr>
                <td class="small"></td>
                <td class="small"></td>
                <td class="small bold">BASELINE</td>
                <td class="small"></td>
                <td class="small bold">PREDICTION</td>
                <td class="small"></td>
                {#each status.cols as col,colIndex}
                    <td> <AssessmentTitle title={col.n} subtitle={col.ds}/></td>
                {/each}
            </tr>
            <tr>
                <th></th>
                <th></th>
                <td><span class="tag">{status.std.A}</span></td>
                <td><span class="tag">{status.std.B}</span></td>
                <td><span class="tag">{status.std.A}</span></td>
                <td><span class="tag">{status.std.B}</span></td>
                {#each status.cols as col,colIndex}
                    <td>
                        <a href={'#'} on:click={()=>exportResults(colIndex)} on:keydown={()=>exportResults(colIndex)} class="button clear icon-only"> 
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                        </a>
                    </td>
                {/each}
            </tr>
            
        </thead>
        <tbody>
            {#each status.table as pupil,pupilIndex}

                <tr>
                    <td class="pupil-name">{pupil.pn} {pupil.sn}</td>
                    <td>{pupil.g}</td>
                    <td><IntakeBar r={pupil.i.overall.A} std={status.std.A}/></td>
                    <td><IntakeBar r={pupil.i.overall.B} std={status.std.B}/></td>
                    <td class="small bold">{pupil.i.pre.A}</td>
                    <td class="small bold">{pupil.i.pre.B}</td>
                    {#each pupil.cols as col,colIndex}
                        <td> <Cell color={false} residual={0}>{col.gd}</Cell></td>
                    {/each}
                </tr>



            {/each}

        </tbody>
    </table>
</div>




<style>

.small {
    font-size:1.2rem;
}

.bold {
    font-weight:600;
}

.responsive {
        overflow-x:auto;
    }

    td {
        padding:0.2rem;
    }

    th {
        border-bottom: 1px solid gray;
        padding:0.2rem;
    }

   
    .pupil-name {
        min-width:15rem;
        max-width:15rem;
        overflow:hidden;
        white-space:nowrap;
    }
</style>