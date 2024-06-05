<script>
    import { onMount } from 'svelte';
    import * as file from '$lib/file';
    import * as util from '$lib/util';
    import {alert,config,groups,teachers} from '$lib/store';
    import Modal from '$lib/_Modal.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
       cycle:{},
       reports:[],
       groups:[]
    };
    
    
    let buildHoDReports=()=>{
        for(let row of data.cycle.detail) {
            if(row.hod) {
                let gps=data.groups.filter((/** @type {{ fm: any; }} */ el)=>el.fm===row.fm);
                console.log(`hod build F${row.fm},found ${gps.length} groups`);
                let f=$config.subject.find()

            }
        }
    };


    let create=async()=>{
        data.reports=[];
        buildHoDReports();
    };
        
    onMount(async () => {
        console.log('/admin ReportCreate.svelte');
        console.log(status);

        data.cycle={};
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'cycles',filter:{active:true},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();
        data.cycle=res[0] ? res[0] : {};

        data.reports=[];

        if(data.cycle.active) {
            response = await fetch('/edge/read', {
                method: 'POST',
                body: JSON.stringify({collection:'reports',filter:{coid:data.cycle._id},projection:{}}),
                headers: {'content-type': 'application/json'}
            });
            res= await response.json();
            data.reports=res[0] ? res : [];
        }


        // copy groups with a filter
        data.groups=$groups.filter(el=>el.yr>0);

        /* add fm to groups */
        let d=new Date();
        let m=d.getMonth()+1;
        let currentYr=m>$config.rollover.month ? d.getFullYear()+1:d.getFullYear();

        for(let g of data.groups) {
         
            let f=$config.year.find((/** @type {{ lv: any; x: number; }} */ el)=>el.lv===g.lv && el.x===(g.yr-currentYr));
            g.fm = f ? f.fm : -1;
            //console.log(g.lv,g.yr,g.g,g.fm);
        }

        console.log($teachers);
    });
     
    
    </script>


    



  
    <div class="row">
        <div class="col is-vertical-align"><h4>Create Reports</h4></div> 
       
    </div>

 
    {#if data.cycle.active}
    <div class="row">
        <div class="col is-vertical-align">
            <span class="tag bold">{data.cycle.tt} {data.cycle.ts} {data.cycle.y} ({data.cycle.ay})</span>
        </div> 
    </div>
    <div class="row">
        <div class="col">
            <table>
                <thead>
                    <tr>
                        <th>Type</th>
                        <th>Min Length</th>
                        <th>Max Length</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>A</td>
                        <td>{data.cycle.length.A.min}</td>
                        <td>{data.cycle.length.A.max}</td>
                    </tr>
                    <tr>
                        <td>E</td>
                        <td>{data.cycle.length.E.min}</td>
                        <td>{data.cycle.length.E.max}</td>
                    </tr>
                    <tr>
                        <td>P</td>
                        <td>{data.cycle.length.P.min}</td>
                        <td>{data.cycle.length.P.max}</td>
                    </tr>
                </tbody>
                </table>

        </div>
        <div class="col">
            <table>
                <thead>
                    <tr>
                        <th>Form</th>
                        <th>HoD</th>
                        <th>Teacher</th>
                        <th>EffortClass</th>
                        <th>EffortPrep</th>
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
                            <td>{row.hod ? 'YES' : ''}</td>
                            <td>{row.teacher ? 'YES' : ''}</td>
                            <td>{row.ec ? 'YES' : ''}</td>
                            <td>{row.ep ? 'YES' : ''}</td>
                            <td>{row.enrichment ? 'YES' : ''}</td>
                            <td>{row.tutor ? 'YES' : ''}</td>
                            <td>{row.hm ? 'YES' : ''}</td>
                            <td>{row.hoy ? 'YES' : ''}</td>
                            <td>{row.slt ? 'YES' : ''}</td>

                           
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
    <div class="row">
        <div class="col">
            <p>Found {data.reports.length} reports</p>
            {#if data.reports.length && data.reports.length>1}
            <p><span class="tag">Please delete existing reports before trying to create.</span></p>
            {/if}
                <button disabled={data.reports.length>0} on:click={create} class="button error">Create</button>
           
        </div>
    </div>
    {:else}
    <div class="row">
        <div class="col is-vertical-align">
    <span class="tag">No active cycle to create reports</span>
    </div></div>
    {/if}

    <div class="row">
        <div class="col">
           &nbsp;
        </div>
    </div>

   
  
         

    
    <style>
    
    .bold {
        font-weight:600;
    }
  
    </style>