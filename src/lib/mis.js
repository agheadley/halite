import * as util from '$lib/util';
/**
 * 
 * @param {any} mis 
 * @param {any} cfg
 * @param {any} groups
 * @param {any} current

*/
export let getConductData=(mis,cfg,groups,current)=>{
    

    let today=util.getDate();
    console.log(today);
   
    let x=groups.map((/** @type {{ pupil: any[]; ss: any; sc: any; lv: any; yr: any; }} */ gp)=>gp.pupil.map(pupil=>({ss:gp.ss,sc:gp.sc,lv:gp.lv,yr:gp.yr,pid:pupil.pid,id:pupil.id,sn:pupil.sn,pn:pupil.pn})));
    let pupils=x.flat();
    x=groups.map((/** @type {{ teacher: any[]; ss: any; sc: any; lv: any; yr: any; }} */ gp)=>gp.teacher.map(teacher=>({ss:gp.ss,sc:gp.sc,lv:gp.lv,yr:gp.yr,tid:teacher.tid,id:teacher.id})));
    let teachers=x.flat();

    //console.log(pupils[0]);
    //console.log(teachers[0]);

    //console.log(current[0]);
    //console.log(current[1]);
    if(mis.iSAMS.RewardsAndConduct.Records.Record) {
    for(let item of mis.iSAMS.RewardsAndConduct.Records.Record){
        //console.log('************************');
        let p=pupils.filter((/** @type {{ id: any; }} */ el)=>el.id===item.SchoolId);
        let r=cfg.conduct.find((/** @type {{ id: any; }} */ el)=>el.id===item['@CategoryId']);

        let c=current.find((/** @type {{ id: any; }} */ el)=>el.id===item.SchoolId);

        /* only add record for found pupil and RS type */
        if(p[0] && r) {
            //console.log('Found Pupil',p.length,p[0].sn,r.id,p[0].id);
            let found={id:'',ss:'',sc:''};
            for(let gp of p) {
                let t=teachers.find((/** @type {{ id: any; sc: any; ss: any; }} */ el)=>el.id===item.Teacher && el.sc===gp.sc && el.ss===gp.ss);
                found=t?{id:t.id,ss:gp.ss,sc:gp.sc}:found;
                //console.log(found);
            }

            let x=new Date(item.Date);
            let dl = x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
            let dt=x.getTime();

            let record={id:r.id,isReward:r.isReward,dl:dl,dt:dt,ss:found.ss,sc:found.sc};

            if(c) {
                /* add to existing, if not already there. */
                let f=c.conduct.find((/** @type {{ dl: string; id: any; sc: string; ss: string; }} */ el)=>el.dl===record.dl && record.id===el.id && el.sc===record.sc && el.ss===record.ss );
                if(!f)  c.conduct.push({...record});
                
              
                let n=current.findIndex((/** @type {{ id: any; }} */ el)=>el.id===item.SchoolId);
                //console.log('existing index',n,'current.length',current.length);
                current.splice(n,1);
                //console.log('after splice','current.length',current.length);
                c['log']=today;
                current.push(c);
                //console.log(`Added to existing ${p[0].pid} ${p[0].id} ${p[0].sn}}`);
            } else {
                /* create new */
                let document={log:today,sn:p[0].sn,pn:p[0].pn,pid:p[0].pid,id:p[0].id,lv:p[0].lv,yr:p[0].yr,conduct:[record]};
                current.push(document);

                //console.log(`Added new ${p[0].pid} ${p[0].id} ${p[0].sn}}`);
            }
        }
       


    
    }
    }

    //console.log(`was ${l} , now ${current.length}`);
    return current;
};



/**
 * 
 * @param {any} mis 
 */
export let getContactData=(mis)=>{

    let x = new Date();
    let created = x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');


    let out=[];

    //let currentPupils=mis.iSAMS.PupilManager.CurrentPupils.Pupil;
    let contacts=mis.iSAMS.PupilManager.Contacts.Contact;
    for(let guardian of contacts) {
        let guardianPupils=[];
        if(Array.isArray(guardian.Pupils.Pupil)) {
            for(let item of guardian.Pupils.Pupil) guardianPupils.push({status:item.Status,id:item.SchoolId['#text']});
        } else guardianPupils.push({status:guardian.Pupils.Pupil.Status,id:guardian.Pupils.Pupil.SchoolId['#text']});
        guardianPupils=guardianPupils.filter((/** @type {{ status: string; }} */ el)=>el.status==='Current');
        for(let pupil of guardianPupils) {
           
            let schoolCode=pupil.id;
            let email=guardian.EmailAddress;
            out.push({id:schoolCode,email:email,log:created});
        }

    }

    return out;

};

