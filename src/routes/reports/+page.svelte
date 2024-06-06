<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import { goto } from '$app/navigation';
	import HoD from './HoD.svelte';
    import Teacher from './Teacher.svelte';

    /** @type {any}*/
    export let data;

    /** @type {any}*/
    let status={
        user:'',
        admin:false,
        tab:'teacher',
        cycle:{},
        reports:[],
        subjects:[]
        
    };

    
    
    
    onMount(async () => {
        $location='/reports';
        console.log(`${$location} mounted`);
        console.log('pupils',$pupils);
        console.log('groups',$groups);
        console.log('cohorts',$cohorts);

        status.reports=data.reports;

        status.user=data.user.name;
        console.log(data.user);
        status.admin=data.user.tag.admin;

        status.cycle=data.cycle;

        status.subjects=[];
        for(let item of status.reports.filter((/** @type {{ type: string; author: { type: string; }; }} */ el)=>el.type==='A' && el.author.type==='hod')) {
            if(!status.subjects.find((/** @type {{ ss: any; sc: any; fm: any; }} */ el)=>el.ss===item.ss && el.sc===item.sc && el.fm===item.fm)) 
                status.subjects.push({sl:item.sl,ss:item.ss,sc:item.sc,fm:item.fm,tid:item.author.tid});
        }
        status.subjects=status.subjects.sort((/** @type {{ fm: number; sc: string; sl: string; }} */ a,/** @type {{ fm: number; sc: any; sl: any; }} */ b)=>b.fm-a.fm || a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl));
        
        console.log(status.subjects);
    });
    

  
    
    </script>
    
    <svelte:head>
        <title>Reports</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
    <div class="row">
        <div class="col is-vertical-align">
           <button class="button dark" on:click={()=>status.tab='teacher'}>Teachers</button>
           <button class="button dark" on:click={()=>status.tab='hod'}>HoDs</button>
           <button class="button dark">Tutors</button>
           <button class="button dark">HMs</button>
           <button class="button dark">Enrichment</button>
           
        </div>
    </div>
    
    <hr/>
    <div class="row">
        <div class="col">&nbsp;</div>
    </div>

    {#if status.tab==='hod'}<HoD bind:status={status}/> {/if}
    {#if status.tab==='teacher'}<Teacher bind:status={status}/> {/if}

    <style>
    </style>
    