import { writable } from 'svelte/store';



export let alert = writable({msg:"",type:'',ms:3000});

export let location=writable('');

/** @type {any} */
export let config=writable({
    admin:[{tid:''}],
    rollover:{month:8},
    update:{contacts:false,groups:false,conduct:false},
    year:[{lv:'',fm:7,nc:13,x:0}],
    rag:{red:-1,green:1},
    std:{US:{A:'GCSE',B:'ALIS'},MS:{A:'NAT',B:'IND'},L1:{A:'',B:''}},
    grade:[{sc:'',gd:'',scr:0,pc:0,pre:0}],
    conduct:[{id:0,name:'',reward:false}],
    subject:[{lv:'',sc:'',ss:'',tid:''}],
    kpi:[{lv:'',section:'',KPI:'',sc:'',gd:'',sort:0}],
    regression:[{lv:'',sc:'',ss:'',regressionYear:0,gradient:0,intercept:0,std:''}],
    tips:[''],
    view:[
        {context:'parent',rag:false,chance:false,fb:false},
        {context:'pupil',rag:false,chance:true,fb:false},
        {context:'assessments',rag:true,chance:true,fb:true},
        {context:'overview',rag:true,chance:true,fb:true}
        
    ],
    report:{
        tt:['Winter',"Spring","Summer"],
        ts:['1st','2nd'],
        e:{list:['4','3','2','1','N/A'],default:'3'},
        hm:[{hse:'',tid:'',sal:''}],
        hoy:[],
        enrichment:[{sl:'',sc:'E',ss:'',g:''}]
    }


});





export let pupils=writable([
    {
        pid:0,
        pn:'',
        sn:'',
        tg:'',
        yr:0,
        lv:'',
        hse:'',
        gnd:'',
        fm:0,
        overall:{A:0,B:0},
        base:[{type:'',A:0,B:0}],
        groups:[{sc:'',ss:'',sl:'',pre:{A:0,B:0}}],
        conduct:[{dl:'',dt:0,past7:false,ss:'',sc:'',id:'',reward:false}]
    }
]);

export let groups=writable([
    {
        _id:'',
        fm:0,
        g:'',
        yr:0,
        lv:'',
        sc:'',
        ss:'',
        sl:'',
        log:'',
        pupil:[{sn:'',pn:'',pid:0,id:'',gnd:'',hse:'',tg:''}],
        teacher:[{id:'',pn:'',sn:'',sal:'',tid:''}]
    }
]);

export let teachers=writable([{id:'',pn:'',sn:'',sal:'',tid:''}]);

/** @type {any} */
export let cohorts=writable({
    assessments:{
        years:{list:[{yr:0,lv:'',fm:0}],index:0},
        subjects:{list:[{yr:0,lv:'',ss:'',sc:'',sl:''}],index:0},
        edit:{_id:'',edit:false,g:'',recalculate:false}
    },
    overview:{
        years:{list:[{yr:0,lv:'',fm:0}],index:0},
        houses:{list:[{hse:'',lv:'',yr:0}],index:0,all:false},
        list:{name:'',pid:[]}
    },
    exams:{
        years:{list:[{yr:0,lv:''}],index:0}
    },
    archive:{
        years:{list:[{yr:0,lv:''}],index:0}
    }

});