export let getBasedata=(/** @type {{ iSAMS: { PupilManager: { CurrentPupils: { Pupil: any; }; }; TeachingManager: { Departments: { Department: any; }; }; HRManager: { CurrentStaff: { StaffMember: any; }; }; }; }} */ mis)=>{
    /** @type {any} */
    let data={pupils:[],subjects:[],staff:[]};
    for(let item of mis.iSAMS.PupilManager.CurrentPupils.Pupil) {
        // @ts-ignore
        data.pupils.push({
            pupil_id:item['@Id'],
            sn:item.Surname,
            pn:item.Preferredname,
            pid:Number(item.SchoolCode),
            id:item.SchoolId,
            gnd:item.Gender,
            hse:item.BoardingHouse,
            tg:item.Form

        });
    }
    
    for(let item of mis.iSAMS.TeachingManager.Departments.Department) {
        if(item.Subjects) {
            if(Array.isArray(item.Subjects.Subject)) {
                // @ts-ignore
                for(let subject of item.Subjects.Subject)  data.subjects.push({sl:subject.Name,ss:subject.Code,subject_id:subject['@Id']});
            // @ts-ignore
            } else data.subjects.push({sl:item.Subjects.Subject.Name,ss:item.Subjects.Subject.Code,subject_id:item.Subjects.Subject['@Id']}); 
        }
    }

    //for(let item of data.subjects) console.log(item);

    for(let item of mis.iSAMS.HRManager.CurrentStaff.StaffMember) {
       // @ts-ignore
       data.staff.push({id:item.UserCode,tid:item.Initials,staff_id:item['@Id'],sn:item.Surname,pn:item.PreferredName,sal:item.Salutation});
    }

   
    return data;
};

/**
 * 
 * @param {any} mis 
 * @param {any} cfg 
 * @returns 
 */
export let getGroupData=(mis,cfg)=>{

    let x = new Date();
    let currentYear=x.getFullYear();
    let month=x.getMonth()+1;
    //let day=x.getDate();
  
    let created = x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');

    if(month>cfg.rollover.month) currentYear+=1;
    console.log(month,currentYear);

    //let data={setTeachers:[],setMembers:[]};
    let basedata=getBasedata(mis);


    let groups=[];

    for(let item of mis.iSAMS.TeachingManager.Sets.Set) {
        /**
         * @type {{ subName: string; subCode: string; id: string; }[]}
         */
        // @ts-ignore
        let subjectInfo=basedata.subjects.filter(el=>el.subject_id===item.SubjectId['#text']);

        

        /** @type {any} */
        let subject = subjectInfo[0] ? subjectInfo[0] : {sl:"",ss:"",id:""};

        //if(item.SetCode.includes('/Sc/')) console.log(item.SetCode,subject,subjectInfo);

        let year=Number(item.YearId['#text']);
        let f=cfg.year.find((/** @type {{ nc: number; }} */ el)=>el.nc===year);
        let level=f?f.lv:'';
        let examYear=f?currentYear+f.x:0;
            
        let subjectData=cfg.subject.find((/** @type {{ ss: any; lv: any; }} */ el)=>el.ss===subject.ss && el.lv===level);
        //if(item.SetCode.includes('/Sc/')) console.log(item.SetCode,subject,subjectInfo,level,subjectData);

        if(subjectData) {

            let teacherArr=[];
            if(item.Teachers) {
                let teacherList=item.Teachers.Teacher;
                if(!Array.isArray(item.Teachers.Teacher)) teacherList=[item.Teachers.Teacher];
                for(let staff of teacherList) {
                    /** @type {any} */
                    let f=basedata.staff.find((/** @type {{ staff_id: any; }} */ el)=>el.staff_id===staff['@StaffId']);
                    if(f) teacherArr.push({tid:f.tid,id:f.id,sn:f.sn,pn:f.pn,sal:f.sal});
                }
            }
            let pupilArr=[];

            let pupilInfo=mis.iSAMS.TeachingManager.SetLists.SetList.filter((/** @type {{ [x: string]: any; }} */ el)=>el['@SetId']===item['@Id']);
            if(pupilInfo?.[0]) {
                for(let pupil of pupilInfo) {
                    let id=pupil.SchoolId['#text'];
                    let pupilDetails=basedata.pupils.find((/** @type {{ id: any; }} */ el)=>el.id===id);
                    if(pupilDetails) {
                        pupilArr.push({id:pupilDetails.id,pid:pupilDetails.pid,sn:pupilDetails.sn,pn:pupilDetails.pn,gnd:pupilDetails.gnd,hse:pupilDetails.hse,tg:pupilDetails.tg});
                    }
                }
            }

            groups.push({yr:examYear,lv:level,sc:subjectData.sc,sl:subject.sl,ss:subject.ss,g:item.SetCode,teacher:teacherArr,pupil:pupilArr,log:created});
        }


      
    }

    //for(let item of groups ) if(item.lv==='MP') console.log(item.yr,item.g);

    return groups;
};



