<script>

    import { onMount } from 'svelte';

    /** @type {any}*/
    export let status;

    /** @type {any}*/
    let data={
        index:0,
        subjects:[]
    };

    onMount(async () => {
        data.subjects=status.subjects.filter((/** @type {{ tid: any; }} */ el)=>el.tid===status.user);
    });

</script>


<div class="row">
    <div class="col is-vertical-align">
        <h4>HoD Comments </h4>
    </div>
    <div class="col is-vertical-align">
        <select  id="subject" bind:value={data.index}>
            <optgroup label="Subject">
                    {#each data.subjects as item,index}
                        <option value={index}>{item.fm} ({item.sc}) {item.sl} </option>
                    {/each}
            </optgroup>
          </select>
    </div>
    <div class="col is-vertical-align">
        &nbsp;
    </div>

</div>


<style>

</style>