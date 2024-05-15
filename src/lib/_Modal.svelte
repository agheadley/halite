<script>


    import {fade} from 'svelte/transition';
    
    export let open = false;

   
</script>


{#if open}
<div class="parent" transition:fade={{ duration: 200 }}>
    <div role="cell" tabindex=0 class="background" on:keydown={()=>open=false} on:click={()=>open=false}/>
    <div class="modal">
        <slot></slot>
    </div>
</div>
{/if}

<style>
.parent{
    position:fixed;
    top:0px;
    left:0px;
    width:100vw;
    height:100vh;
    z-index:10000;
}

.background{
    position:fixed;
    top:0px;
    left: 0px;
    width:100vw;
    height:100vh;
    background-color:#333;
    opacity: 0.2;
}

.modal{
    padding:2rem;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    min-width:20rem;
    /*max-width:50rem;*/
    min-height:20rem;
    background-color: white;
    border-radius:0.3rem;
    border:1px solid white;
}
</style>
