<script>

    import { onMount } from 'svelte';
    import {config,location,pupils,groups,cohorts} from '$lib/store';
  
    import Modal from '$lib/_Modal.svelte';
    import AssessmentTitle from '$lib/_AssessmentTitle.svelte';
    import Cell from '$lib/_Cell.svelte';
    import Pupil from '$lib/_Pupil.svelte';

    /** @type {any}*/
    export let data;

    /** @type {any}*/
    let status={
       user:'',
       yr:0,
       lv:'',
       assessments:[],
       cols:[],
       rows:[],
       table:[]
    };



  


  

    
    onMount(async () => {
        $location='/overview/manage';
        console.log(`${$location} mounted`);
        status.user=data.user;
        status.yr=$cohorts.overview.years.list[$cohorts.overview.years.index].yr;
        status.lv=$cohorts.overview.years.list[$cohorts.overview.years.index].lv;

         /* get cohort assessments */
        let response = await fetch('/edge/read', {
            method: 'POST',
            body: JSON.stringify({collection:'assessments',filter:{lv:status.lv,yr:status.yr,"tag.archive":false,"tag.overview":true},projection:{}}),
            headers: {'content-type': 'application/json'}
        });

        status.assessments= await response.json();
        console.log(status.assessments);

         /* grab columns / section */
        let sections=$config.overview.filter((/** @type {{ lv: any; yr: any; }} */ el)=>el.lv===status.lv && el.yr===status.yr);
        for(let section of sections) {
            section.ds=section.dl?.length===10 ? section.dl[5]+section.dl[6]+"/" +section.dl[2]+section.dl[3]: '00/00';
            section.dsFrom=section.from?.length===10 ? section.from[5]+section.from[6]+"/" +section.from[2]+section.from[3]: '00/00';
            section.dsTo=section.to?.length===10 ? section.to[5]+section.to[6]+"/" +section.to[2]+section.to[3]: '00/00';
            section.dtFrom=new Date(section.from).getTime();
            section.dtTo=new Date(section.to).getTime();
            section.date=section.exam ? section.ds :  `${section.dsFrom}-${ section.dsTo}`;
            section.title=section.exam ? section.n : 'ASSESSMENTS';
        }

        status.cols=sections;

        status.rows=$cohorts.assessments.subjects.list.filter((/** @type {{ lv: any; yr: any; }} */ el)=>el.lv===status.lv && el.yr===status.yr).sort((/** @type {{ sc: string; sl: string; }} */ a,/** @type {{ sc: any; sl: any; }} */ b)=>a.sc.localeCompare(b.sc) || a.sl.localeCompare(b.sl));


        console.log(status);


        status.table=[];

        for(let row of status.rows) {
            let items=[];
            for(let col of status.cols) {
                 /* find all the results matching the overview column for each pupil */
            let f = col.exam ?
                status.assessments.filter((/** @type {{ sc: any; ss: any; n: any; dl: any; tag: { exam: boolean; }; }} */ el)=>el.sc===row.sc && el.ss===row.ss && el.n===col.n && el.dl===col.dl && el.tag.exam===true) :
                status.assessments.filter((/** @type {{ sc: any; ss: any; dt: number; tag: { exam: boolean; }; }} */ el)=>el.sc===row.sc && el.ss===row.ss && el.dt>=col.dtFrom && el.dt<=col.dtTo && el.tag.exam===false);

                console.log(row.sl,col.title,f.length);

                let item={total:0,open:0,parent:0,pupil:0,overview:0,title:col.title,date:col.date};

                item.open=f.length && f.filter((/** @type {{ tag: { open: any; }; }} */ el)=>el.tag.open)?.length ? f.filter((/** @type {{ tag: { open: any; }; }} */ el)=>el.tag.open).length :0;
                item.parent=f.length && f.filter((/** @type {{ tag: { parent: any; }; }} */ el)=>el.tag.parent)?.length ? f.filter((/** @type {{ tag: { parent: any; }; }} */ el)=>el.tag.parent).length :0;
                item.pupil=f.length && f.filter((/** @type {{ tag: { pupil: any; }; }} */ el)=>el.tag.pupil)?.length ? f.filter((/** @type {{ tag: { pupil: any; }; }} */ el)=>el.tag.pupil).length :0;
                item.overview=f.length && f.filter((/** @type {{ tag: { overview: any; }; }} */ el)=>el.tag.overview)?.length ? f.filter((/** @type {{ tag: { overview: any; }; }} */ el)=>el.tag.overview).length :0;
                item.total=f.length  ? f.length :0;

                items.push(item);

            }

            status.table.push({
                sc:row.sc,
                ss:row.ss,
                sl:row.sl,
                cols:items
            });

      

        }

        console.log(status.table);
    
    });



    </script>
    
    <svelte:head>
        <title>Overview Manage</title>
        <meta name="description" content="Svelte demo app" />
    </svelte:head>

    <div class="row">
        <div class="col">
            <h4>Assessment Visibility {status.lv} {status.yr}</h4>
        </div>
        <div class="col">
            <a href='/overview' class="button outline">Close</a>
        </div>
    </div>
   
    <!--
    <Modal bind:open={status.download}>
        <Export bind:status={status}/>
    </Modal>
    -->

    <div class="responsive">
        <table>
            <thead>
                <tr>
                    <th>Subject</th>
                    <th></th>
                    {#each status.cols as col,colIndex}
                        <th> <AssessmentTitle title={col.title} subtitle={col.date}/></th>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each status.table as row,rowIndex}
                <tr>
                    <td>{row.sl}</td>
                    <td>({row.sc})</td>
                    {#each row.cols as col,colIndex}
                        <td>
                            <div>Par {col.parent}/{col.total}</div>
                            <div>Pup {col.pupil}/{col.total}</div>
                        </td>
                    {/each}
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
   
    
    <style>

.responsive {
        overflow-x:auto;
    }

    td {
        padding:0.2rem;
    }



    </style>
    