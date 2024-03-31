<script>

    import {cohorts,groups,location,alert} from '$lib/store';
    import { onMount } from 'svelte';
    import * as util from '$lib/util';
	import { goto } from '$app/navigation';
    
    
    let test=()=>{
        console.log('alert ...');
        $alert.type='error';
        $alert.msg="Hello";
    

    };

    let status={
        list:[],
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

    };

    onMount(async () => {
        $location='/assessments/create';
        console.log(`${$location} mounted`);
        let y=$cohorts.assessments.years.list[$cohorts.assessments.years.index];
       
        let response = await fetch('/edge/distinct', {
            method: 'POST',
            body: JSON.stringify({collection:'results',match:{lv:y.lv,yr:y.yr},aggregate:['ss','sc','dl']}),
            headers: {'content-type': 'application/json'}
         });
         status.list=await response.json();
         //console.log(status.list);

         status.dl=util.getDate();

       
    });
    
    
    </script>
    
    <div class="row">
        <div class="col">
            <h4>
                Create Assessment 
                <span class="tag">
                    {$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sl}
                    ({$cohorts.assessments.subjects.list[$cohorts.assessments.subjects.index].sc})
                    {$cohorts.assessments.years.list[$cohorts.assessments.years.index].lv}
                    {$cohorts.assessments.years.list[$cohorts.assessments.years.index].yr}
                    
                </span>
            </h4>
        </div>
        <div class="col">
            <a href={'/assessments'} class="button outline">Close</a>
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
    