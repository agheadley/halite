/**
 * 
 * @param {number} delay 
 * @returns 
 */
export let wait = (delay) => new Promise((resolve) => setTimeout(resolve, delay));



/**
 * @returns {string}
 */
export let getDate=() =>{
  let x = new Date();

  let y = x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
  return `${y}`;        
};

/**
 * 
 * @param {any} results 
 * @param {{tid:string}[]} teachers
 * @param {string} name 
 */
export let getAssessmentColumns=(results,teachers,name)=>{
  let cols=[];
  for(let item of results) {
    let isEdit=teachers.find(el=>el.tid===name) && item.isOpen ? true:false;
    let f=cols.find(el=>el.dt===item.dt && el.an===item.an);
    if(!f) cols.push({_id:item._id?item._id:'',an:item.an,ln:item.ln,ds:item.ds,dl:item.dl,dt:item.dt,isDept:item.isDept,isPupil:item.isPupil,isView:item.isView,isOpen:item.isOpen,isEdit:isEdit,gd:'X'});
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
     * @param {any} grades
     * @param {string} base
     * @param {string} grade
    */
    export let findResidual=(grades,base,grade)=>{
      let s1=grades.findIndex((/** @type {{ gd: string; }} */ el)=>el.gd===base);
      let s2=grades.findIndex((/** @type {{ gd: string; }} */ el)=>el.gd===grade);  
      return (s1===-1 || s2===-1) ? 0 : (s1-s2);
      
}