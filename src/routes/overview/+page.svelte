<script>
    import { onDestroy } from 'svelte';
    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
    import * as file from '$lib/file';
    import SelectCohort from './SelectCohort.svelte';
    import IntakeBar from '$lib/_IntakeBar.svelte';
    import List from './List.svelte';
    import Export from './Export.svelte';
    import Feedback from './Feedback.svelte';
    import Modal from '$lib/_Modal.svelte';
    import AssessmentTitle from '$lib/_AssessmentTitle.svelte';
    import Cell from '$lib/_Cell.svelte';
    import Pupil from '$lib/_Pupil.svelte';

    /** @type {any}*/
    export let data;

    /** @type {any}*/
    let status={
        std:{A:'',B:''},
        pid:[],
        results:[],
        cols:[],
        table:[],
        select:false,
        list:false,
        user:'',
        update:false,
        download:false,
        view:'grade', /* grade/percentage */
        rag:false,
        sort:false,
        fb:false
    };

    /**
     * 
     * @param {number} index
     */
    let export2D=(index)=>{
        console.log(status.table);
        let out=[];
        out[0]=['id','surname','preferredName','house','gender'];
        out[0].push(`${status.cols[index].n} ${status.cols[index].ds}`);
        console.log(out);
        //file.csvDownload(out,"OVERVIEW2D.csv");
         /** @type {{ss:string,sc:string}[]} */
        let subjects=[];
        for(let item of status.results) if(!subjects.find(el=>el.ss===item.ss && el.sc===item.sc)) subjects.push({ss:item.ss,sc:item.sc});
        subjects.sort((a,b)=>a.sc.localeCompare(b.sc) || a.ss.localeCompare(b.ss));
       
        let courses=[... new Set(subjects.map(el=>el.sc))].sort();

        console.log(subjects,courses);

        for(let subject of subjects) out[0].push(`${subject.ss} / ${subject.sc}`);

        for(let row of status.table.filter((/** @type {{ show: any; }} */ el)=>el.show)) {
            let line=[];
            line.push(row.pid);
            line.push(row.sn);
            line.push(row.pn);
            line.push(row.hse);
            line.push(row.gnd);
            line.push('');
            for(let subject of subjects) {
                // @ts-ignore
                let f=status.results.find((/** @type {{ pid: any; ss: string; sc: string; }} */ el)=>el.dt===status.cols[index].dt && el.n===status.cols[index].n && el.pid===row.pid && el.ss===subject.ss && el.sc===subject.sc);
                line.push(f?f.gd:'');
            }
            out.push(line);
        } // of of main pupil loop.

        let totals=[];
        for(let item of $config.grade) {
            if(courses.includes(item.sc)) totals.push({sc:item.sc,gd:item.gd,scr:item.scr});
        } 

        
        totals=totals.sort((a,b)=>a.sc.localeCompare(b.sc) || b.scr-a.scr);
        console.log(totals);

        let totalRow=['id','surname','preferredName','house','gender',`TOTALS`];
        for(let item of totals) totalRow.push(`${item.gd} (${item.sc})`);
        out.push(totalRow);

        for(let row of status.table.filter((/** @type {{ show: any; }} */ el)=>el.show)) {
            let line=[];
            line.push(row.pid);
            line.push(row.sn);
            line.push(row.pn);
            line.push(row.hse);
            line.push(row.gnd);
            line.push('');

            for(let total of totals) {
                let f=status.results.filter((/** @type {{ dt: any; n: any; pid: any; gd: string; }} */ el)=>el.dt===status.cols[index].dt && el.n===status.cols[index].n && el.pid===row.pid && el.gd===total.gd);
                line.push(f?String(f.length):'0');
            }
            out.push(line);


        }


        file.csvDownload(out,"OVERVIEW2D.csv");


    };

    /**
     * 
     * @param {number} index
     */
    let toggleSort=(index)=>{
        //console.log(status.table);
     
        
        if(!status.sort) {
            status.sort=true;
            // @ts-ignore
            //status.table=status.table.sort((/** @type {{ cols: { d: number; }[]; }} */ a,/** @type {{ cols: { d: number; }[]; }} */ b)=>b.cols[index].u-a.cols[index].u || a.cols[index].d-b.cols[index].d);
            status.table=status.table.sort((/** @type {{ cols: { d: number; }[]; }} */ a,/** @type {{ cols: { d: number; }[]; }} */ b)=>a.cols[index].d-b.cols[index].d);
        
        } else {
            status.sort=false;
            status.table=status.table.sort((/** @type {{ sn: string; pn: string; }} */ a,/** @type {{ sn: any; pn: any; }} */ b)=>a.sn.localeCompare(b.sn) || a.pn.localeCompare(b.pn));
        }

        for(let row of status.table) {
            if(row.show===true) console.log(row.sn,row.pn,row.cols[index].d);
        }
    };

    $:{
        if(status.select) {
            console.log('changed cohort...');
            status.select=false;
        }

        if(status.update) {
            console.log('clearing list.');
            $cohorts.overview.list={name:'',pid:[]};
            status.update=false;
            status.pid=[];
            for(let row of status.table) {
                if($cohorts.overview.houses.all || $cohorts.overview.houses.list[$cohorts.overview.houses.index].hse===row.hse) {
                    row.show=true;
                    row.select=true;
                } else {
                    row.show=false;
                    row.select=false;
                }
            }
            console.log(status.pid);

            
        }
       
       
    }

  

    
    onMount(async () => {
        $location='/overview';
        console.log(`${$location} mounted`);
        console.log('pupils',$pupils);
        console.log('cohorts',$cohorts);
        status.user=data.user.name;
        let f=$config.view.find((/** @type {{ context: string; }} */ el)=>el.context==='overview');
        status.rag = f ? f.rag : false;
        
    });

    onDestroy(() => {
		$cohorts.overview.list.name='';
        $cohorts.overview.list.pid=[];
	});
    
    
    </script>
    
    <svelte:head>
        <title>Overview</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>

    <Modal bind:open={status.download}>
        <Export bind:status={status}/>
       
    </Modal>

    <Modal bind:open={status.fb}>
        <Feedback bind:status={status}/>
    </Modal>
    
    {#if status.list}
        <List bind:status={status}/>
    {/if} <!--/list display-->
   
    {#if !status.list}
    <div class="row">
        <div class="col-6 is-vertical-align">
            <div class="row">
                {#if $cohorts.overview.list.name===''}
                <div class="col is-vertical-align">
                <SelectCohort bind:status={status}/>
                </div>
                {:else}
                <div class="col-8 is-vertical-align">
                    <h4>{$cohorts.overview.list.name}&nbsp;({$cohorts.overview.years.list[$cohorts.overview.years.index].yr} {$cohorts.overview.years.list[$cohorts.overview.years.index].lv})</h4>
                </div>
                <div class="col-4 is-vertical-align">
                    <button on:click={()=>status.update=true} class="button outline">Clear</button>
                </div>
                {/if}
            </div>
           
        </div>
        <div class="col-3 is-vertical-align">
            <div class="tabs">
                <a href={'#'} class={status.view==='grade' ? 'active' :''} on:click={()=>status.view='grade'}>Grade</a>
                <a href={'#'} class={status.view==='percentage' ? 'active' :''} on:click={()=>status.view='percentage'}>&nbsp;%&nbsp;</a>
            </div>
        </div>
        <div class="col-3 is-vertical-align">
            <button class="button dark" on:click={()=>status.list=true}>My Lists</button>
            <button on:click={()=>status.download=true} class="button icon-only outline">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </button>
        </div>
    </div>
   

 
    <div class="responsive">
        <table>
            <thead>
                <tr>
                    <td>
                        <a href='/overview/manage' class="fixed-width button dark">Manage</a>
                       
                    </td>
                    <td> 
                       
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    {#each status.cols as col,colIndex}
                        <td> <AssessmentTitle title={col.title} subtitle={col.date}/></td>
                    {/each}

                </tr>
                <tr>
                    <td>
                        <button class="button dark fixed-width" on:click={()=>status.fb=true}>Feedback</button>
                    </td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    {#each status.cols as col,colIndex}
                    
                    <td>
                    {#if colIndex>0}    
                    <a href={'#'} on:click={()=>toggleSort(colIndex)} on:keydown={()=>toggleSort(colIndex)} class="button clear icon-only"> 
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-chevrons-down"><polyline points="7 13 12 18 17 13"></polyline><polyline points="7 6 12 11 17 6"></polyline></svg>
                    </a>
                    {/if}
                    </td>
                    {/each}
                </tr>
                <tr>
                    <td></td>
                    <td>Hse</td>
                    <td>Tut</td>
                    <td><span class="tag">{status.std.A}</span></td>
                    <td><span class="tag">{status.std.B}</span></td>
                    {#each status.cols as col,colIndex}
                    <td>
                        {#if col.export}
                    <a href={'#'} on:click={()=>export2D(colIndex)} on:keydown={()=>export2D(colIndex)} class="button clear icon-only"> 
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </a>
                    {/if}
                </td>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each status.table as row,rowIndex}
                    {#if row.show}
                    <tr>
                       
                        <td class="pupil-name"><button class="button clear primary" on:click={()=>row.pupilShow=true}>{row.pn} {row.sn}</button></td>
                        <td>{row.hse}</td>
                        <td>{row.tg}</td>
                        <td><IntakeBar r={row.overall.A} std={status.std.A}/></td>
                        <td><IntakeBar r={row.overall.B} std={status.std.B}/></td>
                        {#each row.cols as col,colIndex}
                            <td>
                                {#if status.view==='grade'}
                                <Cell color={status.rag} residual={col.r}>{col.gd}</Cell>
                                {:else}
                                    <Cell color={false} residual={col.r}>{col.pc===null ? '' : Math.round(col.pc)}</Cell>
                                {/if}
                            
                            </td>

                        {/each}

                    </tr>
                    {#if row.pupilShow}
                    <Modal bind:open={row.pupilShow}>
                        <!--
                        <div class="row">
                            <div class="col">
                                <h4>{row.pn} {row.sn} ({row.hse})</h4>
                              
                            </div>
                           
                        </div>
                        <hr/>
                        -->
                        <Pupil pupil={{context:'overview',user:status.user,pid:row.pid}}/>
                      
                        <div class="row">
                            <div class="col is-right">
                                <button class="button outline" on:click={()=>row.pupilShow=false}>Close</button>
                            </div>
                        </div>
                        
                    </Modal>
                    {/if}
                    {/if}
                {/each}
            </tbody>
        </table>

    </div>

    {/if} <!--/main display-->
    
    <style>

.responsive {
        overflow-x:auto;
    }

    td {
        padding:0.2rem;
    }

/*
    th {
        border-bottom: 1px solid gray;
        padding:0.2rem;
    }
*/
   
    .pupil-name {
        min-width:15rem;
        max-width:15rem;
        overflow:hidden;
        white-space:nowrap;
    }

    .fixed-width {
        width:15rem;
    }


    </style>
    