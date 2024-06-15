
/** @type {{view:{context:string,rag:boolean,chance:boolean,fb:boolean},rag:{red:number,green:number}}} */
let cfg = {
    view:{context:'',rag:false,chance:false,fb:false},
    rag:{red:-1,green:1}
};

export let setCfg=(/** @type {{ context: string; rag: boolean; chance: boolean; fb: boolean; }} */ view,/** @type {{ red: number; green: number; }} */ rag)=>{
    cfg.view=view,
    cfg.rag=rag;
};


/**
 * @typedef {{
 * cycle:{tt:string,ts:string,y:number,txt:string},
 * pupil:{sn:string,pn:string,pid:number,hse:string,tg:string,fm:number},
 * A:{
 * title:string,
 * chance:{A:{std:string,grade:{pre:number,gd:string}[],pre:number},B:{std:string,grade:{pre:number,gd:string}[],pre:number}},
 * col:{ds:string,txt:string,gd:string,r:number}[],statement:string|null,
 * report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}[],
 * E:{title:string,report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}[],
 * P:{title:string,report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}[]}} Report
 * @param {Report[]} reports 
 * @returns {string}
 */
export let generate=(reports)=>{
    console.log(reports);
    let txt='';

    for(let report of reports) {
        let title=getTitle(report.cycle,report.pupil);
        txt+=`<section style="break-after:page;">${title}`;
        for(let subject of report.A) {
            txt+=getSubject(subject);
        };
        
        for(let item of report.E) {
            txt+=getItem(item);
        };
        if(report.E[0]) txt+=`<hr/>`;

        for(let item of report.P) {
            txt+=getItem(item);
        };
        

        txt+=`</section>`;
    }


    return start+txt+end;
};

/**
 * 
 * @param {{ds:string,txt:string,gd:string,r:number}[]} arr
 * @returns {string}
 */
let getGrade=(arr)=>{

    // testing
    cfg.view.rag=true;

    let maxGrades=10;
    let min=0.1;
    let max=0.9;
    
    let r={r:178,g:34,b:34,p:0.3};
    let g={r:34,g:139,b:34,p:0.3};
    //style={`background:rgba(${r.r},${r.g},${r.b},${p})

	let tab='<td>GRADES</td>';
    for(let item of arr) {
        if(cfg.view.rag) {
            let p=min+(max-min)*Math.abs(item.r)/maxGrades;

            let sty='';
            if(item.r<cfg.rag.red) sty=`background:rgba(${r.r},${r.g},${r.b},${p})`;
            else if(item.r>=cfg.rag.green) sty=`background:rgba(${g.r},${g.g},${g.b},${p})`;

                tab+=`<td><div><span class="small">${item.ds}</span></div><div class="report-cell" style="${sty}">${item.gd}</div></td>`;
           
        } else {
            tab+=`<td><div><span class="small">${item.ds}</span></div><div class="report-cell">${item.gd}</div></td>`;
        }
    }
	let res=`<table><tbody><tr>${tab}</tr></tbody></table>`;
	return res;

	
};

/**
 * 
 * @param {{title:string,report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}} report 
 * @returns {string}
 */
let getItem=(report)=>{
    let txt=``;
    txt+=`<section style="break-inside:avoid;">`;
	
    txt+=`<div class="row"><div class="col">`;

    txt+=`<div class="report-information">
        <div><span class="bold">${report.title}<span></div>
        <div></div>
    </div>`;
	
    for(let item of report.report) {
		if(item.txt!==null && item.txt!=='') {
				txt+=`<div class="report-txt">${item.txt}</div>`;
		}
		txt+=`<div class="report-information"><div>${item.sal}</div><div></div></div>`;
	}
	txt+='</div></div>';
	txt+=`</section>`;
	
    return txt;
};

/**
 * 
 * @param {any} subject
 * @returns {string}
 */
let getSubject=(subject)=>{
    console.log(subject);
    let txt=``;
    txt+=`<section style="break-inside:avoid;">`;
	
    txt+=`<div class="row"><div class="col">`;

    txt+=`<div class="report-information">
        <div><span class="bold">${subject.title}<span></div>
        <div>${getGrade(subject.col)}</div>
    </div>`;
	
    txt+=`<div class="statement-txt small">${subject.statement}</div>`;
	for(let item of subject.report) {
		if(item.txt!==null && item.txt!=='') {
				txt+=`<div class="report-txt">${item.txt}</div>`;
		}
		txt+=`<div class="report-information"><div>${item.sal}</div><div>(EFFORT) CLASS ${item.ec} PREP ${item.ep}</div></div>`;
	}
	txt+='</div></div><hr/>';
	txt+=`</section>`;
		

    return txt;
};

/**
 * 
 * @param {{tt:string,ts:string,y:number,txt:string}} cycle 
 * @param {{sn:string,pn:string,pid:number,hse:string,tg:string,fm:number}} pupil
 * @returns {string}
 */
let getTitle=(cycle,pupil)=>{

    let image=`[IMAGE]`;
    let title=`<div><h4>${pupil.pn} ${pupil.sn} (Form ${pupil.fm})</h4></div><div><h4>${cycle.tt} ${cycle.ts} ${cycle.y}</h4></div>`;
    let txt=`<section style="break-inside:avoid;"><div class="row"><div class="col">${image}</div><div class="col">${title}</div></div></section>`;
    return txt;
};

export let start =`
<!DOCTYPE html>
<html lang='en'>
<head>
<title>Halite</title>
<meta charset='utf-8'>
<link rel="stylesheet" href="https://unpkg.com/chota@latest">
<style>
.report-information {
    display:flex;
    flex-direction:row;
    justify-content:space-between;
    width:100%;
    padding-bottom:0.25rem;
    padding-top:0.25rem;  
}

.statement-txt {
    background: rgba(51,51,51,0.00);
    padding:0.2rem;
    border-radius:0.5rem;
    
}

.report-txt {
    background: rgba(51,51,51,0.1);
    padding:0.2rem;
    border-radius:0.5rem;
    
}



.report-cell {
width:3rem;
text-align: center;
overflow:hidden;
padding:0.1rem;
font-weight:600;

}

.bold {
    font-weight:600;

}

.small {
    font-size:1.2rem;
}
</style>
</head>
<body>
<div class="container">
`;


export let end = `
</div>
</body>
</html>
`;
