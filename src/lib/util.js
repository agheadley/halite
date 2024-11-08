/**
     * 
     * @param {number} n
     * @returns {boolean}
     */
export let isNumeric=(n)=>{
  return !isNaN(parseFloat(String(n))) && isFinite(n);
}



/**
 * 
 * @param {number} delay 
 * @returns 
 */
export let wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

/**
 * @param {any} value
 */
export let isEmpty=(value)=>{
    return (value == null || value.length === 0);
  }
  
/**
 * 
 * @param {string} yyyymmdd 'yyyy-mm-dd' 
 * @param {number} rollover
 * @returns {string}
 */
export let getAcademicYear=(yyyymmdd,rollover)=>{
  let x = new Date(yyyymmdd);
  let finalYear=x.getFullYear();
  let month=x.getMonth()+1;
  console.log(month,finalYear);

  if(month>rollover) finalYear+=1;
  

  return `${finalYear-1}/${finalYear}`;
};

/**
 * @returns {string}
 */
export let getDate=() =>{
  let x = new Date();

  let y = x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
  return `${y}`;        
};

/**
 * @returns {string}
 */
export let getDateTime=() =>{
  let x = new Date();
  let y = x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');


  return y+" "+x.toTimeString().substring(0,5);
        
};

/**
 * 
 * @param {any} assessments
 * @param {string[]} teachers
 * @param {string} user 
 */
export let getAssessmentCols=(assessments,teachers,user)=>{
  let cols=[];
  //console.log('CHECKING USER',user);
  for(let item of assessments) {
    let isEdit=teachers.find(el=>el===user) && item.tag.open ? true:false;
    //console.log(item.n,teachers,item.tag.open,isEdit);
    cols.push({_id:item._id,n:item.n,ds:item.ds,dl:item.dl,dt:item.dt,tag:{edit:isEdit,pupiledit:item.tag.pupiledit,open:item.tag.open,grade:item.tag.grade,overview:item.tag.overview,pupil:item.tag.pupil,parent:item.tag.parent,exam:item.tag.exam,archive:item.tag.archive},gd:'X'});
  }
  cols=cols.sort((a,b)=>a.dt-b.dt);
  return cols;

};


/**
 * 
 * @param {string} course 
 * @param {number} score 
 * @param {any[]} grades 
 * @returns {string}
 */
export let getClosestGrade=(score,course,grades)=>{
  grades=grades.filter(el=>el.sc===course).sort((a, b) => b.scr-a.scr);
  let grade="U";
  
  //console.log(grades,score);
  let difference=100;
  for(let item of grades) {
      grade=Math.abs(item.scr-score)<difference ? item.gd : grade;
      difference=Math.abs(item.scr-score)<difference ? Math.abs(item.scr-score) : difference;
  }
  return grade;
};

/**
 * 
 * @param {string} course 
 * @param {number} pre
 * @param {any[]} grades 
 * @returns {{gd:string,scr:number}}
 */
export let getClosestPred=(pre,course,grades)=>{
  grades=grades.filter(el=>el.sc===course).sort((a, b) => b.pre-a.pre);
  let grade="U";
  
  //console.log(grades,score);
  let difference=grades[0] ? grades[0].pre : 0;
  for(let item of grades) {
      grade=Math.abs(item.pre-pre)<difference ? item.gd : grade;
      difference=Math.abs(item.pre-pre)<difference ? Math.abs(item.pre-pre) : difference;
  }
  let f=grades.find(el=>el.gd===grade);
  return {gd:grade,scr:f?f.scr:0};
};

    /** 
     * @param {any} grades
     * @param {string} base
     * @param {string} grade
    */
    export let findResidual=(grades,base,grade)=>{
      let s1=grades.findIndex((/** @type {{ gd: string; }} */ el)=>el.gd===base);
      let s2=grades.findIndex((/** @type {{ gd: string; }} */ el)=>el.gd===grade);  
      return (s1===-1 || s2===-1) ? 0 : (s1-s2);
      
}



/**
 * 
 * @param {string} sc 
 * @param {string} ss
 * @param {{g:string,sl:string,sc:string,ss:string,pre:{A:number,B:number}}[]} groups 
 * @param {{sc:string,gd:string,pc:number,scr:number,prep:number}[]} grades
 */
export let getTargetGrade=(sc,ss,groups,grades)=>{
  let out={gd:'X',scr:0};
  let f=groups.find(el=>el.sc===sc && el.ss===ss);
  console.log(ss,sc,groups,grades,f);
  let pre =0;
  if(f) {
    pre = f.pre.A>0 ? f.pre.A : (f.pre.B > 0 ? f.pre.B : 0);
    out=getClosestPred(pre,sc,grades);
    if(pre===0) out.gd='X';
  } 

  if(!f || pre===0) {
    let pres=groups.filter(el=>el.sc===sc)
      .map(el=>el.pre.A>0 ? el.pre.A : (el.pre.B > 0 ? el.pre.B : 0))
      .filter(el=>el>0);
    pre=pres?.length>0?pres.reduce((/** @type {any} */ a,/** @type {any} */ v)=>a+v)/pres.length:0;
    console.log('MISSING PRED, OTHERS...',pres,'PRE',pre);
    out=getClosestPred(pre,sc,grades);
    if(pre===0) out.gd='X';
  }

  return out;
};