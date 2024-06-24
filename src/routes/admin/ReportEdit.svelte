<script>
    import { onMount } from 'svelte';
    import * as file from '$lib/file';
    import * as util from '$lib/util';
    import {alert,config,groups,teachers,pupils,cycles} from '$lib/store';
    import Modal from '$lib/_Modal.svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
       index:0,
       fm:0,
       types:{A:true,E:false,P:false}
    };
    
    
    
    let update=async()=>{

    };



        
    onMount(async () => {
        console.log('/admin ReportEdit.svelte');
        console.log(status);

      
    });
     
    
    </script>


    

<div class="row">
    <div class="col-6 is-vertical-align">
        <fieldset class="is-full-width">
            <legend>Cycle</legend>    
            <p class="grouped">       
            <select  id="Cycle" bind:value={data.index} on:change={update}>
            <optgroup label="Cycle">
                    {#each $cycles as item,index}
                        <option value={index}>{item.tt} {item.ts} {item.y}</option>
                    {/each}
            </optgroup>
            </select>
            {#if $cycles[data.index].active}<span class="tag text-error">ACTIVE</span>{/if}
            {#if $cycles[data.index].publish}<span class="tag text-error">PUBLISHED</span>{/if}
            </p>
        </fieldset>
      
    </div>
    <div class="col-3 is-vertical-align">
        <fieldset>
            <legend>Year group</legend>           
            <select  id="Year" bind:value={data.fm}>
            <optgroup label="Year">
                    {#each $config.year as item,index}
                        <option value={item.fm}>{item.fm}</option>
                    {/each}
            </optgroup>
            </select>
        </fieldset>
    </div>
    <div class="col-3 is-vertical-align">
        <fieldset>
            <legend>Retport Types</legend>
            <p class="grouped">
                {#each Object.keys(data.types) as col}
                    {col} <input type=checkbox bind:checked={data.types[col]}/>
                {/each}
            </p>
        </fieldset>
    </div>
</div>

    
    <style>
    
  
  
    </style>