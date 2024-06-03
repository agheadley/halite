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
    overview:[
        {lv:"",yr:0,exam:false,from:"0000-00-00",to:"0000-00-00",n:"",dl:"",dt:0}
    ],
    cycle:[
        {
        active:false,
        index:0,
        term:"Summer",
        subterm:"2nd",
        year:2024,
        header:{active:false,txt:''},
        A:{active:true,length:{min:180,max:600},effort:{class:true,prep:true}},
        E:{active:true,length:{min:200,max:600},effort:{class:false,prep:false}},
        P:{active:true,length:{min:180,max:600},effort:{class:false,prep:false}}
            
        }
    ]

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
        overall:{A:0,B:0},
        base:[{type:'',A:0,B:0}],
        groups:[{sc:'',ss:'',sl:'',pre:{A:0,B:0}}],
        conduct:[{dl:'',dt:0,past7:false,ss:'',sc:'',id:'',reward:false}]
    }
]);

export let groups=writable([
    {
        _id:'',
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
