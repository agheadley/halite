<script>
    import * as file from '$lib/file';
    import {pupils} from '$lib/store';
    
    /** @type {any}*/
    export let status;
    
    let exportScores=()=>{
    
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
       
        let out=[];
       
        out[0]=["percentage","grade"];

        let groups=[...new Set(status.table.map((/** @type {{ g: any; }} */ el)=>el.g).sort())];

        let students=status.table.map((/** @type {{ pupil: any[]; g: any; }} */ top)=>top.pupil.map((/** @type {{ pid: any; sn: any; pn: any; gd: any; pc: any; }} */ el)=>({g:top.g,pid:el.pid,sn:el.sn,pn:el.pn,gd:el.gd,pc:el.pc}))).flat();
        students.sort((/** @type {{ pc: number; }} */ a,/** @type {{ pc: number; }} */ b)=>b.pc-a.pc);

        console.log(groups,students);
        
        for(let item of groups) out[0].push(item);
        for(let item of students) {
            //console.log(item['percentage'],item['grade'],item['surname'],item['setCode']);
            let row=[item.pc,item.gd];
            for(let col of groups) {
                if(item.g===col) row.push(`${item.pn} ${item.sn}`);
                else row.push("");
            }
            out.push(row);
        }
        

        console.log(out);
        file.csvDownload(out,"SCATTER.csv");
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