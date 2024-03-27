import { writable } from 'svelte/store';



export let alert = writable({msg:"",type:'success',ms:3000});

export let location=writable('');

export let config=writable({
    update:{contacts:false,groups:false,conduct:false}
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
        pre:[{sc:'',ss:'',A:0,B:0}],
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
