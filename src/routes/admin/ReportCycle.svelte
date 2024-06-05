<script>
    import { onMount } from 'svelte';
    import * as file from '$lib/file';
    import * as util from '$lib/util';
    import {alert,config} from '$lib/store';
    import Modal from '$lib/_Modal.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
        rows:[],
        edit:false,
        valid:true,
        cycle:{}
    };

    let update=async()=>{
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'cycles',filter:{},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        data.rows=res.sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>a.index-b.index);

    };
    
    let addRow=async()=>{

        let index=data.rows.length && data.rows.length>0 ? data.rows[data.rows.length-1].index+1 : 0;

        let detail=$config.year.map((/** @type {{ fm: any; }} */ el)=>({fm:el.fm,hod:true,teacher:false,ec:false,ep:false,enrichment:false,tutor:false,hm:false,hoy:false,slt:false}));

        let y=new Date().getFullYear();
        let m=$config.report.tt[0]==='Winter' ? '12' :    $config.report.tt[0]==='Spring' ? '04' : '06';
        let ay=util.getAcademicYear(`${y}-${m}-01`,$config.rollover.month);
        console.log(ay);



        let obj={
                index:index,
                active:false,
                tt:$config.report.tt[0],
                ts:$config.report.ts[0],
                y:y,
                ay:ay,
                length:{A:{min:180,max:600},E:{min:250,max:600},P:{min:250,max:600}},
                detail:detail
               
            };
        
        let response = await fetch('/edge/insert', {
            method: 'POST',
            body: JSON.stringify({collection:'cycles',documents:[obj]}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();

        if(res[0]) {
            $alert.msg='Row added';
        } else {
            $alert.type='error';
            $alert.msg=`Error adding row`;
        }

        await update();
            
        
    };

   

      /**
     * 
     * @param {number} index
     */
    let changeActive=(index)=>{
        console.log(data.rows[index].active);
        data.rows.forEach((/** @type {{ active: boolean; }} */ v,/** @type {number} */ i)=>{
            if(i!=index) v.active=false;
        });
        data.rows=data.rows;
    };

      /**
     * 
     * @param {number} index
     */
    let changeYearTerm=(index)=>{
        data.rows[index].year  =  data.rows[index].year > 0 ? parseInt( data.rows[index].year) : 0;

        let y=data.rows[index].year;
        let m=data.rows[index].term==='Winter' ? '12' :    data.rows[index].term==='Spring' ? '04' : '06';
        data.rows[index].ayear=util.getAcademicYear(`${y}-${m}-01`,$config.rollover.month);

    };


      /**
     * 
     * @param {number} index
     */
    let editCycle=(index)=>{
      console.log('editing',data.rows[index]);
        data.edit=true;
        data.cycle.index=data.rows[index].index;
        data.cycle.active=data.rows[index].active;
        data.cycle.ay=data.rows[index].ay;
        data.cycle.y=data.rows[index].y;
        data.cycle.tt=data.rows[index].tt;
        data.cycle.ts=data.rows[index].ts;
        data.cycle.length={
            A:{min:data.rows[index].length.A.min,max:data.rows[index].length.A.max},
            E:{min:data.rows[index].length.E.min,max:data.rows[index].length.E.max},
            P:{min:data.rows[index].length.P.min,max:data.rows[index].length.P.max}
        }
        //copy detail through filter!
        data.cycle.detail=data.rows[index].detail.filter((/** @type {{ fm: null; }} */ el)=>el.fm!==null);
               
        
        
        
    };

    let saveCycle=async()=>{
      
       
    };
        
    onMount(async () => {
        console.log('/admin ReportCycle.svelte');
        console.log(status);
        
        await update();
        
    });
    
    </script>

    <hr/>
    
    <Modal bind:open={data.edit}>
        <div class="row">
            <div class="col">
                <h4>Cycle {data.cycle.index} {data.cycle.ay} ({data.cycle.tt} {data.cycle.ts} {data.cycle.y})</h4>
            </div>
        </div>
      
        <div class="row">
            <div class="col">
            </div>
        </div>
       
        <div class="row">
            <div class="col">
        
                <table>
                    <thead>
                        <tr>
                            <th>Form</th>
                            <th>HoD</th>
                            <th>Teacher</th>
                            <th>Effort C</th>
                            <th>Effort P</th>
                            <th>Enrichment</th>
                            <th>Tutor</th>
                            <th>HM</th>
                            <th>HoS</th>
                            <th>SLT</th>
                        </tr>
                    </thead>
                 
                    <tbody>
                        {#each data.cycle.detail as row,rowIndex}
                            <tr>
                                <td>{row.fm}</td>
                                <td><input type=checkbox bind:checked={row.hod}></td>
                                <td><input type=checkbox bind:checked={row.teacher}></td>
                                <td><input type=checkbox bind:checked={row.ec}></td>
                                <td><input type=checkbox bind:checked={row.ep}></td>
                                <td><input type=checkbox bind:checked={row.enrichment}></td>
                                <td><input type=checkbox bind:checked={row.tutor}></td>
                                <td><input type=checkbox bind:checked={row.hm}></td>
                                <td><input type=checkbox bind:checked={row.hoy}></td>
                                <td><input type=checkbox bind:checked={row.slt}></td>
                            </tr>
                        {/each}
                    </tbody>
                </table>





            </div>
        </div>


        <div class="row">
            <div class="col">
               &nbsp;
            </div>
        </div>
        <div class="row">

            <div class="col">
                <button class="button error" disabled={!data.valid} on:click={saveCycle}>Save</button>
            </div>
            <div class="col">
                <button class="button outline" on:click={()=>data.edit=false}>Cancel</button>
            </div>
        </div>
    </Modal>
    




  
    <div class="row">
        <div class="col is-vertical-align"><h4>Edit Report Cycles</h4></div> 
       
    </div>

 
    <div class="row">
        <div class="col">
           &nbsp;
        </div>
    </div>

   
    <table class="striped">
        <thead>
            <tr>
                <th>Index</th>
                <th>Academic Year</th>
                <th>Year</th>
                <th>Term</th>
                <th>Subterm</th>
                <th>Active?</th>
            </tr>
        </thead>
        <tbody>
        {#each data.rows as row,rowIndex}
            <tr>
                <td>
                    {row.index}
                    <button class="button icon-only outline" on:click={()=>editCycle(rowIndex)}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-edit"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                    </button>
                </td>
                <td>{row.ay}</td>
                <td>{row.y}</td>
                <td>{row.tt}</td>
                <td>{row.ts}</td>
                <td><input type=checkbox bind:checked={row.active}  on:change={()=>changeActive(rowIndex)}></td>
            </tr>
        {/each}
    </tbody>
    </table>
    
    <div class="row">
        <div class="col">
            <button class="button dark icon-only" on:click={addRow}>         
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-plus"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
    </div>
        
    </div>
   

    
    <style>
    
    </style>