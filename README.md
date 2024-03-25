# Setup

- npm create svelte@latest halite
- npm install --save chota
- +layout.svelte ``` import 'chota/dist/chota.css'; ```
- npm install --save @sveltejs/adapter-vercel
- svelte.config.js ``` import adapter from '@sveltejs/adapter-vercel'; ```

```
git init
git add .
git commit -m "a1"
git branch -M main
git remote add origin https://github.com/agheadley/halite.git
git push -u origin main
```


# Data Safety
need checks - e.g. no data store null?

# pupil keys
```
lv
yr
id 
pid 
sn 
pn 
hse 
tg 
gnd 
overall {A:0,B:0} 
test
sen:{iep:false,gt:false,eal:false} 
base:[{type:'',A:0,B:0}] 
pre:[{sc:'',ss:'',A:0,B:0}]
conduct:[{reward:true,id:0,dl:'',dt:0,sc:'',ss:''}]
```
# group keys
```
lv
yr
sc
ss
sl
g
teacher:[{tid:'',id:'',sn:pn:''}]
pupil:[12345,12346]
```

# assessment keys
```
lv
yr
an
ln
dl 
ds
dt
sc
ss
sl
tag:{open,grade,overview,pupil,internal,archive}
gd:[{gd:'',pc:0,scr:0,active:true}]
t:[{t:0,w:0,n:''}]
```
# results
```
aoid (assessment oid)
pid
t:[0,0,0]
gd
pc
scr
fb
```

# outcome
```
yr
lv
sc
sl
ss
sr
g
pid
gd
res:{A:0,B:0}   (null if not available)
pre:{A:'',B:''}
tag:{total:true,kpi:true,va:true}
log:''
```

# contacts
```
email
id
```
# config
```
{
    admin:[{tid:''}],
    update:{groups:false,pupils:false} // grab group info, pupil info (conduct)
    rollover:{month:0} //  finding current form
    year:[{lv:'',fm:7,nc:13,x:0}], // finding current form from lv and current date
    rag:{red:-1,green:0},
    std:[{lv:'',A:'',B:''}]
    grade:[{sc:'',gd:'',scr:0,pc:0,pre:0}],
    conduct:[{id:0,name:''}]
    subject:[{lv:'',sc:'',ss:'',tid:''}]
    kpi:[{lv:'',section:'',KPI:'',sc:'',gd:'',sort:0}],
    regression:[{lv:'',sc:'',ss:'',regressionYear:0,gradient:0,intercept:0,std:''}],
    tips:[''], // startup tips
    parent:[12345,12346]    // parent view checks

}
```