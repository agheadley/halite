<script>

import {config} from '$lib/store';

/** @type {{valid:boolean,min:number,max:number,ec:string,ep:string,txt:string,_id:string}}} */ 
export let data;


</script>
<div class="parent">
    <div>
        <textarea class={data.txt.length<data.min || data.txt.length>data.max ? 'comment red' : 'comment green'} bind:value={data.txt}></textarea>
            <span class="small">{data.txt.length} / {data.max}</span>
    </div>
    <div>
        <div class="padded">
              
                <div class="parent">
                    <div>
                        <select  id="cohort" bind:value={data.ec}>
                            <optgroup label="Effort(Class)">
                                    {#each $config.report.e.list as item,index}
                                        <option value={item}>{item}</option>
                                    {/each}
                            </optgroup>
                        </select>
                    </div>
                    <div class="padded">Effort(Class)</div>
                </div>
        </div>
        <div class="padded">
              
            <div class="parent">
                <div>
                    <select  id="cohort" bind:value={data.ep}>
                        <optgroup label="Effort(Prep)">
                                {#each $config.report.e.list as item,index}
                                    <option value={item}>{item}</option>
                                {/each}
                        </optgroup>
                    </select>
                </div>
                <div class="padded">Effort(Prep)</div>
            </div>
    </div>
    </div>
</div>

<style>

.padded {
    padding:1rem;
}
.parent {
    display: inline-flex
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
    font-size:1rem;
}


</style>