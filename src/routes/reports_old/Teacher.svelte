<script>

    import { onMount } from 'svelte';
    import {groups,teachers,config} from '$lib/store';
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
        reports:[],
        next:0,
        cols:[]
    };

    $:{
      

        if(data.reports[data.next]) {
            if(data.reports[data.next].txt!==null) {
                    document.getElementById(`c|${String(data.next)}`)?.focus();
            } 
        }

        if(data.reports[data.next-1]) {
            let x=data.reports[data.next-1];
            console.log(x.sn,x.data._id);
            let f=status.reports.find((/** @type {{ _id: any; }} */ el)=>el._id===x.data._id);
            if(f) {
                f.txt=x.data.txt;
                f.ec=x.data.ec;
                f.ep=x.data.ep;
                f.log=x.data.log;
                
                
            }
        }
        
      

       
      
    }

    let update=async()=>{
       console.log('updating...');
       data.user=data.teachers[data.tIndex].tid;
       data.groups=[];
       for(let item of status.reports.filter((/** @type {{ author: { tid: any; type: string; }; type: string; }} */ el)=>el.author.tid===data.user && el.type==='A' && el.author.type==='teacher')) {
            if(!data.groups.find((/** @type {{ fm: any; g: any; }} */ el)=>el.fm===item.fm && el.g===item.g))
                data.groups.push({g:item.g,fm:item.fm,sl:item.sl,sc:item.sc,ss:item.ss});
       }
       data.index=0;
       await updateReports();
       console.log(data.groups);
    

    };

    let updateReports=async()=>{
        let g=data.groups[data.index];

        data.reports=[];
      
        let gp=$groups.find(el=>el.ss===g.ss && el.sc===g.sc && el.g===g.g);

        if(gp) {

            /* get assessment cols */
            console.log(gp.g,gp.lv,gp.yr,gp.ss,gp.sc);
            let response = await fetch('/edge/read', {
                method: 'POST',
                body: JSON.stringify({collection:'results',filter:{lv:gp.lv,yr:gp.yr,ss:gp.ss,sc:gp.sc},projection:{}}),
                headers: {'content-type': 'application/json'}
            });
            let res= await response.json();
            console.log(res);

            data.cols=[];
            for(let item of res) {
                if(!data.cols.find((/** @type {{ n: any; dl: any; }} */ el)=>el.n===item.n && el.dl===item.dl)) {
                    data.cols.push({
                            n:item.n,
                            ds:item.dl?.length===10 ? item.dl[5]+item.dl[6]+"/" +item.dl[2]+item.dl[3]: '00/00',
                            dt:new Date(item.dl).getTime(),
                            dl:item.dl
                        });
                }
            }
            data.cols=data.cols.sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>a.dt-b.dt);
            console.log(data.cols);

            /* build report data */
            for(let pupil of gp.pupil) {
                let f=status.reports.find((/** @type {{ author: { type: string; tid: any; }; pupil: { pid: number; }; g: any; ss: string; sc: string; }} */ el)=>el.author.type==='teacher' && el.author.tid===data.user && el.pupil.pid===pupil.pid && el.g===g.g && el.ss===gp.ss && el.sc===gp.sc);
                
                let h=status.reports.find((/** @type {{ author: { type: string; }; pupil: { pid: number; }; fm: number; ss: string; sc: string; }} */ el)=>el.author.type==='hod' && el.pupil.pid===pupil.pid && el.fm===gp.fm && el.ss===gp.ss && el.sc===gp.sc);
                

                let cols=[];
                for(let col of data.cols) {
                    let a=res.find((/** @type {{ pid: number; dl: any; n: any; }} */ el)=>el.pid===pupil.pid && el.dl===col.dl && el.n===col.n);
                    cols.push({gd:a?a.gd:'X',pc:a?a.pc:0,r:0,ds:col.ds,n:col.n});
                }

                let gds=$config.grade.filter((/** @type {{ sc: string; }} */ el)=>el.sc===gp.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
                let  s1=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===cols[0].gd);
                for(let col of cols) {
                    let s2=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===col.gd); 
                    col.r = s1>-1 && s2>-1 ? s1-s2 : 0; 
                }
                
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
                            _id:f?f._id:'',
                            sal:f?f.author.sal:'',
                            log:f?f.log:'',
                            cols:cols,
                            hod:h?h.txt:''
                    
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

      
        await update();
        //await updateReports(); // already handled by update


    });

</script>


<div class="row">
    <div class="col is-vertical-align">
        <h4>Teacher Comments </h4>
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
    <div class="col is-vertical-align">
        <fieldset>
            <legend>Select Group</legend>
        
        <select  id="Groups" bind:value={data.index} on:change={updateReports}>
            <optgroup label="Groups">
                    {#each data.groups as item,index}
                        <option value={index}>{item.g} {item.ss}</option>
                    {/each}
            </optgroup>
          </select>
        </fieldset>
 
 
    </div>
    <div class="col is-vertical-align">
        &nbsp;
    </div>

</div>



{#if data.reports[0]}


<table>
    <thead>
        <tr>
            <th></th>
            <th>


            </th>
          
        </tr>   

    </thead>
    <tbody>
        {#each data.reports as row,rowIndex}
            <tr>
                <td><div>{row.pn} {row.sn}</div><div><span class="small">{row.g}</span></div></td>
                <td>
                    {#if row.data.valid}
                  
                        <Edit bind:data={row.data} index={rowIndex}  bind:next={data.next} user={status.user}/>
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

.small {
    font-size:1.2rem;
}
</style>