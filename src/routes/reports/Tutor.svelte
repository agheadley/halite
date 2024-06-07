<script>
import { onMount } from 'svelte';
import {pupils,teachers} from '$lib/store';
    
/** @type {any}*/
export let status;

/** @type {any}*/
let data={
    user:'',
    tutors:[],
    tIndex:0,
    reports:[]
};

let update=()=>{
        data.user=data.tutors[data.tIndex].tg;
        data.reports=[];
       



        for(let pupil of $pupils.filter(el=>el.tg===data.user)) {

            let p=status.reports.filter((/** @type {{ pupil: { pid: number; }; type: string; author: { type: string; }; }} */ el)=>el.pupil.pid===pupil.pid && el.type==='P' && el.author.type!=='tutor');
            let a=status.reports.filter((/** @type {{ pupil: { pid: number; }; type: string; author: { type: string; }; }} */ el)=>el.pupil.pid===pupil.pid &&  el.type==='A' && el.author.type==='teacher');
            let h=status.reports.filter((/** @type {{ pupil: { pid: number; }; type: string; author: { type: string; }; }} */ el)=>el.pupil.pid===pupil.pid  && el.type==='A' && el.author.type==='hod');
            let e=status.reports.filter((/** @type {{ pupil: { pid: number; }; type: string; }} */ el)=>el.pupil.pid===pupil.pid  && el.type==='E');

            let f=status.reports.find(( /** @type {{ pupil: { pid: number; tg: any; }; type: string; author: { type: string; }; }} */ el)=>el.pupil.pid===pupil.pid && el.pupil.tg===data.user && el.type==='P' && el.author.type==='tutor');
             data.reports.push({
                pid:pupil.pid,
                sn:pupil.sn,
                pn:pupil.pn,
                tg:pupil.tg,    
                        data:{
                            valid:f?true:false,
                            min:f?f.min:0,
                            max:f?f.max:0,
                            txt:f?f.txt:'',
                            _id:f?f._id:'',
                            sal:f?f.author.sal:'',
                            log:f?f.log:''
                            
                        }
            });
        }

        console.log(data.reports.filter((/** @type {{ data: { valid: any; }; }} */ el)=>el.data.valid));
};

onMount(async () => {
    console.log('reports/Tutor.svelte mounted');

    data.user=status.user;

    console.log($pupils);

    data.tutors=[];
    for(let item of $pupils) {
        if(!data.tutors.find((/** @type {{ tg: string; }} */ el)=>el.tg===item.tg)) {
            let f=$teachers.find(el=>el.tid===item.tg);
            data.tutors.push({tg:item.tg,tid:f?f.tid:'',sal:f?f.sal:'',sn:f?f.sn:'',pn:f?f.pn:''});
        }
    }
    data.tutors.sort((/** @type {{ sn: string; pn: string; }} */ a,/** @type {{ sn: any; pn: any; }} */ b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn));

    console.log(data.tutors);

    //data.teachers=$teachers.sort((a,b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn));
    // testing
    //data.teachers=$teachers.sort((a,b)=>a.tid.localeCompare(b.tid));

    data.tIndex=data.tutors.findIndex((/** @type {{ tid: any; }} */ el)=>el.tid===data.user);

    
    update();
    //await updateReports(); // already handled by update


});


</script>

<div class="row">
    <div class="col is-vertical-align">
        <h4>Tutor Comments </h4>
    </div>
    <div class="col is-vertical-align">

        <select  id="Tutor" bind:value={data.tIndex} on:change={update}>
            <optgroup label="Tutor">
                    {#each data.tutors as item,index}
                        <option value={index}>({item.tg}) {item.pn} {item.sn}</option>
                    {/each}
            </optgroup>
          </select>
 
    </div>
</div>

<style>

</style>