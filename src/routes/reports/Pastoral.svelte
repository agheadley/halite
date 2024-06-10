<script>
    import { onMount } from 'svelte';
    import {groups,teachers,config,alert} from '$lib/store';
    import Edit from './Edit.svelte';
    import * as util from '$lib/util';

    /** @type {any}*/
    let data={
        user:'',
        tIndex:0,
        reports:[],
        next:0
    };

    /** @type {any}*/
    export let status;

    /** @type {string}*/
    export let type;


    let update=async()=>{

    };
    
    onMount(async () => {
       console.log('reports/Teacher.svelte mounted');

       data.user=status.user;

       
       data.tIndex=status.teachers.findIndex((/** @type {{ tid: any; }} */ el)=>el.tid===data.user);

      
        await update();

    });

</script>


{type}


<style>
    
</style>