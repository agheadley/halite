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

# Backups - mongo tools required ?

# Startup - /+page.svelte

- checks for new groups, conduct and contacts (depends on config.update)

- $pupils (with conduct, pre, base, overall and tg, hse etc)
- $groups
- $config


- F1,F2 now as GCSE LS ? O 9-8,VG 6-7,G 4-5 ,A 1-3 ,U

- change $config subject to pull groups into sc L, lv LS
- change $config.years to set to LS (relate yr to GCSE exam)



# mis 

- teachers table populated for reports!

# Reports


- Clickable pupils to Detail.svelte modal (created on fly per pupil) - in Modal
- Type for Detail.svelte e.h. hm/ttutor editable (others view only). 
- When edited pass txt back, reactive change to populate data.reports

- Add txt to cycle ! Sorry central message can be formed!. Use <PRE> !

- PDFs !
- management tools for changes.



# admin/Overview

- tag.parent updates to assessments

# admin/Assessments

- create assesments tag.exam (IntEx), tag.grade (TIG+tag.exam=true), tag.pupil (AG + tag.exam=true)

# admin/Config

- grade editing
- add sc=L (LS) grades
- add grades for sc=X (EAL,LSup,ToK,CAS,EE)

# Assessments

- need to add archive button, list of assessments to include archive data so you can downloads
- add Pupil link - same file as for pupils, parents, but they have no RAGs etc



# _Pupil.svelte

- need to display reports past and present too!
- export let open - closes modal - but not shown if user type pupil - as single page - so no modal used for display !
- need to check this for parent, pupil and teachers !!!!



# Parent - to do !



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
base:[{type:'',A:0,B:0}] 
pre:[{sc:'',ss:'',A:0,B:0}]
```

# Key Collections


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
tag:{open,grade,overview,pupil,parent,exam,archive,pupiledit}  // editable, grade only, overview viewable, pupil viewable,parent viewable,exam for all year group, archive,pupiledit
grade:[{gd:'',pc:0,scr:0,active:true}]
log:''
total:[{t:0,w:0,n:''}]

```

# results 
```
pid
aoid (assessment object id)
lv
yr
sc
ss
n
dl
sn
pn
g
t:[0,0,0]
gd
pc
scr
fb
```

# exams
```
yr
lv
sc
sl
ss
sr
g
id
pid
sn
pn
gnd
hse
gd
res:{A:0,B:0}
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
    subject:[{lv:'',sc:'',ss:'',tid:''}],
    kpi:[{lv:'',section:'',KPI:'',sc:'',gd:'',sort:0}],
    regression:[{lv:'',sc:'',ss:'',regressionYear:0,gradient:0,intercept:0,std:''}],
    tips:[''] // startup tips
   
}
```

# lists
```
name
type 'overview'|'report' (report can have lv:'',yr:0 - as TCRs may need all years)
lv
yr
user
pid:[]
dl
dt

```