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

- npm install --save @auth/core
- entra/microsoft.com
- [@auth/core](https://stackoverflow.com/questions/75063006/sveltekit-hooks-and-msal-js-using-azure-ad-b2c-results-in-non-browser-environm)

- npm install --save @auth/sveltekit



# Data Safety

need checks - e.g. no data store null?

- falsy : undefined null NaN false 0 ""
- truthy : true 1 "xyz"

- if(value) to check truthy

- nullish : null undefined
- not-nullish : false 0 "" NaN true 1 "xyz"

- [checking variables](https://stackoverflow.com/questions/5515310/is-there-a-standard-function-to-check-for-null-undefined-or-blank-variables-in)

```
function isEmpty(value){
  return (value == null || value.length === 0);
}

returns true for undefined (as undefined==null), null, [], ""

```

# Startup

- grab asssessments and all pupil (add intake) , groups , config into memory

# Overview

- find average grades up to set dates (cumulative) or at set points e.g. TIG, IntEx
- e.g. for MS 2025 Point1 up to 15/11/23, Point2 15/12/23, Point3 IntEx.
- assessments in store > filter by dt, map oid > filter pupil results if asssessments oid includes the result
- grade graphs for each subject with small chances graphs
- click on subject to go into detail and breakdown for each pupil


# Assessments

- can't set same ss/sc on same day ! Thus when IntExam created for all, not other asssesment is created.

# Admin

- overview page to show active pages etc.

# pupil store, created at startup from all groups, intake
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
conduct:[{reward:true,id:0,dl:'',dt:0,sc:'',ss:''}]
base:[{type:'',A:0,B:0}] 
pre:[{sc:'',ss:'',A:0,B:0}]
```

# Key Collections

# conduct 
```
lv
yr
pid
sn
pn
conduct:[{reward:true,id:0,dl:'',dt:0,sc:'',ss:''}]
```

# intake keys
```
lv
yr
id
pid
sn
pn
test
base:[{type:'',A:0,B:0}] 
pre:[{sc:'',ss:'',A:0,B:0}]
```
# group keys
```
lv
yr
sc
ss
sl
g
log
teacher:[{tid:'',id:'',sn:'',pn:'',sal:''}]
pupil:[{id:'',pid:12345,sn:'',pn:'',tg:'',hse:'',gnd:''}]
```

# assessment keys
```
lv
yr
n
dl 
ds
dt
sc
ss
sl
tag:{open,grade,overview,pupil,archive}
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
sn
pn
gnd
hse
gd
res:{A:0,B:0}   (0, but tag:va true to consider!!!!)
pre:{A:'',B:''}
tag:{total:true,kpi:true,va:true}
sen:{iep:false,gt:false,eal:false} 
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
    update:{groups:false,conduct:false,contacts:false}, 
    rollover:{month:0}, //  finding current form
    year:[{lv:'',fm:7,nc:13,x:0}], // finding current form from lv and current date
    rag:{red:-1,green:0},
    std:[{lv:'',A:'',B:''}],
    grade:[{sc:'',gd:'',scr:0,pc:0,pre:0}],
    conduct:[{id:0,name:'',reward:false}],
    subject:[{lv:'',sc:'',ss:'',tid:''}],
    kpi:[{lv:'',section:'',KPI:'',sc:'',gd:'',sort:0}],
    regression:[{lv:'',sc:'',ss:'',regressionYear:0,gradient:0,intercept:0,std:''}],
    tips:[''] // startup tips
   
}
```