<script>
 import { onMount } from 'svelte';
/** @type {any}*/
export let status;


/** @type {any}*/
let feedback=[];

/** @type {any}*/
let table=[];

onMount(async () => {
    table=[];
    feedback=status.results.filter((/** @type {{ fb: string; }} */ el)=>el.fb!=='').sort((/** @type {{ ss: string; dt: number; }} */ a,/** @type {{ ss: any; dt: number; }} */ b)=>a.ss.localeCompare(b.ss) || b.dt-a.dt);    
    for(let row of status.table) {
        if(row.show) {
            // @ts-ignore
            let f=feedback.filter(el=>el.pid===row.pid);
            for(let item of f) {
                table.push({
                    pid:row.pid,
                    sn:row.sn,
                    pn:row.pn,
                    hse:row.hse,
                    tg:row.tg,
                    gnd:row.gnd,
                    n:item.n,
                    sc:item.sc,
                    ss:item.ss,
                    sl:item.sl,
                    ds:item.ds,
                    fb:item.fb

                });
            };
        }
    }    
});


</script>

<div class="row">
    <div class="col">
        <h4>Teacher Feedback</h4>
    </div>
    <div class="col">
        <button class="button outline" on:click={()=>status.fb=false}>Close</button>
    </div>
</div>

<div class="responsive">
<table>
    <thead>
        <tr>
            <th>Pupil</th>
            <th colspan=2>Assessment</th>
            <th>Subject</th>
            <th>Feedback</th>
        </tr>
    </thead>
    <tbody>
        {#each table as row,rowIndex}
        <tr>
            <td>{row.pn} {row.sn}</td>
            <td>{row.n}</td>
            <td>{row.ds}</td>
            <td>{row.sl} ({row.sc})</td>
            <td><textarea class="fb" disabled>{row.fb}</textarea></td>
        </tr>
        {/each}
    </tbody>
</table>
</div>

<style>

.responsive {
        overflow-x:auto;
    }

    td {
        padding:0.2rem;
    }

    .fb {
        width:40rem;
        height:10rem;
    }

</style>