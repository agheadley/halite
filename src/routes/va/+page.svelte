<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import  Graph from './_Graph.svelte';
    import * as file from '$lib/file';

    /** @type {any}*/    
    let status = {
		tabs:['Overall VA','Group VA','Intake VA'],
		tab:'Overall VA',
        results:[],
        subjects:[],
        groups:[],
        courses:[],
        bands:['A','B','C','D'],
        std:'A',
        stds:{A:'NAT',B:'IND'},
        overallVA:[],
        groupVA:[],
        intakeVA:[],
        extras:['iep','eal','gt'],
        houses:[]
    
    };

    let download=()=>{
        console.log('download...');
        console.log('std',status.std);
        console.log('tab',status.tab);
        let out=[];

        if(status.tab==="Overall VA" && status.overallVA[0]) {
           console.log(status.overallVA);
           out[0]=[`[${status.stds[status.std]}] COURSE`,'SUBJECT','ALL'];
           for(let x of status.overallVA[0].ALL[status.std]) out[0].push(x.yr);
           out[0].push('MALE');
           for(let x of status.overallVA[0].ALL[status.std]) out[0].push(x.yr);
           out[0].push('FEMALE');
           for(let x of status.overallVA[0].ALL[status.std]) out[0].push(x.yr);
           for(let row of status.overallVA) {
                let line=[];
                line.push(row.sc,row.sl,'ALL');
                for(let x of row.ALL[status.std]) line.push(`${x.va.v} ${x.va.s!==0 ? '@'+x.va.s+'se' :''}`);
                line.push('MALE');
                for(let x of row.M[status.std]) line.push(`${x.va.v} ${x.va.s!==0 ? '@'+x.va.s+'se' :''}`);
                line.push('FEMALE');
                for(let x of row.F[status.std]) line.push(`${x.va.v} ${x.va.s!==0 ? '@'+x.va.s+'se' :''}`);
                out.push(line);
           }

        }
        if(status.tab==="Group VA" && status.groupVA[0]) {
            console.log(status.groupVA);
            out[0]=[`[${status.stds[status.std]}] COURSE`,'SUBJECT','GROUPS'];
            for(let row of status.groupVA) {
                let line=[row.sc,row.sl];
                for(let x of row.groups[status.std]) line.push(x.g);
                out.push(line);
                line=['VA',''];
                for(let x of row.groups[status.std]) line.push(`${x.va.v} ${x.va.s!==0 ? '@'+x.va.s+'se' :''}`);
                out.push(line);
                line=['PUPIL','COMPARISON'];
                for(let x of row.groups[status.std]) line.push(`${x.cf.v} ${x.cf.s!==0 ? '@'+x.cf.s+'se' :''}`);
                out.push(line);
            }

        }
        if(status.tab==="Intake VA" && status.intakeVA[0]) {
            console.log(status.intakeVA);
            out[0]=[`[${status.stds[status.std]}] COURSE`,'SUBJECT','ALL'];
            for(let x of status.intakeVA[0].ALL[status.std]) out[0].push(x.band);
            out[0].push('MALE');
            for(let x of status.intakeVA[0].ALL[status.std]) out[0].push(x.band);
            out[0].push('FEMALE');
            for(let x of status.intakeVA[0].ALL[status.std]) out[0].push(x.band);
            for(let row of status.intakeVA) {
                let line=[];
                line.push(row.sc,row.sl,'ALL');
                for(let x of row.ALL[status.std]) line.push(`${x.va.v} ${x.va.s!==0 ? '@'+x.va.s+'se' :''}`);
                line.push('MALE');
                for(let x of row.M[status.std]) line.push(`${x.va.v} ${x.va.s!==0 ? '@'+x.va.s+'se' :''}`);
                line.push('FEMALE');
                for(let x of row.F[status.std]) line.push(`${x.va.v} ${x.va.s!==0 ? '@'+x.va.s+'se' :''}`);
                out.push(line);
            }

        }


        file.csvDownload(out,'VA.csv');
    };

    /**
     * 
     * @param {string}std
     */
    let setVAStd=(std)=>{
        status.std=std;
    };

    /**
     * 
     * @param {string} tab
     */
    let setTab=(tab)=>{
        status.tab=tab;
    };

    let getVA=(/** @type {any[]} */ results)=>{
        let out={n:0,v:0,s:0};
        if(results?.[0]) {
            //for(let item of results) console.log(item.res);
            out.v=results.reduce((/** @type {any} */ a, /** @type {any} */ b) => a + b, 0) / results.length;
            out.v=Math.round(100*out.v)/100;
            out.n=results.length;
            let lp=1/Math.sqrt(out.n);
            out.s = Math.abs(out.v) <= 2*lp ? 0 : Math.abs(out.v) > 3*lp ? 3 : 2;  

            
        }
        return out;
    };

     /**
     * 
     * @param {string} sc
     * @param {string} ss
     */
     let getIntakeData=(sc,ss)=>{

        let results=status.results[4].results;  // get chosen year (index 4, of 5 years)

        /** @typedef {{va:{n:number,v:number,s:number},band:string}} VABand*/
        /** @type {{ALL:{A:VABand[],B:VABand[]},M:{A:VABand[],B:VABand[]},F:{A:VABand[],B:VABand[]}}}*/
        let res={ALL:{A:[],B:[]},M:{A:[],B:[]},F:{A:[],B:[]}};

        /** cycle through each band*/

        for(let item of status.bands) {

            let f=results.filter((/** @type {{ ss: string; sc: string; }} */ el)=>el.ss===ss && el.sc===sc);
            if(sc==='*' && ss==='*') f=results;
            if(sc!=='*' && ss=='*') f=results.filter((/** @type {{ sc: string; }} */ el)=>el.sc===sc);

        
            res.ALL.A.push({band:item,va:getVA(f.filter((/** @type {{ band: { A: any; }; }} */ el)=>el.band.A===item).map((/** @type {{ res: { A: any; }; }} */ el)=>el.res.A))});
            res.ALL.B.push({band:item,va:getVA(f.filter((/** @type {{ band: { B: any; }; }} */ el)=>el.band.B===item).map((/** @type {{ res: { B: any; }; }} */ el)=>el.res.B))});
            let r=f.filter((/** @type {{ gnd: string; }} */ el)=>el.gnd==='M');
            res.M.A.push({band:item,va:getVA(r.filter((/** @type {{ band: { A: any; }; }} */ el)=>el.band.A===item).map((/** @type {{ res: { A: any; }; }} */ el)=>el.res.A))});
            res.M.B.push({band:item,va:getVA(r.filter((/** @type {{ band: { B: any; }; }} */ el)=>el.band.B===item).map((/** @type {{ res: { B: any; }; }} */ el)=>el.res.B))});
            r=f.filter((/** @type {{ gnd: string; }} */ el)=>el.gnd==='F');
            res.F.A.push({band:item,va:getVA(r.filter((/** @type {{ band: { A: any; }; }} */ el)=>el.band.A===item).map((/** @type {{ res: { A: any; }; }} */ el)=>el.res.A))});
            res.F.B.push({band:item,va:getVA(r.filter((/** @type {{ band: { B: any; }; }} */ el)=>el.band.B===item).map((/** @type {{ res: { B: any; }; }} */ el)=>el.res.B))});


        }

        return res;
}



    let getIntake=()=>{
        status.intakeVA=[];
        
        let x=getIntakeData('*','*');
        let row={sc:'ALL',sl:'ALL',ALL:x.ALL,M:x.M,F:x.F};
        status.intakeVA.push(row);
        
        for(let course of status.courses) {

            let x=getIntakeData(course,'*');
            let row={sc:course,sl:'ALL',ALL:x.ALL,M:x.M,F:x.F};
            status.intakeVA.push(row);
        
            
            let subjects=status.subjects.filter((/** @type {{ sc: any; }} */ el)=>el.sc===course);
            for(let subject of subjects) {

                let x=getIntakeData(subject.sc,subject.ss);
                let row={sc:course,sl:subject.sl,ALL:x.ALL,M:x.M,F:x.F};
                status.intakeVA.push(row);

            }
        }

        console.log(status.intakeVA);

    };

      /**
     * 
     * @param {string} sc
     * @param {string} ss
     */
     let getOverallData=(sc,ss)=>{
        /** @typedef {{va:{n:number,v:number,s:number},yr:number}} VAYear*/
        /** @type {{ALL:{A:VAYear[],B:VAYear[]},M:{A:VAYear[],B:VAYear[]},F:{A:VAYear[],B:VAYear[]}}}*/
        let res={ALL:{A:[],B:[]},M:{A:[],B:[]},F:{A:[],B:[]}};
      
        /** cycle through each year*/
        for(let item of status.results) {


            let f=item.results.filter((/** @type {{ ss: string; sc: string; }} */ el)=>el.ss===ss && el.sc===sc);
            if(sc==='*' && ss==='*') f=item.results;
            if(sc!=='*' && ss=='*') f=item.results.filter((/** @type {{ sc: string; }} */ el)=>el.sc===sc);

           

            if(status.extras.includes(sc) && (ss==='YES' || ss==='NO')) {
                let bool= ss==='YES' ? true : false;
                f=item.results.filter((/** @type {{ sen: { [x: string]: boolean; }; }} */ el)=>el.sen[sc]===bool);
            }

            //console.log(item.yr,f?f.length:0);
               
            res.ALL.A.push({yr:item.yr,va:getVA(f.map((/** @type {{ res: { A: any; }; }} */ el)=>el.res.A))});
            res.ALL.B.push({yr:item.yr,va:getVA(f.map((/** @type {{ res: { B: any; }; }} */ el)=>el.res.B))});
            let r=f.filter((/** @type {{ gnd: string; }} */ el)=>el.gnd==='M');
            res.M.A.push({yr:item.yr,va:getVA(r.map((/** @type {{ res: { A: any; }; }} */ el)=>el.res.A))});
            res.M.B.push({yr:item.yr,va:getVA(r.map((/** @type {{ res: { B: any; }; }} */ el)=>el.res.B))});
            r=f.filter((/** @type {{ gnd: string; }} */ el)=>el.gnd==='F');
            res.F.A.push({yr:item.yr,va:getVA(r.map((/** @type {{ res: { A: any; }; }} */ el)=>el.res.A))});
            res.F.B.push({yr:item.yr,va:getVA(r.map((/** @type {{ res: { B: any; }; }} */ el)=>el.res.B))});


        }

        return res;
    }

   

    let getOverall=()=>{
        status.overallVA=[];
        //console.log('*','*');
        let x=getOverallData('*','*');
        let row={sc:'ALL',sl:'ALL',ALL:x.ALL,M:x.M,F:x.F};
        status.overallVA.push(row);
        for(let course of status.courses) {
            let subjects=status.subjects.filter((/** @type {{ sc: any; }} */ el)=>el.sc===course);
            //console.log(course,'*');
            let x=getOverallData(course,'*');
            let row={sc:course,sl:'ALL',ALL:x.ALL,M:x.M,F:x.F};
            status.overallVA.push(row);
            for(let subject of subjects) {
                //console.log(subject.sc,subject.sl,subject.ss);
                let x=getOverallData(subject.sc,subject.ss);
                let row={sc:course,sl:subject.sl,ALL:x.ALL,M:x.M,F:x.F};
                status.overallVA.push(row);
            }
        }
        for(let extra of status.extras) {
            //console.log(extra,'YES');
            let x=getOverallData(extra,'YES');
            let row={sc:extra,sl:'YES',ALL:x.ALL,M:x.M,F:x.F};
            //let row={sc:extra.toUpperCase(),sl:'YES',ALL:{A:[],B:[]},M:{A:[],B:[]},F:{A:[],B:[]}};
            status.overallVA.push(row);
            //console.log(extra,'NO');
            x=getOverallData(extra,'NO');
            row={sc:extra,sl:'NO',ALL:x.ALL,M:x.M,F:x.F};
            //ow={sc:extra.toUpperCase(),sl:'NO',ALL:{A:[],B:[]},M:{A:[],B:[]},F:{A:[],B:[]}};
            status.overallVA.push(row);
        }

    };


    /**
     * 
     * @param {string} sc
     * @param {string} ss
     */
    let getGroupData=(sc,ss)=>{

    let results=status.results[4].results;  // get chosen year (index 4, of 5 years)

    /** @typedef {{g:string,va:{n:number,v:number,s:number},cf:{n:number,v:number,s:number}}} Group*/
    /** @type {{A:Group[],B:Group[]}}*/
    let res={A:[],B:[]};

    let groups=status.groups.filter((/** @type {{ sc: string; ss: string; }} */ el)=>el.sc===sc && el.ss===ss).map((/** @type {{ g: any; }} */ el)=>el.g);
    console.log(sc,ss,groups);

    /** all groups */
    let va=results.filter((/** @type {{ ss: string; sc: string; }} */ el)=>el.ss===ss && el.sc===sc);
    let pupils=va.map((/** @type {{ pid: any; }} */ el)=>el.pid);
    let cf=[];
    for(let pupil of pupils) {
        let f=results.filter((/** @type {{ pid: number; ss: string; sc: string; }} */ el)=>el.pid===pupil && (el.ss!==ss || el.sc!==sc));
        for(let x of f) cf.push(x);
    }
    //console.log(sc,ss,va,pupils,cf);
    //for(let item of va) console.log(item.res.A,item.res.B);
    res.A.push({g:'ALL',va:getVA(va.map((/** @type {{ res: { A: any; }; }} */ el)=>el.res.A)),cf:getVA(cf.map(el=>el.res.A))});
    res.B.push({g:'ALL',va:getVA(va.map((/** @type {{ res: { B: any; }; }} */ el)=>el.res.B)),cf:getVA(cf.map(el=>el.res.B))});

    /* by teaching group */
    for(let group of groups) {
        let va=results.filter((/** @type {{ ss: string; sc: string;g:string }} */ el)=>el.ss===ss && el.sc===sc && el.g===group);
        let pupils=va.map((/** @type {{ pid: any; }} */ el)=>el.pid);
        let cf=[];
        for(let pupil of pupils) {
            let f=results.filter((/** @type {{ pid: number; ss: string; sc: string; }} */ el)=>el.pid===pupil && (el.ss!==ss || el.sc!==sc));
            for(let x of f) cf.push(x);
        }
        console.log(sc,ss,group,va,pupils,cf);
        //for(let item of va) console.log(item.res.A,item.res.B);
        res.A.push({g:group,va:getVA(va.map((/** @type {{ res: { A: any; }; }} */ el)=>el.res.A)),cf:getVA(cf.map(el=>el.res.A))});
        res.B.push({g:group,va:getVA(va.map((/** @type {{ res: { B: any; }; }} */ el)=>el.res.B)),cf:getVA(cf.map(el=>el.res.B))});

    }

            

        return res;
    }



    let getHouseData=()=>{
    let results=status.results[4].results;  // get chosen year (index 4, of 5 years)

    /** @typedef {{g:string,va:{n:number,v:number,s:number},cf:{n:number,v:number,s:number}}} Group*/
    /** @type {{A:Group[],B:Group[]}}*/
    let res={A:[],B:[]};


    /** all houses */
    let va=results;
    res.A.push({g:'ALL',va:getVA(va.map((/** @type {{ res: { A: any; }; }} */ el)=>el.res.A)),cf:{n:0,v:0,s:0}});
    res.B.push({g:'ALL',va:getVA(va.map((/** @type {{ res: { B: any; }; }} */ el)=>el.res.B)),cf:{n:0,v:0,s:0}});

    /* by house group */
    for(let group of status.houses) {
        let va=results.filter((/** @type {{ hse: any; }} */ el)=>el.hse===group);
    
        let cf=results.filter((/** @type {{ hse: any; }} */ el)=>el.hse!==group);
    
        res.A.push({g:group,va:getVA(va.map((/** @type {{ res: { A: any; }; }} */ el)=>el.res.A)),cf:getVA(cf.map((/** @type {{ res: { A: any; }; }} */ el)=>el.res.A))});
        res.B.push({g:group,va:getVA(va.map((/** @type {{ res: { B: any; }; }} */ el)=>el.res.B)),cf:getVA(cf.map((/** @type {{ res: { B: any; }; }} */ el)=>el.res.B))});



    }

    return res;
    };


    let getGroup=()=>{

    status.groupVA=[];


    for(let course of status.courses) { 
        let subjects=status.subjects.filter((/** @type {{ sc: any; }} */ el)=>el.sc===course);
        for(let subject of subjects) {

            let x=getGroupData(subject.sc,subject.ss);
            let row={sc:course,sl:subject.sl,groups:x};
            status.groupVA.push(row);

        }
    }

    let x=getHouseData();
    let row={sc:'',sl:'HOUSES',groups:x};
    status.groupVA.push(row);

    console.log(status.houses);

    console.log(status.groupVA);


    };

    /**
     * @param {number} scr 
     */
     let getBand=(scr)=>{
        let band='';
        let scrs=[{scr:110,band:"A"},{scr:100,band:"B"},{scr:90,band:"C"},{scr:0,band:"D"}];
        if(scr>0) {
            let f=scrs.find(el=>scr>el.scr);
            band=f? f.band : '';
        }
        return band;
    };

    
    let getResults=async()=>{
        /* set stds */
        let c=$cohorts.exams.years.list[$cohorts.exams.years.index];
        // @ts-ignore
        status.stds={A:$config.std[c.lv].A,B:$config.std[c.lv].B};

        /* get results */
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'exams',filter:{yr:{$gt:c.yr-5},lv:c.lv},projection:{}}),
            headers: {'content-type': 'application/json'}
	    });
        let r= await response.json();
        console.log(r);

        response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'intake',filter:{yr:c.yr,lv:c.lv},projection:{}}),
            headers: {'content-type': 'application/json'}
	    });
        let intake= await response.json();
        console.log(intake);
        
        /* add intake, and use ALIS res if no GCSE available (US only) */
        for(let result of r) {
            let f=intake.find((/** @type {{ pid: any; }} */ el)=>el.pid===result.pid);
            
            result.i={A:0,B:0};
            result.band={A:'',B:''};
            if(f) {
                let overall=f.base.find((/** @type {{ type: string; }} */ el)=>el.type==='overall');
                if(overall) result.i={A:overall.A,B:overall.B};
                   
            }
         
            result.band.A=result.i.A>0 && c.lv!=='US' ? getBand(result.i.A) : '';
            result.band.B=result.i.B>0 ? getBand(result.i.B) : '';
            // no GCSE residuals, substitute for ALIS - as usually given to ISI
            if((c.lv==='US') && (result.res.A===undefined || result.res.A===null) && (result.res.B<=0 || result.res.B>0)) result.res.A=result.res.B;
            
        }

        let results=[];
      

        /* organise into years */ 
        for(let i=4;i>-1;i--) {
            // @ts-ignore
            let x=r.filter(el=>el.yr===( c.yr-i) && el.tag.va===true && el.gd!=='X');
            results.push({yr:(c.yr-i),results:x});
        }
        console.log(results);
   

        /* find groups for current year results */
        /** @type {{ sl: any; ss: any; sc: any;g:any }[]} */
        let groups=[];
        for(let item of results[4].results) {
            if(!groups.find(el=>el.sc===item.sc && el.ss===item.ss && el.g===item.g)) groups.push({sl:item.sl,ss:item.ss,sc:item.sc,g:item.g});
        }
        groups=groups.sort((a,b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl) || a.g.localeCompare(b.g));

        /* subjects and courses */
        /** @type {{ sl: any; ss: any; sc: any; }[]} */
        let subjects=[];
        for(let item of groups) {
            if(!subjects.find(el=>el.sc===item.sc && el.ss===item.ss)) subjects.push({sl:item.sl,ss:item.ss,sc:item.sc});
        }
        subjects=subjects.sort((a,b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl));
        let courses=[...new Set(subjects.map(el=>el.sc))];

        /* houses */
         /** @type {string[]} */
        let houses=[];
        for(let item of results[4].results) {
            if(!houses.find(el=>el===item.hse)) houses.push(item.hse);
        }
        houses=houses.sort();

        status.results=results;
        status.subjects=subjects;
        status.courses=courses;
        status.groups=groups;
        status.houses=houses;
        getOverall();
        getGroup();
        getIntake();
        console.log(status);

    };
    
    onMount(async () => {
        $location='/va';
        await getResults();
       
    });
    
    
    </script>
    
    <svelte:head>
        <title>VA</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>
    
    <div class="row">
        <div class="col is-vertical-align">
            <fieldset	 class="is-full-width">
                <legend>Cohort</legend>
                <select bind:value={$cohorts.exams.years.index} on:change={getResults}>
                    {#each $cohorts.exams.years.list as item,index}
                        <option value={index}>{item.lv} {item.yr}</option>
                    {/each}
                </select>
            </fieldset>
        </div>
        <div class="col is-vertical-align">
			<div class="tabs">
				{#each status.tabs as tab}
				<a href={'#'} on:click={()=>setTab(tab)} class={status.tab===tab?'active':''}>{tab}</a>
				{/each}
			</div>
			
		</div>
		<div class="col is-vertical-align">
			<div class="tabs">
				<a href={'#'} on:click={()=>setVAStd('A')} class={status.std==='A' ? 'active':''}>{status.stds.A}</a>
				<a href={'#'} on:click={()=>setVAStd('B')} class={status.std==='B' ? 'active':''}>{status.stds.B}</a>
			</div>
			&nbsp;
			<button on:click={download} class="button icon-only outline">
				<!--<img src="https://icongr.am/feather/download.svg?size=16&amp;color=333333" alt="download">-->
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      
			</button>
		</div>
    </div>


   

    {#if status.tab==='Group VA'}
    <div class="responsive">
        <table>
            <thead>
                <td class="cell">Course</td>
                <td class="cell">Subject</td>
                <td class="cell"></td>  
            </thead>
            {#each status.groupVA as row,rowIndex}
		    <tbody>
            <tr>
                <td class="cell"></td>
                <td class="cell"></td>
                <td class="cell"></td>
                {#each row.groups[status.std] as col}
                <td class="cell">{col.g}</td>
                {/each}
            </tr>
            <tr>
                <td class="cell">{row.sc}</td>
                <td class="cell">{row.sl}</td>
                <td class="cell">Group VA</td>
                {#each row.groups[status.std] as col}
                <td class="cell"><Graph data={col.va}/></td>
                {/each}
            </tr>
            <tr>
                <td class="cell"></td>
                <td class="cell"></td>
                <td class="cell">cf Pupils</td>
                {#each row.groups[status.std] as col}
                <td class="cell"><Graph data={col.cf}/></td>
               
                {/each}
            </tr>
          
            
            </tbody>
            {/each}
        
		</table>
    </div>
    {/if}




    {#if status.tab==='Intake VA'}
    <div class="responsive">
        <table>

            {#each status.intakeVA as row,rowIndex}
		    {#if rowIndex===0 || (rowIndex>0 && row.sc!==status.overallVA[rowIndex-1].sc)}
			<thead>    
			<tr>
					<td class="cell">Course</td>
					<td class="cell">Subject</td>
                    <td class="cell">&nbsp;&nbsp;&nbsp;</td>

                    <td class="cell"></td>
					{#each status.bands as col}
						<td class="cell">{col}</td>
					{/each}
					<td class="cell"></td>        
					
					{#each status.bands as col}
						<td class="cell">{col}</td>
					{/each}
					<td class="cell"></td>
					{#each status.bands as col}
						<td class="cell">{col}</td>
					{/each}
		
			</tr>
			</thead>
            {/if}
            <tbody>
            <tr>
                <td class="cell">{row.sc}</td>
                <td class="cell">{row.sl}</td>
                <td class="cell">&nbsp;&nbsp;&nbsp;</td>

                
                <td class="cell">ALL</td>
                {#each row.ALL[status.std] as col}
                <td class="cell"><Graph data={col.va}/></td>
                {/each}
                <td class="cell">MALE</td>
                {#each row.M[status.std] as col}
                <td class="cell"><Graph data={col.va}/></td>
                {/each}
                <td class="cell">FEMALE</td>
                {#each row.F[status.std] as col}
                <td class="cell"><Graph data={col.va}/></td>
                {/each}
            </tr>
            </tbody>
            {/each}
        
		</table>
    </div>
    {/if}



           

    


    {#if status.tab==='Overall VA'}
    <div class="responsive">
        <table>

            {#each status.overallVA as row,rowIndex}
		    {#if rowIndex===0 || (rowIndex>0 && row.sc!==status.overallVA[rowIndex-1].sc)}
			<thead>    
			    <tr>
					<td class="cell">Course</td>
					<td class="cell">Subject</td>
					<td class="cell">&nbsp;&nbsp;&nbsp;</td>


                    <td class="cell"></td>
					{#each row.ALL[status.std] as col}
						<td class="cell">{col.yr}</td>
					{/each}
					<td class="cell"></td>        
					
					{#each row.M[status.std] as col}
						<td class="cell">{col.yr}</td>
					{/each}
					<td class="cell"></td>
					{#each row.F[status.std] as col}
						<td class="cell">{col.yr}</td>
					{/each}
		
			    </tr>
			</thead>
			{/if}

            <tbody>
                <tr>
                    <td class="cell">{row.sc}</td>
                    <td class="cell">{row.sl}</td>
                    <td class="cell">&nbsp;&nbsp;&nbsp;</td>


                    <td class="cell">ALL</td>
                    {#each row.ALL[status.std] as col}
                    <td class="cell"><Graph data={col.va}/></td>
                    {/each}
                    <td class="cell">MALE</td>
                    {#each row.M[status.std] as col}
                    <td class="cell"><Graph data={col.va}/></td>
                    {/each}
                    <td class="cell">FEMALE</td>
                    {#each row.F[status.std] as col}
                    <td class="cell"><Graph data={col.va}/></td>
                    {/each}
                </tr>
            </tbody>
            {/each}


        </table>
    </div>
    {/if}
    <style>

    .responsive {
        overflow-x:auto;
    }

    .cell {
        width:2rem;
        height:3rem;
        text-align:center;
        font-size:1rem;
        line-height:3rem;
       }
    
     
    
    
    </style>