<script>
    import { onMount } from 'svelte';
    import {groups,teachers,config,alert,pupils} from '$lib/store';
    import Edit from './Edit.svelte';
    import * as util from '$lib/util';
    import Modal from '$lib/_Modal.svelte';
    import Detail from './Detail.svelte';

    /** @type {any}*/
    let data={
        user:'',
        tIndex:0,
        reports:[],
        next:0,
        detail:{open:false,txt:'',_id:'',type:'tutor',pid:0,sn:'',pn:'',user:'',cycleID:''}
    };

    /** @type {any}*/
    export let status;

    /** @type {string}*/
    export let type;


    $:{
        /* moves focus to next record - switch off for a while! */
        /*
        if(data.reports[data.next]) {
            if(data.reports[data.next].txt!==null) {
                    document.getElementById(`c|${String(data.next)}`)?.focus();
            } 
        }
        */

        if(data.detail.txt!=='') {
            console.log('Detail.svelte has saved a report - update in Pastoral.svelte...',data.detail.txt);
            let f=data.reports.find((/** @type {{ _id: any; }} */ el)=>el._id===data.detail._id);
            if(f) f.txt=data.detail.txt;
            data.detail.txt='';
            data.detail._id='';
        }

    }

     /**
     * 
     * @param {number} index
     */
     let openDetail=(index)=>{
        data.detail.pid=data.reports[index].pupil.pid;
        data.detail.pn=data.reports[index].pupil.pn;
        data.detail.sn=data.reports[index].pupil.sn;
        data.detail.open=true;
        data.detail.user=status.user;
        data.detail.cycleID=status.cycle._id;
        
    };

    let update=async()=>{
        data.user=status.teachers[data.tIndex].tid;
       
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',filter:{type:'P',coid:status.cycle._id,"author.tid":data.user,"author.type":type},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        data.reports=res[0] ? res.sort((/** @type {{ fm: number; pupil: { sn: string; pn: string; }; }} */ a,/** @type {{ fm: number; pupil: { sn: any; pn: any; }; }} */ b)=>b.fm-a.fm || a.pupil.sn.localeCompare(b.pupil.sn) || a.pupil.pn.localeCompare(b.pupil.pn) ) :[];

        // add subject name to display.
        for(let item of data.reports) item.sl=type.toUpperCase();

       


        console.log(data);
    };
    
    onMount(async () => {
       console.log('reports/TPastoral.svelte mounted',type);
       data.user=status.user;
       data.detail.type=type;
       data.tIndex=status.teachers.findIndex((/** @type {{ tid: any; }} */ el)=>el.tid===data.user);

       

      
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

            <Detail type={type} bind:detail={data.detail}/>

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
        <h4>{#if type==='tutor'}Tutor Comments{/if}{#if type==='hm'}Housemaster Comments{/if}</h4>
    </div>
    <div class="col is-vertical-align">
        <fieldset>
            <legend>Select Teacher</legend>
           
        <select  id="Tutor" bind:value={data.tIndex} on:change={update}>
            <optgroup label="Tutor">
                    {#each status.teachers as item,index}
                        <option value={index}>{item.pn} {item.sn} ({item.tid})</option>
                    {/each}
            </optgroup>
          </select>
          </fieldset>
 
    </div>
</div>


{#if data.reports[0]}


<table>
    <thead>

    </thead>
    <tbody>
        {#each data.reports as row,rowIndex}
            <tr>
            <td>
                <div>
                    <a href={'#'} on:click={()=>openDetail(rowIndex)}>{row.pupil.pn} {row.pupil.sn} (F{row.fm})</a>
                </div>
                <div><span class="bold">{row.sl}</span></div>
                <div><span class="small">{row.author.tid}</span></div>
            </td>
            <td>
               <Edit index={rowIndex} bind:next={data.next} bind:data={row} user={status.user}/>
            </td>
        </tr>  
        {/each}
    </tbody>
</table>


{/if}

<style>

  .small {
    font-size:1.2rem;
  }  

  .bold {
    font-weight:600;
  }
</style>