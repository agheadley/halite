<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import * as file from '$lib/file';
    import AssessmentTitle from '$lib/_AssessmentTitle.svelte';
    

    /** @type {any}*/    
    let status={
        search:'',
        isTable:true,
        table:{subjects:[],pupils:[]},
        results:[]
  
    };

    let reset=()=>{
        status.search='';
    };

    let export2D=()=>{
        let out=[['ID','Surname','Preferred Name','Gender','House']];
        for(let col of status.table.subjects) out[0].push(`${col.ss}/${col.sc}`);

        for(let row of status.table.pupils) {
            let line=[row.pid,row.sn,row.pn,row.gnd,row.hse];
            for(let col of row.subjects) line.push(col);
            if(status.search==='' || status.search!=='' && row.sn.toUpperCase().includes((" "+status.search.toUpperCase()).trim())) 
            out.push(line);
        }

        file.csvDownload(out,'RESULTS-2D.csv');
    };

    let export1D=()=>{
        let out=[['ID','Surname','Preferred Name','Gender','House','Course','Result Code','Subject','Subject Code','Grade','Notes']];

        for(let row of status.results) {
        if(status.search==='' || status.search!=='' && row.sn.toUpperCase().includes((" "+status.search.toUpperCase()).trim())) {
            /** @type {string[]}*/
            let line=[];
            line.push(String(row.pid));
            line.push(row.sn);
            line.push(row.pn);
            line.push(row.gnd);
            line.push(row.hse);
            line.push(row.sc);
            line.push(row.sr);
            line.push(row.sl);
            line.push(row.ss);
            line.push(row.gd);
            line.push(row.log);
            out.push(line);

        }
        }

        file.csvDownload(out,'RESULTS-RAW.csv');
    };
    

    /**
     * 
     * @param {boolean} isTrue
     */
    let toggleTable=(isTrue)=>{
        status.isTable=isTrue;

    };
    
    let download=()=>{
        if(status.isTable) export2D();
        else export1D();
    };

    let getResults=async()=>{
        let c=$cohorts.exams.years.list[$cohorts.exams.years.index];
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'exams',filter:{yr:c.yr,lv:c.lv},projection:{}}),
            headers: {'content-type': 'application/json'}
	    });
        let res= await response.json();
        console.log(res);
        res=res.sort((/** @type {{ sn: string; pn: string; sl: string; }} */ a,/** @type {{ sn: any; pn: any; sl: any; }} */ b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn) || a.sl.localeCompare(b.sl));

        status.table.subjects=[];
        for(let item of res) {
            if(!status.table.subjects.find((/** @type {{ sc: any; ss: any; }} */ el)=>el.sc===item.sc && el.ss===item.ss)) status.table.subjects.push({sl:item.sl,ss:item.ss,sc:item.sc});
        }
        status.table.subjects=status.table.subjects.sort((/** @type {{ sc: string; sl: string; }} */ a,/** @type {{ sc: any; sl: any; }} */ b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl));

        status.table.pupils=[];
        for(let item of res) {
            if(!  status.table.pupils.find((/** @type {{ pid: any; }} */ el)=>el.pid===item.pid))   status.table.pupils.push({pid:item.pid,sn:item.sn,pn:item.pn,gnd:item.gnd,hse:item.hse});
        }

        status.results=res;

        //for (let item of status.results) console.log(item.ss,item.sc,item.gd,item.pid);

        for(let pupil of status.table.pupils) {
            let subjects=[];
            for(let subject of status.table.subjects) {
                let f=status.results.find((/** @type {{ sc: any; ss: any; pid: any; }} */ el)=>el.sc===subject.sc && el.ss===subject.ss && el.pid===pupil.pid);
                subjects.push(f?f.gd:'');
            }
            pupil.subjects=subjects;

        }

        console.log(status);

    };
    
    onMount(async () => {
        $location='/results';
        await getResults();

       
    });
    
    
    </script>
    
    <svelte:head>
        <title>Results</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
    <div class="row">
        <div class="col is-vertical-align">
            <fieldset id="cohort" class="is-full-width">
                <legend>Cohort</legend>
                <p class="grouped">
                <select  id="cohort" bind:value={$cohorts.exams.years.index} on:change={getResults}>
                    <optgroup label="Form Level ExamYear">
                            {#each $cohorts.exams.years.list as item,index}
                                <option value={index}>{item.lv} {item.yr}</option>
                            {/each}
                    </optgroup>
                  </select>
                </p>
                </fieldset>
            
        </div>
        <div class="col is-vertical-align">
            <input type=text placeholder='surname' bind:value={status.search}/>&nbsp;<button on:click={reset} class="button clear icon-only"><img src="https://icongr.am/feather/delete.svg?size=16&amp;color=333333" alt="logout"></button>
        </div>
        <div class="col is-vertical-align">
            <div class="tabs">
                <a class={status.isTable?'active':''} on:click={()=>toggleTable(true)} href={'#'}>Table</a>
                <a class={!status.isTable?'active':''} on:click={()=>toggleTable(false)} href={'#'}>List</a>
            </div>
        </div>
            
    
        <div class="col is-vertical-align">
            <button on:click={download} class="button icon-only outline">
                <!--<img src="https://icongr.am/feather/download.svg?size=16&amp;color=333333" alt="download">-->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            
            </button>
        </div>

    </div>

   


    {#if !status.isTable}
    <div>
        <table class="striped">
            <tr>
                <th>ID</th><th>Surname</th><th>Preferred Name</th><th>Course</th><th>Subject</th><th>Result Code</th><th>Grade</th><th>Log</th>
            </tr>
            
            {#each status.results as row,rowIndex}
            {#if status.search==='' || row.sn.toLowerCase().includes((status.search.toLowerCase()+' ').trim())}
            <tr>
                <td>{row.pid}</td>
                <td>{row.sn}</td>
                <td>{row.pn}</td>
                <td>{row.sc}</td>
                <td>{row.sl}</td>
                <td>{row.sr}</td>
                <td>{row.gd}</td>
                <td>{row.log!==null ? row.log : ''}</td>
            </tr>
            {/if}
            {/each}
            
        </table>
    </div>
    {/if}


    {#if status.isTable}
    <div class="responsive">
        <table class="striped">
            <tr>
                <th></th>
                <th></th>
                {#each status.table.subjects as col}
                <td><AssessmentTitle title={col.sl} subtitle={col.sc}/></td>
                {/each}
            </tr>
            {#each status.table.pupils as row,rowIndex}
            {#if status.search==='' || row.sn.toLowerCase().includes((status.search.toLowerCase()+' ').trim())}
            <tr>
                <td>{row.sn}</td>
                <td>{row.pn}</td>
                {#each row.subjects as col,colIndex}
                    <td>{col}</td>

                {/each}
            </tr>
            {/if}
            {/each}
        </table>
    </div>
    {/if}

    <style>

        table {
            font-size:1rem;
        }
    .responsive {
        overflow-x:auto;
    }

    
    </style>