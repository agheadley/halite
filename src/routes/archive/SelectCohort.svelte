<script>
import { onMount } from 'svelte';
import {assessments,cohorts} from '$lib/store';




onMount(async () => {

    let list=$assessments.filter(el=>el.tag.archive===true)
        .sort((a,b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl) || b.lv.localeCompare(b.lv) || b.yr-a.yr || a.dt-b.dt)
        .map(el=>({_id:el._id,sc:el.sc,sl:el.sl,ss:el.ss,lv:el.lv,yr:el.yr,n:el.n,dl:el.dl,ds:el.ds,dt:el.dt}));


    console.log(list);
    
    cohorts.subjects=[];
    for(let item of cohorts.list) {
        if(!cohorts.subjects.find((/** @type {{ sc: any; ss: any; }} */ el)=>el.sc===item.sc && el.ss===item.ss)) cohorts.subjects.push({sc:item.sc,ss:item.ss,sl:item.sl});
    }

    console.log(cohorts);
});


</script>

