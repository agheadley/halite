<script>

import {config} from '$lib/store';

/** @type {{valid:boolean,min:number,max:number,ec:string|null,ep:string|null,txt:string|null,_id:string,sal:string}}} */ 
export let data;


</script>

<div>
    {#if data.ec!==null || data.ep!==null}
    <div>
        <div class="flex-row start">
            <div>
                {#if data.ec!==''}
                <span class="small">
                    <fieldset id="class" class="is-full-width">
                    <legend>Effort (Class)</legend>
                    <select  id="cohort" bind:value={data.ec}>
                        <optgroup label="Effort(Class)">
                                {#each $config.report.e.list as item,index}
                                    <option value={item}>{item}</option>
                                {/each}
                        </optgroup>
                    </select>
                    </fieldset>
                </span>
                {/if}
            </div>
            <div>
                {#if data.ep!==null}
                <span class="small">
                    <fieldset id="class" class="is-full-width">
                    <legend>Effort (Prep)</legend>
                    <select  id="cohort" bind:value={data.ep}>
                        <optgroup label="Effort (Prep)">
                                {#each $config.report.e.list as item,index}
                                    <option value={item}>{item}</option>
                                {/each}
                        </optgroup>
                    </select>
                    </fieldset>
                </span>
                {/if}
            </div>
        </div>
    </div>
    {/if}
    <div>
        {#if data.txt!==null}
        <textarea class={data.txt.length<data.min || data.txt.length>data.max ? 'comment red' : 'comment green'} bind:value={data.txt}/> 
        {/if}
        </div>
    <div>
        <div class="flex-row">
            <div>
                <span class="small">{data.sal}</span>
            </div>
            {#if data.txt!==null}
            <div>
                <span class="small">{data.txt.length} / {data.min} [{data.max}]</span>
            </div>
            {/if}
            <div>
                <button class="button error small">Save</button>
            </div>
        </div>
    </div>
</div>



<style>



.flex-row {
    display:flex;
    flex-direction:row;
    justify-content:space-between;
    width:60rem;
    padding-bottom:0.25rem;
    padding-top:0.25rem;
}

.start {
    justify-content:start;
}


.comment {
        width:60rem;
        height:10rem;
}

.red {
    background:rgba(178,34,34,0.15);
   
}

.green {
    background:rgba(34,139,34,0.15);
}

.small {
    font-size:1.2rem;
}


</style>