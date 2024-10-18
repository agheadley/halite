<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts,assessments} from '$lib/store';
    import { goto } from '$app/navigation';
	import HoD from './HoD.svelte';
    import Pastoral from './Pastoral.svelte';
    import Teacher from './Teacher.svelte';
    import Enrichment from './Enrichment.svelte';
    import View from './View.svelte';

    /** @type {any}*/
    export let data;

    /** @type {any}*/
    let status={
        user:'',
        tab:'',
        cycle:{},
        subjects:[],
        teachers:[]
        
    };

    
    
    
    onMount(async () => {
        $location='/reports';
        console.log(`${$location} mounted`);
        console.log('pupils',$pupils);
        console.log('groups',$groups);
        console.log('cohorts',$cohorts);

        
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'assessments',filter:{},projection:{_id:1,sc:1,sl:1,ss:1,dt:1,dl:1,ds:1,n:1,tag:1,lv:1,yr:1,grade:1,total:1}}),
            headers: {'content-type': 'application/json'}
        });
        $assessments= await response.json();



        status.user=data.user.name;
        
        status.cycle=data.cycle;
        status.subjects=data.subjects;
        status.teachers=data.teachers;

        console.log(status);

        status.tab='teacher';
    });
    

  
    
    </script>
    
    <svelte:head>
        <title>Reports</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
    <div class="row">
        <div class="col is-vertical-align">
            <div class="tabs">
                <a class={status.tab==='teacher' ? 'active' :''} href={'#'} on:click={()=>status.tab='teacher'} on:keydown={()=>status.tab='teacher'}>Teacher</a>
                <a class={status.tab==='hod' ? 'active' :''} href={'#'} on:click={()=>status.tab='hod'} on:keydown={()=>status.tab='hod'}>HoD</a>
                <a class={status.tab==='tutor' ? 'active' :''} href={'#'} on:click={()=>status.tab='tutor'} on:keydown={()=>status.tab='tutor'}>Tutor</a>
                <a class={status.tab==='hm' ? 'active' :''} href={'#'} on:click={()=>status.tab='hm'} on:keydown={()=>status.tab='hm'}>HM</a>
                <a class={status.tab==='enrichment' ? 'active' :''} href={'#'} on:click={()=>status.tab='enrichment'} on:keydown={()=>status.tab='enrichment'}>Enrichment</a>
                <a class={status.tab==='view' ? 'active' :''} href={'#'} on:click={()=>status.tab='view'} on:keydown={()=>status.tab='view'}>View</a>
         
            </div>
        
           
        </div>
        <div class="col is-right">
          
            
                {#if status.cycle.tt && status.cycle.y}
                <h4>{status.cycle.tt} {status.cycle.ts} {status.cycle.y} </h4>
                {/if}
           
        </div>
    </div>
    
    <hr/>
    <div class="row">
        <div class="col">&nbsp;</div>
    </div>

    {#if status.cycle.active}
        {#if status.tab==='hod'}<HoD bind:status={status}/> {/if}
        {#if status.tab==='teacher'}<Teacher bind:status={status}/> {/if}
        {#if status.tab==='tutor'}<Pastoral bind:status={status} type={'tutor'}/> {/if}
        {#if status.tab==='hm'}<Pastoral bind:status={status} type={'hm'}/> {/if}
        {#if status.tab==='enrichment'}<Enrichment bind:status={status}/> {/if}
        
    {:else}
        <span class="tab">No active report cycle found.</span>
    {/if}
    {#if status.tab==='view'}<View bind:status={status}/> {/if}
    <style>
    

    
    </style>
    