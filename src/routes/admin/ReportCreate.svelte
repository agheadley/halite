<script>
    import { onMount } from 'svelte';
    import * as file from '$lib/file';
    import * as util from '$lib/util';
    import {alert,config,groups,teachers,pupils} from '$lib/store';
    import Modal from '$lib/_Modal.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
       cycle:{},
       reports:[],
       groups:[],
       pupils:[]
    };
    
    
    let buildHoDReports=()=>{
        for(let row of data.cycle.detail) {
            if(row.hod) {
            let gps=data.groups.filter((/** @type {{ fm: any; }} */ el)=>el.fm===row.fm);

            let person={tid:'',sn:'',pn:'',sal:''};
            /* testing */
            //person={tid:'AGH',sn:'H',pn:'A',sal:'Dr H'};

            console.log(`hod build F${row.fm},found ${gps.length} groups`);
            for(let gp of gps) {
                let f=$config.subject.find((/** @type {{ sc: any; ss: any; }} */ el)=>el.sc===gp.sc && el.ss===gp.ss);
                if(f) {
                    let t=$teachers.find(el=>el.tid===f.tid);
                    if(t) {
                        person.tid=t.tid;
                        person.sn=t.sn;
                        person.pn=t.pn;
                        person.sal=t.sal;
                    }
                }
            
            
            
                for(let pupil of gp.pupil) {

                    let report={
                        coid:data.cycle._id,
                        ci:data.cycle.index,
                        ay:data.cycle.ay,
                        y:data.cycle.y,
                        tt:data.cycle.tt,
                        ts:data.cycle.ts,
                        min:data.cycle.length.A.min,
                        max:data.cycle.length.A.max,
                        type:'A',
                        author:{type:'hod',tid:person.tid,sal:person.sal},
                        ec:'',
                        ep:'',
                        txt:'',
                        fm:row.fm,
                        g:gp.g,
                        sc:gp.sc,
                        ss:gp.ss,
                        sl:gp.sl,
                        lv:gp.lv,
                        yr:gp.yr,
                        log:`${status.user}|${util.getDate()}`,
                        pupil:{pid:pupil.pid,sn:pupil.sn,pn:pupil.pn,hse:pupil.hse,tg:pupil.tg,gnd:pupil.gnd,id:pupil.id}
                    };

                    data.reports.push(report);


                } // end of pupil for
            } // end of group for
            }
        } // end of detail for

        console.log(data.reports);
    };

    let buildTeacherReports=()=>{
        for(let row of data.cycle.detail) {
            if(row.teacher || row.ec || row.ep) {
            let gps=data.groups.filter((/** @type {{ fm: any; }} */ el)=>el.fm===row.fm);

            console.log(`teacher build F${row.fm},found ${gps.length} groups`);
            for(let gp of gps) {
               
                for(let pupil of gp.pupil) {
                    for(let teacher of gp.teacher) {
                        let report={
                        coid:data.cycle._id,
                        ci:data.cycle.index,
                        ay:data.cycle.ay,
                        y:data.cycle.y,
                        tt:data.cycle.tt,
                        ts:data.cycle.ts,
                        min:data.cycle.length.A.min,
                        max:data.cycle.length.A.max,
                        type:'A',
                        author:{type:'teacher',tid:teacher.tid,sal:teacher.sal},
                        ec:row.ec ? $config.report.e.default : null,
                        ep:row.ep ? $config.report.e.default : null,
                        txt:row.teacher?'':null,
                        fm:row.fm,
                        g:gp.g,
                        sc:gp.sc,
                        ss:gp.ss,
                        sl:gp.sl,
                        lv:gp.lv,
                        yr:gp.yr,
                        log:`${status.user}|${util.getDate()}`,
                        pupil:{pid:pupil.pid,sn:pupil.sn,pn:pupil.pn,hse:pupil.hse,tg:pupil.tg,gnd:pupil.gnd,id:pupil.id}
                    };

                    data.reports.push(report);
                    } // end of teacher for
                    


                } // end of pupil for
            } // end of group for
            }
        } // end of detail for

        console.log(data.reports);
    };

    let buildHMReports=()=>{
        for(let row of data.cycle.detail) {
            if(row.hm) {
            let pupils=data.pupils.filter((/** @type {{ fm: any; }} */ el)=>el.fm===row.fm);

            console.log(`HM build F${row.fm},found ${pupils.length} pupils`);
            for(let pupil of pupils) {
               
                        
                    let f=$config.report.hm.find((/** @type {{ hse: any; }} */ el)=>el.hse===pupil.hse);
                    let hm=f? {tid:f.tid,sal:f.sal} :{tid:'',sal:''};
            
                    let report={
                        coid:data.cycle._id,
                        ci:data.cycle.index,
                        ay:data.cycle.ay,
                        y:data.cycle.y,
                        tt:data.cycle.tt,
                        ts:data.cycle.ts,
                        min:data.cycle.length.P.min,
                        max:data.cycle.length.P.max,
                        type:'P',
                        author:{type:'hm',tid:hm.tid,sal:hm.sal},
                        ec:'',
                        ep:'',
                        txt:'',
                        fm:row.fm,
                        g:'',
                        sc:'',
                        ss:'',
                        sl:'',
                        lv:pupil.lv,
                        yr:pupil.yr,
                        log:`${status.user}|${util.getDate()}`,
                        pupil:{pid:pupil.pid,sn:pupil.sn,pn:pupil.pn,hse:pupil.hse,tg:pupil.tg,gnd:pupil.gnd,id:pupil.id}
                    };

                    data.reports.push(report);
                
                    


              
            } // end of pupil for
            }
        } // end of detail for

        console.log(data.reports);
    };

    let buildTutorReports=()=>{
        for(let row of data.cycle.detail) {
            if(row.tutor) {
            let pupils=data.pupils.filter((/** @type {{ fm: any; }} */ el)=>el.fm===row.fm);

            console.log(`Tutor build F${row.fm},found ${pupils.length} pupils`);
            for(let pupil of pupils) {
               
                        
                    let f=$teachers.find((el)=>el.tid===pupil.tg);
                    let tut=f? {tid:f.tid,sal:f.sal} :{tid:'',sal:''};
                    // testing
                    tut={tid:'AGH',sal:'Dr H'}


                    let report={
                        coid:data.cycle._id,
                        ci:data.cycle.index,
                        ay:data.cycle.ay,
                        y:data.cycle.y,
                        tt:data.cycle.tt,
                        ts:data.cycle.ts,
                        min:data.cycle.length.P.min,
                        max:data.cycle.length.P.max,
                        type:'P',
                        author:{type:'tutor',tid:tut.tid,sal:tut.sal},
                        ec:'',
                        ep:'',
                        txt:'',
                        fm:row.fm,
                        g:'',
                        sc:'',
                        ss:'',
                        sl:'',
                        lv:pupil.lv,
                        yr:pupil.yr,
                        log:`${status.user}|${util.getDate()}`,
                        pupil:{pid:pupil.pid,sn:pupil.sn,pn:pupil.pn,hse:pupil.hse,tg:pupil.tg,gnd:pupil.gnd,id:pupil.id}
                       
                    };

                    data.reports.push(report);
                
                    


              
            } // end of pupil for
            }
        } // end of detail for

        console.log(data.reports);
    };



    let create=async()=>{
        data.reports=[];
        buildHoDReports();
        buildTeacherReports();
        buildHMReports();
        buildTutorReports();

        let response = await fetch('/edge/insert', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',documents:data.reports}),
            headers: {'content-type': 'application/json'}
        });
        let res= await response.json();

        if(res[0]) {
            $alert.msg=`${res.length} reports created`;
        } else {
            $alert.type='error';
            $alert.msg=`Error inserting reports`;
        }


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

         // copy groups with a filter
         data.pupils=$pupils.filter(el=>el.yr>0);

        /* add fm to groups */
      
       
        console.log($teachers);

        console.log($pupils);
       
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