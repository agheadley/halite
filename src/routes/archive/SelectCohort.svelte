<script>
import { onMount } from 'svelte';
import {assessments,cohorts} from '$lib/store';




onMount(async () => {

    let list=$assessments.filter(el=>el.tag.archive===true)
        .sort((a,b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl) || b.lv.localeCompare(b.lv) || b.yr-a.yr || a.dt-b.dt)
        .map(el=>({_id:el._id,sc:el.sc,sl:el.sl,ss:el.ss,lv:el.lv,yr:el.yr,n:el.n,dl:el.dl,ds:el.ds,dt:el.dt}));


    console.log(list);

    $cohorts.archive.years.list=[];

    for(let item of list) {
        if(!$cohorts.archive.years.list.find((/** @type {{ yr: number; lv: string; }} */ el)=>el.yr===item.yr && el.lv===item.lv)) $cohorts.archive.years.list.push({yr:item.yr,lv:item.lv});
    }

    console.log($cohorts.archive.years.list);
});


</script>

