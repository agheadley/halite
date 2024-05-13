<script>

    import {cohorts,groups,location,alert,config} from '$lib/store';
    import { onMount } from 'svelte';
    import * as util from '$lib/util';
	import { goto } from '$app/navigation';
    
    export let data;
    
    let test=()=>{
        console.log('alert ...');
        $alert.type='error';
        $alert.msg="Hello";
    

    };

    let status={
        name:'',
        max:15,
        dl:'0000-00-00'
    };
    

   
    /* at same lv,yr must not have same sc/ss on same date - that is the - so easy to display */
    let validate=()=>{
        status.name=status.name.replace(/ /g,"_");
        status.name=status.name.replace(/[^A-Za-z0-9._-]/g,""); //replace(/\W+/g, "");

        status.name = status.name.length && status.name.length>status.max ? status.name.slice(0,(status.max-1)) : status.name;
    
    };



    let save=async()=>{
        let ds=status.dl?.length===10 ? status.dl[5]+status.dl[6]+"/" +status.dl[2]+status.dl[3]: '00/00';
        let dt=new Date(status.dl).getTime();
    
        let s=$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index];
        let y=$cohorts.assessments.years.list[$cohorts.assessments.years.index];
    
        let grades=[];
        let gds=$config.grade.filter(el=>el.sc===s.sc).sort((a,b)=>b.scr-a.scr)
        for(let item of gds) grades.push({gd:item.gd,pc:item.pc,scr:item.scr,active:true});
    
       

        let document={
            lv:y.lv,
            yr:y.yr,
            n:status.name,
            dl:status.dl,
            ds:ds,
            dt:dt,
            sc:s.sc,
            sl:s.sl,
            ss:s.ss,
            tag:{open:true,grade:false,overview:false,pupil:false,parent:false,exam:false,archive:false},
            total:[{t:100,w:100,n:'P1'}],
            grade:grades,
            log:`${data.user.name}|${util.getDate()}`

        };

        console.log(document);
        let response = await fetch('/edge/insert', {
		    method: 'POST',
		    body: JSON.stringify({collection:'assessments',documents:[document]}),
		    headers: {'content-type': 'application/json'}
	    });

        let res= await response.json();
        console.log(res);

        if(res.length && res.length===1) {
                let aoid=res[0];
                $alert.msg=`'assessments' document created`;

                let pupils=[];
                let gps=$groups.filter(el=>el.yr===y.yr && el.lv===y.lv && el.sc===s.sc && el.ss===s.ss);
                for(let gp of gps) {
                    for(let p of gp.pupil) {
                        pupils.push({
                            aoid:aoid,
                            lv:y.lv,
                            yr:y.yr,
                            n:status.name,
                            dl:status.dl,
                            sc:s.sc,
                            ss:s.ss,
                            pid:p.pid,
                            sn:p.sn,
                            pn:p.pn,
                            g:gp.g,
                            t:[0],
                            gd:'U',
                            pc:0,
                            scr:0,
                            fb:'',
                            log:`${data.user.name}|${util.getDate()}`
                        });
                    }
                }

                response = await fetch('/edge/insert', {
                    method: 'POST',
                    body: JSON.stringify({collection:'results',documents:pupils}),
                    headers: {'content-type': 'application/json'}
	            });

                res= await response.json();
                console.log(res);
                if(res.length && res.length>0) {
                    $alert.msg=`${res.length} pupil 'results' documents created`;
                    goto('/assessments');
                } else {
                    $alert.type='error';
                    $alert.msg=`Error creating 'results' documents`;
                }



                
        } else {
            $alert.type='error';
            $alert.msg=`Error creating 'assessments' document`;
        }


        

    };

    onMount(async () => {
        $location='/assessments/create';
        console.log(`${$location} mounted`);
        let y=$cohorts.assessments.years.list[$cohorts.assessments.years.index];
        status.dl=util.getDate();

       
    });
    
    
    </script>
    
    <div class="row">
        <div class="col">
            <h4>
                Create Assessment 
            </h4>
        </div>
        <div class="col">
            <a href={'/assessments'} class="button outline">Close</a>
        </div>
    </div>
    
    <div class="row">
        <div class="col">
            <h4>
                <span class="tag">
                    {$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sl}
                    ({$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc})
                    {$cohorts.assessments.years.list[$cohorts.assessments.years.index].lv}
                    {$cohorts.assessments.years.list[$cohorts.assessments.years.index].yr}
                    
                </span>
            </h4>
        </div>
    </div>
    <div class="row">
        <div class="col">
            &nbsp;
        </div>
    </div>
    
    
    <div class="row">
        <div class="col is-vertical-align">
            <fieldset>    
                <legend>Assessment Name (max {status.max})</legend>
                    <input type=text bind:value={status.name} class={status.name!=='' ? 'success' : 'error'} on:input={validate}/>
            </fieldset>
        </div>
        <div class="col is-vertical-align">
            <fieldset>
                <legend>Assessment Date</legend>
                <input type=date bind:value={status.dl} class={status.dl!=='' && status.dl!=='0000-00-00' ? 'success' : 'error'}/>
            </fieldset>
        </div>
    </div>

    <div class="row">
        <div class="col">
            &nbsp;
        </div>
    </div>
    
    <div class="row">
        <div class="col">
            <button 
                disabled={status.name==='' || status.dl==='' || status.dl==='0000-00-00'}
                class="button dark" 
                on:click={save}>
                Save
                </button>
    
        </div>
    </div>
    
    
    <style>

    </style>
    