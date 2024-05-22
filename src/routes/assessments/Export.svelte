<script>
import * as file from '$lib/file';
import {pupils} from '$lib/store';

/** @type {any}*/
export let status;

let exportResults=()=>{



    let out=[];
    out[0]=['pid','sn','pn','hse','gnd','g'];
    out[0].push(status.std.A);
    out[0].push(status.std.B);


    for(let col of status.table[0].cols) {
        out[0].push(`${col.n} ${col.ds}`);
        out[0].push(`${col.n} ${col.ds} (%)`);
    }

    for(let group of status.table) {
        let row=['[MEAN]','','','','',group.g,Math.round(100*group.overall.A)/100,Math.round(100*group.overall.B)/100];
        for(let col of group.cols) {
            row.push(`${col.gd}`);
            row.push(col.pc!==null ? `${Math.round(100*col.pc)/100}` : '');
        }
        out.push(row);

        for(let pupil of group.pupil) {
            let row=[pupil.pid,pupil.sn,pupil.pn,pupil.hse,pupil.gnd,pupil.g,Math.round(100*pupil.overall.A)/100,Math.round(100*pupil.overall.B)/100];
            for(let col of group.cols) {
                row.push(`${col.gd}`);
                row.push(col.pc!==null ? `${Math.round(100*col.pc)/100}` : '');
            }
            out.push(row);
        }

    }




        console.log(out);
        file.csvDownload(out,"RESULTS.csv");
};

let exportIntake=()=>{
    console.log($pupils);
    let out=[];
    out[0]=['pid','sn','pn','hse','gnd','g','type'];
    out[0].push(status.std.A);
    out[0].push(status.std.B);



    for(let group of status.table) {
        for(let pupil of group.pupil) {
            let row=[pupil.pid,pupil.sn,pupil.pn,pupil.hse,pupil.gnd,pupil.g];
            out.push(row);
        }

    }




        console.log(out);
        file.csvDownload(out,"INTAKE.csv");
};

</script>


<header>
         
<h4>Downloads</h4>

</header>

<p>
    <button on:click={exportResults} class="button outline">Results&nbsp;
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
    </button>
</p>

<p>
    <button on:click={exportIntake} class="button outline">Intake&nbsp;
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
    </button>
</p>

<p>&nbsp;</p>
<footer>
  
    <button class="button outline" on:click={()=>status.download=false}>Cancel</button>
</footer>

<style>

</style>