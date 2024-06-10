<script>
import { onMount } from 'svelte';
import {pupils,teachers,config} from '$lib/store';


/** @type {string}*/
export let type; // hm,tutor (editiable), teacher, enrichment, hod (read only)

/** @type {any}*/
export let detail;

/** @type {any}*/
let data={
    reports:[]
};



onMount(async () => {
    console.log('reports/Detail.svelte mounted',type);
    console.log(detail);

    let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'reports',filter:{coid:detail.cycleID,"pupil.pid":detail.pid},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
    let res= await response.json();


    //console.log(res);

    let results=[];

    if(res[0]) {
        let lv=res[0].lv;
        let yr=res[0].yr;
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'results',filter:{lv:res[0].lv,yr:res[0].yr,pid:detail.pid},projection:{}}),
            headers: {'content-type': 'application/json'}
        });
    results= await response.json();
    }

    // add academic reports
    for(let report of res.filter((/** @type {{ type: string; }} */ el)=>el.type==='A').sort((/** @type {{ sc: string; sl: string; author: { tid: string; }; }} */ a,/** @type {{ sc: any; sl: any; author: { tid: any; }; }} */ b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl) || a.author.tid.localeCompare(b.author.tid) )) {
        
        // add hod comment
        let h=res.find((/** @type {{ author: { type: string; }; sl: any; sc: any; }} */ el)=>el.author.type==='hod' && el.sl===report.sl && el.sc===report.sc);
        report.hod=h?h.txt:'';
        

        // get cols for assessment data
        /** @type {any}*/
        let cols=[];
        let pupilResults=results.filter((/** @type {{ pid: number; ss: any; sc: any; }} */ el)=>el.ss===report.ss && el.sc===report.sc);
                for(let item of pupilResults) {
                    if(!cols.find((/** @type {{ n: any; dl: any; }} */ el)=>el.n===item.n && el.dl===item.dl)) {
                        cols.push({
                                n:item.n,
                                ds:item.dl?.length===10 ? item.dl[5]+item.dl[6]+"/" +item.dl[2]+item.dl[3]: '00/00',
                                dt:new Date(item.dl).getTime(),
                                dl:item.dl,
                                gd:'X',
                                pc:0,
                                r:0
                        });
                    }
                }
                cols=cols.sort((/** @type {{ dt: number; }} */ a,/** @type {{ dt: number; }} */ b)=>a.dt-b.dt);
             
                if(cols[0]) {
                    for(let col of cols) {
                        let f=pupilResults.find((/** @type {{ n: any; dl: any; }} */ el)=>el.n===col.n && el.dl===col.dl);
                        col.gd=f?f.gd:'X';
                        col.pc=f?f.pc:0;
                    }

                    let gds=$config.grade.filter((/** @type {{ sc: string; }} */ el)=>el.sc===report.sc).sort((/** @type {{ scr: number; }} */ a,/** @type {{ scr: number; }} */ b)=>b.scr-a.scr);
                    let  s1=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===cols[0].gd);
                    for(let col of cols) {
                        let s2=gds.findIndex((/** @type {{ gd: any; }} */ el)=>el.gd===col.gd); 
                        col.r = s1>-1 && s2>-1 ? s1-s2 : 0; 
                    }
                }

                report.cols=cols;


        
       
        data.reports.push(report);



    }

    // add enrichments reports
    for(let report of res.filter((/** @type {{ type: string; }} */ el)=>el.type==='E').sort((/** @type {{ sl: string; author: { tid: string; }; }} */ a,/** @type {{ sl: any; author: { tid: any; }; }} */ b)=>a.sl.localeCompare(b.sl) || a.author.tid.localeCompare(b.author.tid))) {
        data.reports.push(report);
    }

    // add pastoral reports
    for(let report of res.filter((/** @type {{ type: string; }} */ el)=>el.type==='P').sort((/** @type {{ author: { type: any; tid: string; }; }} */ a,/** @type {{ author: { type: string; tid: any; }; }} */ b)=>b.author.type.localeCompare(a.author.type) || a.author.tid.localeCompare(b.author.tid))) {
        data.reports.push(report);
    }

    //console.log(results);


    console.log(data.reports);

});


</script>





<style>

</style>


