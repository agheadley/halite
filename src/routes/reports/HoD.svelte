<script>
    import {groups} from '$lib/store';
    import {alert} from '$lib/store';
    import { onMount } from 'svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
        index:0,
        subjects:[],
        reports:[],
        txt:''
    };

    let save=async()=>{

        let count=0;
        let total=0;

        for(let row of data.reports) {
            if(row.data.valid) {
                row.data.txt=data.txt;
                total+=1;

            }
        }
        data.reports=data.reports;

        for(let row of data.reports) {
            if(row.data.valid) {
                let response = await fetch('/edge/update', {
                    method: 'POST',
                    body: JSON.stringify({
                        collection:'reports',
                        filter:{"_id": { "$oid": row.data._id } },
                        update:{txt:row.data.txt}
                    }),
                    headers: {'content-type': 'application/json'}
                });

                let res= await response.json();
            
                if(res.matchedCount===1) {
                    count+=1;
                    $alert.msg=`Updated ${count}/${total} reports`;
                } else {
                    $alert.type='error';
                    $alert.msg=`Error updating`;
                }
                
            }
        }

        if(count<total) {
            $alert.type='error';
            $alert.msg=`Only ${count}/${total} reports correctly updated.`;
        }
    };

    let update=()=>{

        data.reports=[];
        let s=data.subjects[data.index];
        console.log(s);
        let gps=$groups.filter(el=>el.ss===s.ss && el.sc===s.sc && el.fm===s.fm);
        console.log(gps);

        for(let gp of gps) {
            for(let pupil of gp.pupil) {
                let f=status.reports.find((/** @type {{ author: { type: string; }; pupil: { pid: number; }; fm: number; ss: string; sc: string; }} */ el)=>el.author.type==='hod' && el.pupil.pid===pupil.pid && el.fm===gp.fm && el.ss===gp.ss && el.sc===gp.sc);
                data.reports.push(
                    {
                        pid:pupil.pid,
                        sn:pupil.sn,
                        pn:pupil.pn,
                        g:gp.g,
                        data:{
                            valid:f?true:false,
                            min:f?f.min:0,
                            max:f?f.max:0,
                            txt:f?f.txt:'',
                            _id:f?f._id:''
                        }
                    }
                );
            }
        }

        data.reports=data.reports.sort((/** @type {{ g: string; sn: string; pn: string; }} */ a,/** @type {{ g: any; sn: any; pn: any; }} */ b)=>a.g.localeCompare(b.g) || a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn) );
        console.log(data.reports);
    };

    onMount(async () => {
        console.log(status);

      
        if(!status.admin)
                data.subjects=status.subjects.filter((/** @type {{ tid: any; }} */ el)=>el.tid===status.user);
        else 
                data.subjects=status.subjects;

        console.log(data.subjects);

        update();
    });

</script>


<div class="row">
    <div class="col is-vertical-align">
        <h4>HoD Comments</h4>
    </div>
    <div class="col is-vertical-align">
        <select  id="subject" bind:value={data.index} on:change={update}>
            <optgroup label="Subject">
                    {#each data.subjects as item,index}
                        <option value={index}>{item.fm} ({item.sc}) {item.sl} </option>
                    {/each}
            </optgroup>
          </select>
    </div>
    <div class="col is-vertical-align">
        &nbsp;
    </div>

</div>


{#if data.reports[0]}


<table>
    <thead>
        <tr>
            <th>Pupil</th>
            <th>Group</th>
            <th>HoD Comment</th>
            <th></th>
        </tr>   
        <tr>
            <th></th>
            <th></th>
            <th><textarea class={data.txt.length<status.cycle.length.A.min || data.txt.length>status.cycle.length.A.max ? 'comment red' : 'comment green' } bind:value={data.txt}/></th>
            <th><span class="tag small">{data.txt.length} / {status.cycle.length.A.max}</span></th>
        </tr>
        <tr>
            <th></th>
            <th></th>
         
            <th><button disabled={data.txt.length<status.cycle.length.A.min || data.txt.length>status.cycle.length.A.max} class="button error" on:click={save}>Save to All</button></th>
                <th></th>
            </tr>     
    </thead>
   <tbody>
    {#each data.reports as row,rowIndex}
        <tr>
            <td>{row.pn} {row.sn}</td>
            <td>{row.g}</td>
            <td>
                {#if row.data.valid}
                    <textarea class="comment" disabled bind:value={row.data.txt}></textarea>
                {:else}
                    <span class="tag">Error - Report missing</span>
                {/if}
            </td>
            <td><span class="tag small">{row.data.txt.length} / {data.reports[0].data.max}</span></td>
        </tr>
    {/each}
   </tbody>

</table>
{/if}


<style>

.comment {
        width:60rem;
        height:10rem;
    }

.red {
    background:rgba(178,34,34,0.15);
   
}

.green {
    background:rgba(34,139,34,0.15);
}

.small {
    font-size:1rem;
}
</style>