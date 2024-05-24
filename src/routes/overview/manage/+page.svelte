<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
  
    import Modal from '$lib/_Modal.svelte';
    import AssessmentTitle from '$lib/_AssessmentTitle.svelte';
    import Cell from '$lib/_Cell.svelte';
    import Pupil from '$lib/_Pupil.svelte';

    /** @type {any}*/
    export let data;

    /** @type {any}*/
    let status={
       user:'',
       yr:0,
       lv:''
    };



  


  

    
    onMount(async () => {
        $location='/overview/manage';
        console.log(`${$location} mounted`);
        status.user=data.user;
        status.yr=$cohorts.overview.years.list[$cohorts.overview.years.index].yr;
        status.lv=$cohorts.overview.years.list[$cohorts.overview.years.index].lv;
    });
    
    
    </script>
    
    <svelte:head>
        <title>Overview Manage</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>

    <div class="row">
        <div class="col">
            <h4>Visible Assessments {status.lv} {status.yr}</h4>
        </div>
        <div class="col">
            <a href='/overview' class="button outline">Close</a>
        </div>
    </div>
   
    <!--
    <Modal bind:open={status.download}>
        <Export bind:status={status}/>
    </Modal>
    -->

    <p>{JSON.stringify(status.user)}</p>
    
    <style>

.responsive {
        overflow-x:auto;
    }

    td {
        padding:0.2rem;
    }



    </style>
    