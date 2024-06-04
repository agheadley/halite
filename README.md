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


- F1,F2 now as GCSE LS ? Use % 



# Reports

Add txt to cycle ! Sorry central message can be formed!.
Use <PRE> !



Move report create and report cycles to separate components referenced from Report.svelte
Only delete last item of cycle and severe warning! Store cycle text in report record too for safety!
You need term and year from.xycle too!
Calculate and apply academic year to cycles using config.rollover.
Add gnd, hse, tg, form number to reports

Click on set and pull all reports for that set in c teacher 2 etc, add group to reports

How to deal with ToK reports?

 - $config.cycle,  active boolean, sort/order number, term string, subterm string (1st/2nd), calendar year number, max, min lengths for each type of eport.
 - $config.hm - for tid, salulation !
 - $config report order for pastoral - perhaps needed, academic, enrichment can be alphabetical.
 - report table
   - yr, lv, cycle _id, type (Academic/Enrichment/Pastoral), sn, pn, pid, id (isams ID), text, effort{class:, prep}, cycle txt (Summer 1st 2024), tid, sal (teacher salutation)

- every PR has HoD explanation text! Needs to be only text in PR1, Suplement report text in PR2

- some PR1 need full reports in some year groups. We can do this by deleting or adding comments in manager ?
- or add Form commnet / no comment checkbox ?
- use to create/ update reports!






- PDFs !
- management tools for missing reports, changes, generation !



# admin/Overview

- add tag.parent checkbox to allow updates for those assessments to make them visible to parents,
- this means that we can decide not to make TIGs viewable, but make AGs etc

# Overview




# overview /manage

- don't make TIGs live to parents when scaping data for parents!
- instead add tag.parent column to admin/Overview


# Assessments

- need to add archive button, list of assessments to include archive data so you can downloads
- add Pupil link - same file as for pupils, parents, but they have no RAGs etc



# _Pupil.svelte

- export let open - closes modal - but not shown if pupil - as single page - so no modal used for display !
- need to check this for parent, pupil and teachers !!!!
- need to display reports past and present too!


# Parent - to do !

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