<script>
    import { onMount } from 'svelte';
    import {pupils,teachers,config} from '$lib/store';
    import Manage from './Manage.svelte';
	import Eedit from './Eedit.svelte';


    /** @type {any}*/
    export let status;


    $:{
        if(data.reports[data.next]) {
            if(data.reports[data.next].txt!==null) {
                    document.getElementById(`c|${String(data.next)}`)?.focus();
            } 
        }

    }

    /** @type {any}*/
    let data={
        user:'',
        teachers:[],
        tIndex:0,
        sal:'',
        reports:[],
        pupils:[],
        years:[],
        gnds:[{gnd:'M',filter:true},{gnd:'F',filter:true}],
        lists:[],
        next:0
    };

    let update=async()=>{
        data.user=data.teachers[data.tIndex].tid;
        data.sal=data.teachers[data.tIndex].sal;

        data.reports=status.reports.filter((/** @type {{ type: string; author: { tid: any; }; }} */ el)=>el.type==='E' && el.author.tid===data.user);
        

        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'lists',filter:{type:'enrichment',user:data.user},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();

        console.log(res);
        data.lists=res.sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>b.dt-a.dt);
    
    };

    onMount(async () => {
        console.log('reports/Teacher.svelte mounted');

        data.user=status.user;

        data.teachers=$teachers.sort((a,b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn));
        // testing
        data.teachers=$teachers.sort((a,b)=>a.tid.localeCompare(b.tid));

        data.tIndex=data.teachers.findIndex((/** @type {{ tid: any; }} */ el)=>el.tid===data.user);

        
        data.pupils=$pupils.map(el=>({id:el.id,pid:el.pid,sn:el.sn,pn:el.pn,hse:el.hse,tg:el.tg,fm:el.fm,gnd:el.gnd,select:false,show:true}));
        data.pupils=data.pupils.sort((/** @type {{ sn: string; pn: string; }} */ a,/** @type {{ sn: any; pn: any; }} */ b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn));   


        data.years=$config.year.map((/** @type {{ fm: any; }} */ el)=>({fm:el.fm,filter:true}));
        
        
        await update();
        //await updateReports(); // already handled by update


    });


</script>


<div class="row">
    <div class="col is-vertical-align">
        {#if !data.create}
        <h4>Write Enrichment Reports</h4>
        {:else}
        <h4>Manage Enrichment Reports</h4>
        {/if}
    </div>
    <div class="col is-vertical-align">
        <fieldset>
            <legend>Select Teacher</legend>
            <select  id="Teacher" bind:value={data.tIndex} on:change={update}>
                <optgroup label="Teacher">
                        {#each data.teachers as item,index}
                            <option value={index}>({item.tid}) {item.pn} {item.sn}</option>
                        {/each}
                </optgroup>
              </select>
     
        </fieldset>
        
    </div>
    <div class="col is-vertical-align is-right">
        {#if !data.create}
        <button class="button dark" on:click={()=>data.create=true}>Manage</button>
        {:else}
        <button class="button outline" on:click={()=>data.create=false}>Close</button>
        
        {/if}

    </div>
    
</div>


{#if data.create}
    <Manage bind:data={data} bind:status={status}/>
{/if}



{#if !data.create}

{#if data.reports[0]}


<table>
    <thead>

    </thead>
    <tbody>
        {#each data.reports as row,rowIndex}
            <tr>
            <td>
                <div>{row.pupil.pn} {row.pupil.pn}</div>
                <div><span class="bold">{row.sl}</span></div>
                <div><span class="small">{row.author.tid}</span></div>
            </td>
            <td>
                <Eedit index={rowIndex} bind:next={data.next} bind:data={row} user={status.user}/>
            </td>
        </tr>  
        {/each}
    </tbody>
</table>


{/if}



{/if}

<style>

.bold {
    font-weight:600;
}

.small {
    font-size:1.2rem;
}

</style>