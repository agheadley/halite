<script>
import {cycles,assessments,groups,config,pupils,alert} from '$lib/store';
import { onMount } from 'svelte';
import * as html from '$lib/html.js';
import * as util from '$lib/util.js';
import Cell from '$lib/_Cell.svelte';
import AssessmentTitle from '$lib/_AssessmentTitle.svelte';


/** @type {any}*/
export let pupil;

/** @type {{cIndex:number,view:{context:'overview'|'parent'|'pupil',chance:boolean,fb:boolean,rag:boolean,n:boolean},report:any}}*/
let data= {
    cIndex:0,
    view:{context:'overview',chance:true,fb:true,rag:true,n:true},
    report:{
        cycle:{tt:'',ts:'',y:0,txt:''},
        pupil:{id:0,sn:'',pn:'',pid:0,tg:'',hse:'',fm:null},
        A:[],
        E:[],
        P:[]
    }
};






onMount(async () => {
    /** @type {any}*/
    let cycs=$cycles.filter((el)=>el.publish===true).sort((/** @type {{ index: number; }} */ a,/** @type {{ index: number; }} */ b)=>b.index-a.index);
    data.cIndex = cycs[0]? cycs[0].index : null; 
    

    let f=$config.view.find((/** @type {{ context: string; }} */ el)=>el.context==='overview');
    data.view={context:'overview',chance:f?f.chance:false,fb:f?f.fb:false,rag:f?f.rag:false,n:f?f.n:false};


    //data.report=await getReport();
});


</script>


<div class="row">
    <div class="col is-vertical-align">
        <h4>{pupil.pn} {pupil.sn}</h4>
    </div>
    <div class="col is-vertical-align">
        {pupil.fm!==null ? 'F'+pupil.fm : ''} {pupil.hse}
    </div>
</div>
<hr/>


<p>{JSON.stringify(data.report)}</p>

<style>

.report-information-left {
    display:flex;
    flex-direction:row;
    justify-content:start;
    width:100%;
    padding-bottom:0.25rem;
    padding-top:0.25rem;  
}

.report-information-right {
    display:flex;
    flex-direction:row;
    justify-content:end;
    width:100%;
    padding-bottom:0.25rem;
    padding-top:0.25rem;  
}
.statement-txt {
    background: white;
    padding:0.2rem;
    border-radius:0.5rem;
    
}

.report-txt {
    background: rgba(51,51,51,0.1);
    padding:0.2rem;
    border-radius:0.5rem;
    
}

.report-information {
    display:flex;
    flex-direction:row;
    justify-content:space-between;
    width:100%;
    padding-bottom:0.25rem;
    padding-top:0.25rem;  
}


.bold {font-weight:600;}

.small {font-size:1.2rem;}

</style>

