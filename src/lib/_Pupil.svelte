<script>
import { onMount } from 'svelte';

/** @type {{pid:number,sn:string,pn:string,gnd:string,hse:string,tg:string,lv:string,yr:number,context:string}}*/ 
export let status;

import {fade} from 'svelte/transition';

/* inner modal for boundaries/totals/feedback */
/** @type {boolean} */
export let detail = false;


onMount(async () => {
       
    /* get groups */
    /* get assessments by status.context */
    /* get results by status.pid */

    /* build table with n,ds,gd,pc, grade (assesment.grade),total (t,assessment totals) vs ss,sl,sc from groups */

       
});



</script>


{#if detail}
<div class="parent" transition:fade={{ duration: 200 }}>
    <div role="cell" tabindex=0 class="background" on:keydown={()=>detail=false} on:click={()=>detail=false}/>
    <div class="modal">
        <slot>
            XYZ
        </slot>
    </div>
</div>
{/if}


<div class="container">
<div class="row">
    <div class="col">
        <div class="responsive">
            <button on:click={()=>detail=true}></button>
            <p>The quick brown fox jumps over the lazy dog.The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog. The quick brown fox jumps over the lazy dog.</p>
            <p>{status.context}</p>
        </div>
      
    </div>
</div>
</div>


<style>

.responsive {
    overflow:auto;
}

.parent{
    position:fixed;
    top:0px;
    left:0px;
    width:100vw;
    height:100vh;
    z-index:100000;
}

.background{
    position:fixed;
    top:0px;
    left: 0px;
    width:100%;
    height:100%;
    background-color:#333;
    opacity: 0.0;
}

.modal{
    padding:2rem;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width:20rem;
    /*max-width:50rem;*/
    max-width:90vw;
    min-height:20rem;
    background-color: white;
    border-radius:0.3rem;
    border:1px solid #333;
}
</style>
