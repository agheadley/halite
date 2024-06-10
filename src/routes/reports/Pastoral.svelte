<script>
    import { onMount } from 'svelte';
    import {groups,teachers,config,alert} from '$lib/store';
    import Edit from './Edit.svelte';
    import * as util from '$lib/util';
    import Modal from '$lib/_Modal.svelte';
    import Detail from './Detail.svelte';

    /** @type {any}*/
    let data={
        user:'',
        tIndex:0,
        reports:[],
        next:0,
        detail:{open:false,txt:'',type:'tutor',pid:0,sn:'',pn:''}
    };

    /** @type {any}*/
    export let status;

    /** @type {string}*/
    export let type;

     /**
     * 
     * @param {number} index
     */
     let openDetail=(index)=>{
        data.detail.pid=data.reports[index].pupil.pid;
        data.detail.pn=data.reports[index].pupil.pn;
        data.detail.sn=data.reports[index].pupil.sn;
        data.detail.open=true;
        
    };

    let update=async()=>{

    };
    
    onMount(async () => {
       console.log('reports/TPastoral.svelte mounted',type);

       data.user=status.user;

       data.detail.type=type;
       
       data.tIndex=status.teachers.findIndex((/** @type {{ tid: any; }} */ el)=>el.tid===data.user);

      
        await update();

    });

</script>




{#if data.detail.open}
    <Modal bind:open={data.detail.open}>
        <div class="row">
            <div class="col">
                <h4>{data.detail.pn}  {data.detail.sn}</h4>
            </div>
            <div class="col is-right">
                <button class="button outline" on:click={()=>data.detail.open=false}>Close</button>
            </div>
        </div>
        <div class="row">
            <Detail pid={data.detail.pid} type={'teacher'}/>
        </div>
        <div class="row">
            <div class="col">
               
            </div>
            <div class="col is-right">
                <button class="button outline" on:click={()=>data.detail.open=false}>Close</button>
            </div>
        </div>
    
        
       
    </Modal>
{/if}

{type}


<style>
    
</style>