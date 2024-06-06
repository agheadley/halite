<script>

    import { onMount } from 'svelte';
    import {groups,teachers} from '$lib/store';
    import Edit from './Edit.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
        user:'',
        index:0,
        groups:[],
        tIndex:0,
        teachers:[],
        reports:[]
    };

    let update=()=>{
       console.log('updating...');
       data.user=data.teachers[data.tIndex].tid;
       data.groups=[];
       for(let item of status.reports.filter((/** @type {{ author: { tid: any; type: string; }; type: string; }} */ el)=>el.author.tid===data.user && el.type==='A' && el.author.type==='teacher')) {
            if(!data.groups.find((/** @type {{ fm: any; g: any; }} */ el)=>el.fm===item.fm && el.g===item.g))
                data.groups.push({g:item.g,fm:item.fm,sl:item.sl,sc:item.sc,ss:item.ss});
       }
       data.index=0;
       updateReports();
       console.log(data.groups);
    

    };

    let updateReports=()=>{
        let g=data.groups[data.index];

        data.reports=[];
      
        let gp=$groups.find(el=>el.ss===g.ss && el.sc===g.sc && el.g===g.g);

        if(gp) {

        
            for(let pupil of gp.pupil) {
                let f=status.reports.find((/** @type {{ author: { type: string; }; pupil: { pid: number; }; g: any; ss: string; sc: string; }} */ el)=>el.author.type==='teacher' && el.pupil.pid===pupil.pid && el.g===g.g && el.ss===gp.ss && el.sc===gp.sc);
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
                            ec:f?f.ec:'',
                            ep:f?f.ep:'',
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
       console.log('reports/Teacher.svelte mounted');

       data.user=status.user;

       data.teachers=$teachers.sort((a,b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn));
       // testing
       data.teachers=$teachers.sort((a,b)=>a.tid.localeCompare(b.tid));

       data.tIndex=data.teachers.findIndex((/** @type {{ tid: any; }} */ el)=>el.tid===data.user);

      
        update();
        updateReports();


    });

</script>


<div class="row">
    <div class="col is-vertical-align">
        <h4>Teacher Comments </h4>
    </div>
    <div class="col is-vertical-align">

        <select  id="Teacher" bind:value={data.tIndex} on:change={update}>
            <optgroup label="Teacher">
                    {#each data.teachers as item,index}
                        <option value={index}>({item.tid}) {item.pn}</option>
                    {/each}
            </optgroup>
          </select>
 
    </div>
    <div class="col is-vertical-align">

        <select  id="Groups" bind:value={data.index} on:change={updateReports}>
            <optgroup label="Groups">
                    {#each data.groups as item,index}
                        <option value={index}>{item.g} {item.ss}</option>
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
            <th></th>
          
        </tr>   

    </thead>
    <tbody>
        {#each data.reports as row,rowIndex}
            <tr>
                <td>{row.pn} {row.sn}</td>
                <td>
                    {#if row.data.valid}
                        <Edit bind:data={row.data}/>
                    {:else}
                        <span class="tag">Error - Report missing</span>
                    {/if}
                </td>
            </tr>
        {/each}
    </tbody>
</table>

{/if}



<style>

</style>