<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import * as file from '$lib/file.js';

   /** @type {any}*/
   let results=[];

    /** @type {any} */
    let status ={
        tabs:['Totals','Percentages','KPIs'],
        tab:'Totals',
        isPercentage:false,
        sections:[],
        results:[],
        subjects:[],
        courses:[],
        totals:[],
        rgb:{r:34,g:139,b:34}
    };

    /**
	 * 
	 * @param {string} tab
	*/
	let setTab=(tab)=>{
		status.tab=tab;
		status.isPercentage=tab==='Percentages'?true:false;
	};

    let exportKPI=()=>{
        let out=[];

        for(let section of status.sections) {

            let row = [section.section,'','[ALL]'];
            for(let col of section.cols) row.push(col.col);
            row.push('[M]');
            for(let col of section.cols) row.push(col.col);
            row.push('[F]');
            for(let col of section.cols) row.push(col.col);
            out.push(row);

            for(let item of section.rows) {
                let row=['',item.yr,''];
                for(let col of item.cols) row.push(col.ALL.pc);
                row.push('');
                for(let col of item.cols) row.push(col.M.pc);
                row.push('');
                for(let col of item.cols) row.push(col.F.pc);
                out.push(row);
            }
        }

        file.csvDownload(out,'KPI.csv');


    };

    let exportTotals=()=>{
        /** @type {string[][]}*/
		let out=[];
		
        let c=$cohorts.exams.years.list[$cohorts.exams.years.index];
		for(let course of status.totals) {

			let row=['COURSE/SUBJECT',String(c.yr)];
			row.push('');
			for(let col of course.ALL) row.push(col.gd);
			row.push('');
			for(let col of course.F) row.push(col.gd);
			row.push('');
			for(let col of course.F) row.push(col.gd);
			out.push(row);

			row=[course.course,'','[ALL]'];
			for(let col of course.ALL) row.push(String(status.isPercentage ? Math.round(100*col.pc)/100 : col.t));
			row.push('[M]');
			for(let col of course.M) row.push(String(status.isPercentage ? Math.round(100*col.pc)/100 : col.t));
			row.push('[F]');
			for(let col of course.F) row.push(String(status.isPercentage ? Math.round(100*col.pc)/100 : col.t));
			out.push(row);

			for(let subject of course.subjects) {
				let row=[subject.sl,'','[ALL]'];
				for(let col of subject.total.ALL) row.push(String(status.isPercentage ? Math.round(100*col.pc)/100 : col.t));
				row.push('[M]');
				for(let col of subject.total.M) row.push(String(status.isPercentage ? Math.round(100*col.pc)/100 : col.t));
				row.push('[F]');
				for(let col of subject.total.F) row.push(String(status.isPercentage ? Math.round(100*col.pc)/100 : col.t));
				out.push(row);

			}
			
		}
		file.csvDownload(out,'TOTALS.csv');
    };


    let download=()=>{
		if(status.tab==='KPIs') exportKPI();
		if(status.tab==='Totals' || status.tab==='Percentages') exportTotals();
	};

    
    let getTotals=()=>{
        
        let results=status.results[0].results.filter((/** @type {{ tag: { total: boolean; }; }} */ el)=>el.tag.total===true);
        status.totals=[];

        for(let course of status.courses) {
            let grades=$config.grade.filter(el=>el.sc===course).sort((a,b)=>b.scr-a.scr).map(el=>({gd:el.gd,t:0,pc:0,color:''}));
            let subjects=[];
            for(let subject of status.subjects.filter((/** @type {{ sc: any; }} */ el)=>el.sc===course)) {
                let sub={
                    sl:subject.sl,ss:subject.ss,sc:subject.sc,
                    total:{
                        ALL:grades.map(el=>({gd:el.gd,t:0,pc:0,color:''})),
                        M:grades.map(el=>({gd:el.gd,t:0,pc:0,color:''})),
                        F:grades.map(el=>({gd:el.gd,t:0,pc:0,color:''}))
                }};
            

                // @ts-ignore
                let x=results.filter(el=>el.sc===course && el.ss===subject.ss);
                let t=x[0] ? x.length : 0;
                console.log(course,subject.ss,t);
                for(let gd of sub.total.ALL) {
                    let f=results.filter((/** @type {{ sc: any; ss: any; gd: string; }} */ el)=>el.sc===course && el.ss===subject.ss && el.gd===gd.gd);
                    gd.t=f[0] ? f.length : 0;
                    gd.pc=f[0] && t>0 ? 100*(f.length/t) : 0;
                    gd.color=`rgba(${status.rgb.r},${status.rgb.g},${status.rgb.b},${gd.pc/200})`;
                }
                for(let gd of sub.total.F) {
                    let f=results.filter((/** @type {{ gnd: string; sc: any; ss: any; gd: string; }} */ el)=>el.gnd==='F' && el.sc===course && el.ss===subject.ss && el.gd===gd.gd);
                    gd.t=f[0] ? f.length : 0;
                    gd.pc=f[0] && t>0 ? 100*(f.length/t) : 0;
                    gd.color=`rgba(${status.rgb.r},${status.rgb.g},${status.rgb.b},${gd.pc/200})`;
                }
                for(let gd of sub.total.M) {
                    let f=results.filter((/** @type {{ gnd: string; sc: any; ss: any; gd: string; }} */ el)=>el.gnd==='M' && el.sc===course && el.ss===subject.ss && el.gd===gd.gd);
                    gd.t=f[0] ? f.length : 0;
                    gd.pc=f[0] && t>0 ? 100*(f.length/t) : 0;
                    gd.color=`rgba(${status.rgb.r},${status.rgb.g},${status.rgb.b},${gd.pc/200})`;
                }
            
                subjects.push(sub);
            
            }
            let total={course:course,ALL:grades.map(el=>({gd:el.gd,t:0,pc:0,color:''})),M:grades.map(el=>({gd:el.gd,t:0,pc:0,color:''})),F:grades.map(el=>({gd:el.gd,t:0,pc:0,color:''})),subjects:subjects};
        
            // @ts-ignore
            let x=results.filter(el=>el.sc===course);
            let t=x[0] ? x.length : 0;
            console.log(course,t);
            for(let gd of total.ALL) {
                let f=results.filter((/** @type {{ sc: any; ss: any; gd: string; }} */ el)=>el.sc===course && el.gd===gd.gd);
                gd.t=f[0] ? f.length : 0;
                gd.pc=f[0] && t>0 ? 100*(f.length/t) : 0;
                gd.color=`rgba(${status.rgb.r},${status.rgb.g},${status.rgb.b},${gd.pc/200})`;
            }
            for(let gd of total.F) {
                let f=results.filter((/** @type {{ gnd: string; sc: any; ss: any; gd: string; }} */ el)=>el.gnd==='F' && el.sc===course && el.gd===gd.gd);
                gd.t=f[0] ? f.length : 0;
                gd.pc=f[0] && t>0 ? 100*(f.length/t) : 0;
                gd.color=`rgba(${status.rgb.r},${status.rgb.g},${status.rgb.b},${gd.pc/200})`;
            }
            for(let gd of total.M) {
                let f=results.filter((/** @type {{ gnd: string; sc: any; ss: any; gd: string; }} */ el)=>el.gnd==='M' && el.sc===course && el.gd===gd.gd);
                gd.t=f[0] ? f.length : 0;
                gd.pc=f[0] && t>0 ? 100*(f.length/t) : 0;
                gd.color=`rgba(${status.rgb.r},${status.rgb.g},${status.rgb.b},${gd.pc/200})`;
            }

            status.totals.push(total);
        }

        console.log(status);
    };
        
    let getKPI=()=>{

            let c=$cohorts.exams.years.list[$cohorts.exams.years.index];
            status.kpis=$config.kpi.filter(el=>el.lv===c.lv);
            let list = [...new Set(status.kpis.sort((/** @type {{ sort: number; }} */ a,/** @type {{ sort: number; }} */ b)=>a.sort-b.sort).map((/** @type {{ section: any; }} */ el)=>el.section))];
            console.log(list);
            status.sections=[];
    
            for(let item of list) {
                let kpis=status.kpis.filter((/** @type {{ section: any; }} */ el)=>el.section===item).sort((/** @type {{ sort: number; }} */ a,/** @type {{ sort: number; }} */ b)=>a.sort-b.sort);
                /** @type {any}*/
                let cols=[];
                for(let k of kpis) {
                    if(!cols.find((/** @type {{ col: any; }} */ el)=>el.col===k.KPI)) cols.push({col:k.KPI,grades:[]});
                }
                console.log(item,cols);
                
                for(let col of cols) {
                    col.grades=status.kpis.filter((/** @type {{ section: any; KPI: any; }} */ el)=> el.section===item && el.KPI===col.col).map((/** @type {{ sc: any; gd: any; }} */ el)=>({sc:el.sc,gd:el.gd}));
                }
                status.sections.push({section:item,cols,ALL:[],M:[],F:[],rows:[]});
                
            }




            for(let section of status.sections) {
                let courses=[...new Set(status.kpis.filter((/** @type {{ section: any; }} */ el)=>el.section===section.section).map((/** @type {{ sc: any; }} */ el)=>el.sc))];
                for(let item of status.results) {
                    let results=item.results.filter((/** @type {{ tag: { kpi: boolean; }; }} */ el)=>el.tag.kpi===true);
                    let n=0;
                    let nf=0;
                    let nm=0;
                    for(let course of courses) {
                        
                        let res=results.filter((/** @type {{ sc: string; }} */ el)=>el.sc===course);
                        n+= res?.[0] ? res.length : 0;
                        res=results.filter((/** @type {{ gnd: string; sc: string; }} */ el)=>el.gnd==='M' && el.sc===course);
                        nm+= res?.[0] ? res.length : 0;
                        res=results.filter((/** @type {{ gnd: string; sc: string; }} */ el)=>el.gnd==='F' && el.sc===course);
                        nf+= res?.[0] ? res.length : 0;
                    }
                    section.ALL.push({yr:item.yr,n:n});
                    section.M.push({yr:item.yr,n:nm});
                    section.F.push({yr:item.yr,n:nf});
                }
            }

            
            for(let section of status.sections) {
                section.rows=[];
                let index=0;
                for(let item of status.results) {
                    let results=item.results.filter((/** @type {{ tag: { kpi: boolean; }; }} */ el)=>el.tag.kpi===true);
                    let cols=[];
                    
                    for(let col of section.cols) {
                    let t=0;
                    let tm=0;
                    let tf=0;
                    for(let grade of col.grades) {
                        let found=results.filter((/** @type {{ gd: string; sc: string; }} */ el)=>el.gd===grade.gd && el.sc===grade.sc);
                        t+=found?.[0] ? found.length : 0;
                        let foundX=found.filter((/** @type {{ gnd: string; }} */ el)=>el.gnd==='M');
                        tm+=foundX?.[0] ? foundX.length : 0;
                        foundX=found.filter((/** @type {{ gnd: string; }} */ el)=>el.gnd==='F');
                        tf+=foundX?.[0] ? foundX.length : 0;
                    }
                    let p= section.ALL[index].n >0 ? Math.round(10000*t/section.ALL[index].n)/100 : 0;
                    let pm= section.M[index].n >0 ? Math.round(10000*tm/section.M[index].n)/100 : 0;
                    let pf= section.F[index].n >0 ? Math.round(10000*tf/section.F[index].n)/100 : 0;
                    let c =`rgba(${status.rgb.r},${status.rgb.g},${status.rgb.b},${p/200})`;
                    let cm =`rgba(${status.rgb.r},${status.rgb.g},${status.rgb.b},${pm/200})`;
                    let cf =`rgba(${status.rgb.r},${status.rgb.g},${status.rgb.b},${pf/200})`;
                    cols.push({col:col.col,ALL:{t:t,pc:p,color:c},M:{t:tm,pc:pm,color:cm},F:{t:tf,pc:pf,color:cf}});
                    }
                    let row={section:section.section,yr:item.yr,display:String(item.yr),cols:cols};
                    section.rows.push(row);
                    index+=1;
                }
            }

            status.sections=status.sections;





            console.log(status);




    };

    let getResults=async()=>{
        let c=$cohorts.exams.years.list[$cohorts.exams.years.index];
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'exams',filter:{yr:{$gt:c.yr-5},lv:c.lv},projection:{}}),
            headers: {'content-type': 'application/json'}
	    });
        let res= await response.json();
        console.log(res);

        status.results=[];
        for(let i=0;i<5;i++) {
            // @ts-ignore
            let x=res.filter(el=>el.yr===(c.yr-i));
            status.results.push({yr:(c.yr-i),results:x});
        }


        status.subjects=[];
        console.log(status.results[0].results);
        for(let item of status.results[0].results) {
            if(!status.subjects.find((/** @type {{ sc: any; ss: any; }} */ el)=>el.sc===item.sc && el.ss===item.ss)) status.subjects.push({sl:item.sl,ss:item.ss,sc:item.sc});
        }
        status.subjects=status.subjects.sort((/** @type {{ sc: string; sl: string; }} */ a,/** @type {{ sc: any; sl: any; }} */ b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl));

    
        status.courses=[...new Set(status.subjects.map((/** @type {{ sc: any; }} */ el)=>el.sc))];
  


       
       

        console.log(status);

       getKPI();
       getTotals();

    };



 

    
    
    onMount(async () => {
        $location='/totals';
        await getResults();

       
    });
    
    
    </script>
    
    <svelte:head>
        <title>Totals</title>
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
            <div class="tabs">
                {#each status.tabs as tab}
                <a href={'#'} on:click={()=>setTab(tab)} class={status.tab===tab?'active':''}>{tab}</a>
                {/each}
            </div>
            
        </div>
        <div class="col is-vertical-align">
            <button on:click={download} class="button icon-only outline">
                <!--<img src="https://icongr.am/feather/download.svg?size=16&amp;color=333333" alt="download">-->
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            
            </button>
        </div>
        
    </div>

   

   
{#if (status.tab==='Totals' || status.tab==='Percentages') && status.courses[0]}
{#each status.totals as course}

	<table>
		<thead>
		<tr>
			<th></th>
			<th></th>
			<th></th>
			{#each course.ALL as col}<th><div  class="cell"><b>{col.gd}</b></div></th>{/each}
			<th></th>
			{#each course.ALL as col}<th><div class="cell"><b>{col.gd}</b></div></th>{/each}
			<th></th>
			{#each course.ALL as col}<th><div class="cell"><b>{col.gd}</b></div></th>{/each}
		</tr>
		</thead>
		<tbody>
		<tr>
			<th class="title">COURSE ({course.course})</th>
			<td></td>
			<td><div class="cell title">ALL</div></td>
			{#each course.ALL as col}<td class="white-bg"><div style={`background-color:${col.color}`} class="cell">{!status.isPercentage ? `${col.t}` : `${Math.round(col.pc)}`}</div></td>{/each}
			<td><div class="cell title">MALE</div></td>
			{#each course.M as col}<td class="white-bg"><div style={`background-color:${col.color}`} class="cell">{!status.isPercentage ? `${col.t}` : `${Math.round(col.pc)}`}</div></td>{/each}
			<td><div class="cell title">FEMALE</div></td>
			{#each course.F as col}<td class="white-bg"><div style={`background-color:${col.color}`} class="cell">{!status.isPercentage ? `${col.t}` : `${Math.round(col.pc)}`}</div></td>{/each}
		</tr>
        
		{#each course.subjects as subject}
		<tr>
			<th class="title">{subject.sl}</th>
			<td></td>
           
			<td><div class="cell title">ALL</div></td>
			{#each subject.total.ALL as col}<td class="white-bg"><div style={`background-color:${col.color}`} class="cell">{!status.isPercentage ? `${col.t}` : `${Math.round(col.pc)}`}</div></td>{/each}
			<td><div class="cell title">MALE</div></td>
			{#each subject.total.M as col}<td class="white-bg"><div style={`background-color:${col.color}`} class="cell">{!status.isPercentage ? `${col.t}` : `${Math.round(col.pc)}`}</div></td>{/each}
			<td><div class="cell title">FEMALE</div></td>
			{#each subject.total.F as col}<td class="white-bg"><div style={`background-color:${col.color}`} class="cell">{!status.isPercentage ? `${col.t}` : `${Math.round(col.pc)}`}</div></td>{/each}
         
        </tr>
		{/each}
    
	 
		</tbody>
	</table>

<p>&nbsp;</p>
{/each}

{/if}




{#if status.tab==='KPIs' && status.sections[0]}
	{#each status.sections as section}
	<table>
		<thead>
		<tr>
			<th>{section.section}</th>
			<td></td>
			{#each section.cols as col}<td><div  class="cell kpi">{col.col}</div></td>{/each}
			<td></td>
			{#each section.cols as col}<td><div  class="cell kpi">{col.col}</div></td>{/each}
			<td></td>
			{#each section.cols as col}<td><div  class="cell kpi">{col.col}</div></td>{/each}
		</tr>
		</thead>
		<tbody>
		{#each section.rows as row}
		
			<tr>
			<th class="title">{row.yr}</th>
			<td><div class="cell title">ALL</div></td>
			{#each row.cols as col}
			<td class="white-bg" ><div style={`background-color:${col.ALL.color}`} class="cell">{`${Math.round(col.ALL.pc)}`}</div></td>
			{/each}
			<td><div class="cell title">MALE</div></td>
			{#each row.cols as col}
			<td class="white-bg" ><div style={`background-color:${col.ALL.color}`} class="cell">{`${Math.round(col.M.pc)}`}</div></td>
			{/each}
			<td><div class="cell title">FEMALE</div></td>
			{#each row.cols as col}
			<td class="white-bg" ><div style={`background-color:${col.ALL.color}`} class="cell">{`${Math.round(col.F.pc)}`}</div></td>
			{/each}

			</tr>
		
		{/each}
		</tbody>
	</table>
	<p>&nbsp;</p>
	{/each}
{/if}

    <style>

.cell {
	width:4rem;
	height:3rem;
	text-align:center;
	font-size:1.2rem;
	line-height:3rem;
}

.kpi {
	width:6rem;
	font-size:1rem;
	height:7rem;
}

.title {
	width:15rem;
	font-size:1.2rem;
	white-space: nowrap;
}
    </style>