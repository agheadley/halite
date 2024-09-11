<script>
import { goto } from '$app/navigation';
import { onMount } from 'svelte';
import {assessments,location} from '$lib/store';
import * as file from '$lib/file';
import SelectCohort from './SelectCohort.svelte';

 /** @type {any}*/    
 let status={
        table:[],
        std:{A:'',B:''},
        cols:[],
        select:false,
        user:'',
        view:'grade', /* grade/percentage */
        download:false,
        rag:false
    };

    $:{
        if(status.select) {
            console.log('changed cohort...');
            status.select=false;
            status.table=status.table;
        }
    }

let update=async()=>{

};


let getData=async()=>{
   
};

let exportResults=()=>{
    /*
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
    */



        
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
            
        </thead>
        <tbody>
            {#each status.table as pupil,pupilIndex}

                <tr>
                    <td>{pupil.pid}</td>
                    <td class="pupil-name">{pupil.pn} {pupil.sn}</td>
                    {#each pupil.cols as col,colIndex}
                        <td>{col.gd}</td>
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