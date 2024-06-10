<script>
    import { onMount } from 'svelte';
    import {pupils,teachers,config} from '$lib/store';
    import Manage from './Manage.svelte';
	import Eedit from './Eedit.svelte';
    import Modal from '$lib/_Modal.svelte';
    import Detail from './Detail.svelte';


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
        tIndex:0,
        sal:'',
        reports:[],
        pupils:[],
        years:[],
        gnds:[{gnd:'M',filter:true},{gnd:'F',filter:true}],
        lists:[],
        next:0,
        detail:{open:false,txt:'',type:'enrichment',pid:0,sn:'',pn:''}
    };

     /**
     * 
     * @param {number} index
     */
     let openDetail=(index)=>{
        data.detail.pid=data.reports[index].pupil.pid;
        data.detail.pn=data.reports[index].pupil.pn;
        data.detail.sn=data.reports[index].pupil.sn;
        data.detail.open=true;
        
    };

    let update=async()=>{
        data.user=status.teachers[data.tIndex].tid;
        data.sal=status.teachers[data.tIndex].sal;

        

        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'lists',filter:{type:'enrichment',user:data.user},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        data.lists=res[0] ? res.sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>b.dt-a.dt) :[];
    


        response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',filter:{type:'E',coid:status.cycle._id,"author.tid":data.user},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        res= await response.json();
        data.reports=res[0] ? res.sort((/** @type {{ sl: string; pupil: { sn: string; pn: string; }; }} */ a,/** @type {{ sl: any; pupil: { sn: any; pn: any; }; }} */ b)=>a.sl.localeCompare(b.sl) || a.pupil.sn.localeCompare(b.pupil.sn) || a.pupil.pn.localeCompare(b.pupil.pn) ) :[];

        console.log(data);
        
    };

    onMount(async () => {
        console.log('reports/Enrichment.svelte mounted');

        data.user=status.user;

       
        data.tIndex=status.teachers.findIndex((/** @type {{ tid: any; }} */ el)=>el.tid===data.user);

        
        data.pupils=$pupils.map(el=>({id:el.id,pid:el.pid,sn:el.sn,pn:el.pn,hse:el.hse,tg:el.tg,fm:el.fm,gnd:el.gnd,select:false,show:true}));
        data.pupils=data.pupils.sort((/** @type {{ sn: string; pn: string; }} */ a,/** @type {{ sn: any; pn: any; }} */ b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn));   


        data.years=$config.year.map((/** @type {{ fm: any; }} */ el)=>({fm:el.fm,filter:true}));
        
        
        await update();
       

    });


</script>


{#if data.detail.open}
    <Modal bind:open={data.detail.open}>
        <div class="row">
            <div class="col">
                <h4>{data.detail.pn}  {data.detail.sn}</h4>
            </div>
            <div class="col is-right">
                <button class="button outline" on:click={()=>data.detail.open=false}>Close</button>
            </div>
        </div>
        <div class="row">
            <Detail pid={data.detail.pid} type={'teacher'}/>
        </div>
        <div class="row">
            <div class="col">
               
            </div>
            <div class="col is-right">
                <button class="button outline" on:click={()=>data.detail.open=false}>Close</button>
            </div>
        </div>
    
        
       
    </Modal>
{/if}

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
                        {#each status.teachers as item,index}
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
                <div>
                    <a href={'#'} on:click={()=>openDetail(rowIndex)}>{row.pupil.pn} {row.pupil.sn}</a>
                </div>
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