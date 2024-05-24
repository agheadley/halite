<script>
    import * as file from '$lib/file';
    import {pupils} from '$lib/store';
    
    /** @type {any}*/
    export let status;
    
    let exportScores=()=>{
    
        console.log(status.assessment);
        console.log(status.table);
        /** @type {string[][]}*/
        let out=[];

        
        out[0]=['pid','pn','sn','g','assessment'];
        if(!status.assessment.tag.grade) {
            for(let t of status.assessment.total) out[0].push(`${t.n}/${t.t}`);
        }
        out[0].push('percentage');
        if(!status.assessment.tag.grade) out[0].push('grade');
        
        
        for(let group of status.table) {

            for(let pupil of group.pupil) {
                if(status.tab==='all' || (status.tab==='group' && group.g===status.g)) {
                    let row=[
                        String(pupil.pid),
                        pupil.pn,
                        pupil.sn,
                        group.g,
                        `${status.assessment.n} ${status.assessment.ds}`
                    ];
                    if(!status.assessment.tag.grade) {
                        for(let t of pupil.t) row.push(String(t));
                    }
                    row.push(pupil.gd);
                    if(!status.assessment.tag.grade) row.push(pupil.pc);

                    out.push(row);

                }

            }

        }
    
       
    
      
    
        console.log(out);
        file.csvDownload(out,"SCORES.csv");
    };
    
    let exportScatter=()=>{
        console.log($pupils);
        let out=[];
        out[0]=['pid','sn','pn','hse','gnd','g','type'];
        out[0].push(status.std.A);
        out[0].push(status.std.B);
    
    
    
        for(let group of status.table) {
            for(let pupil of group.pupil) {
                let f=$pupils.find(el=>el.pid===pupil.pid);
                if(f?.base?.[0]) {
                    for(let item of f.base) {
                        /** @type {number|''}*/
                        let a=item.A;
                        if(status.std.A==='GCSE' && item.type!=='overall') a='';
                        let row=[pupil.pid,pupil.sn,pupil.pn,pupil.hse,pupil.gnd,group.g,item.type,a,item.B];
                        out.push(row);
                    }
                } else {
                    let row=[pupil.pid,pupil.sn,pupil.pn,pupil.hse,pupil.gnd,group,"TBC","",""];
                    out.push(row);
                }
                   
            }
                
            
    
        }
    
    
    
    
            console.log(out);
            file.csvDownload(out,"INTAKE.csv");
    };
    
    </script>
    
    
    <header>
    <h4>Export</h4>
    </header>
    <p>&nbsp;</p>
    <p>
        <button on:click={exportScores} class="button outline fixed-width">Scores&nbsp;
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
    </p>
    <p>
        <button on:click={exportScatter} class="button outline fixed-width">Scatter&nbsp;
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
        </button>
    </p>
    <p>&nbsp;</p>
    <footer>
        <button class="button outline" on:click={()=>status.download=false}>Cancel</button>
    </footer>
    
    <style>
    
    .fixed-width {
            width:100%;
        }
    
    </style>