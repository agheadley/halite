# Setup

- npm create svelte@latest halite
- npm install
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

- npm install --save @azure/msal-browser





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

- checks for new groups, teachers and contacts (depends on config.update)

- $pupils ( pre, base, overall and tg, hse , teachers)
- $groups
- $config


- F1,F2 now as GCSE LS ? O 9-8,VG 6-7,G 4-5 ,A 1-3 ,U

- change $config subject to pull groups into sc L, lv LS
- change $config.years to set to LS (relate yr to GCSE exam)

# testing 

- $config.test - set pupil to true, add pid as string to test pupil!!!!

# mis 

- teachers table populated for reports!

# Reports


- document documention for break-inside and break-after css for report priting.

-Pupil view from pupil/ , assessments and overview and parent to simply use the same data structure and therefore the same display component. The print view needs the html generation method, the others don't!

- Generate html with assessment name as well as ds only or without - cfg choice ? , offer the option. Build in self assessments too.


- Add txt to cycle ! Sorry central message can be formed!. Use <PRE> !

- PDFs !
- management tools for changes.






# Assessments

- need to add archive button, list of assessments to include archive data so you can downloads
- add Pupil link - same file as for pupils, parents, but they have no RAGs etc



# pupil/ testing

- +layout.js
 // testing
  user.tag.pupil=true;
  user.tag.admin=false;
  user.tag.teacher=false;
  
- pupil/+page.js
// testing
user.name='341311';



# Parent - to do !

- copy /pupil !!!!


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