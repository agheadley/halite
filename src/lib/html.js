
import * as util from '$lib/util';

/** @type {{view:{context:string,rag:boolean,chance:boolean,fb:boolean,n:boolean},rag:{red:number,green:number}}} */
let cfg = {
    view:{context:'',rag:false,chance:false,fb:false,n:true},
    rag:{red:-1,green:1}
};

export let setCfg=(/** @type {{ context: string; rag: boolean; chance: boolean; fb: boolean;n:boolean }} */ view,/** @type {{ red: number; green: number; }} */ rag)=>{
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
 * @param {any} report 
 */
export let generateGroup=(report)=>{
    let txt='<section style="break-inside:avoid;">';
    txt+`<div class="row"><div class="col">`;
    txt+=`<h4>${report.subject.g} ${report.cycle.tt} ${report.cycle.ts} ${report.cycle.y}</h4>`;
    txt+=``;
    txt+=`</div></div>`;
    
    txt+=`</section>`;
    for(let item of report.A) {
         txt+=`<section style="break-inside:avoid;">`;
        txt+=getSubject(item);
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
    //cfg.view.rag=true;

    let maxGrades=10;
    let min=0.1;
    let max=0.9;
    
    let r={r:178,g:34,b:34,p:0.3};
    let g={r:34,g:139,b:34,p:0.3};
    //style={`background:rgba(${r.r},${r.g},${r.b},${p})

	let tab='';
    for(let item of arr) {
        let title='';
        if(cfg.view.n) {
            title=`<div class="assessment-title-p">
                    <div class="assessment-title-c">
                        <div class="bold">${item.txt}</div>
                        <div>${item.ds}</div>
                    </div>
                </div>`;
        } else {
            title=`<span class="small">${item.ds}</span>`;
        }
        if(cfg.view.rag) {
            let p=min+(max-min)*Math.abs(item.r)/maxGrades;

            let sty='';
            if(item.r<cfg.rag.red) sty=`background:rgba(${r.r},${r.g},${r.b},${p})`;
            else if(item.r>=cfg.rag.green) sty=`background:rgba(${g.r},${g.g},${g.b},${p})`;

                tab+=`<td valign="top"><div>${title}</div><div class="report-cell" style="${sty}">${item.gd}</div></td>`;
           
        } else {
            tab+=`<td><div>${title}</div><div class="report-cell">${item.gd}</div></td>`;
        }
    }
	let res=`<table><tbody><tr>${tab}</tr></tbody></table>`;
	return res;

	
};

/**
 * 
 * @param {{grade:{gd:string,pre:number}[],std:string,pre:number}} chance 
 * @returns {string}
 */
export let getChance=(chance)=>{

    
    
    let w=100;
    let startY=15;
    let maxH=50;
    
    


    let txt=``;

    let s=chance.grade[0] ? chance.grade[0].pre/5 : 0;
    let points=chance.grade.map(el=>({gd:el.gd,pre:el.pre,h:0,p:0,residual:0,w:0,x:0,y:0})).sort((a,b)=> a.pre-b.pre);
    let itemW= points[0] ? w/points.length : 0;   
    let datum=util.isNumeric(chance.pre) && chance.pre>0 ? chance.pre : 0;
    if(datum>0) {
        for(let item of points) {
            item['residual']=datum>0 ? Math.abs(item.pre-datum) : 0 ;
            let h=s>0 ? Math.exp(-(item['residual']*item['residual'])/(2*s*s))*1/(2*Math.PI*s) : 0;
            item['p']=h;
        }
        let total=points.map(el=>el['p']).reduce((partialSum, a) => partialSum + a, 0);
        for(let i=0;i<points.length;i++) {
            let item=points[i];
            item['p']=Math.floor(100*item['p']/total);
            item['y']=startY+maxH-item['h'];
            item['x']=i*itemW+itemW/10;
            item['w']=0.8*itemW;
        }
        let max=Math.max(...points.map(el=>el['p']));
        for(let item of points) {
            item['h'] = maxH*item['p']/max;
            item['y']=startY+maxH-item['h'];
        }


    }

    txt+=`<svg width="10rem" height="8rem" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">`;
    txt+=`<g>`;
    for(let p of points) {
        txt+=`<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" fill="rgba(0,128,255,0.5)"></rect>`;
        if(p.p>15) {
            txt+=`<text x="${p.x}" y="${p.y-2}" font-size="10" fill="#333">${p.gd}</text>`;
        }
    }
    txt+=`</g>`;
    txt+=`<svg>`;

    //console.log(points);

    return txt;
        
        

};

/**
 * 
 * @param {{title:string,report:{sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}[]}} report 
 * @returns {string}
 */
export let getItem=(report)=>{
    let txt=``;
    txt+=`<section style="break-inside:avoid;">`;
	
    txt+=`<div class="row"><div class="col">`;

    txt+=`<div class="report-information">
        <div><span style="font-weight:600;" class="bold">${report.title}<span></div>
        <div></div>
    </div>`;
	
    for(let item of report.report) {
		if(item.txt!==null && item.txt!=='') {
				txt+=`<div class="report-txt">${item.txt}</div>`;
		}
		txt+=`<div class="report-information"><div><span>${item.sal}</span></div><div></div></div>`;
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

    txt+=`<div class="report-information-left">
        <div><span class="bold">${subject.title}<span></div>
    </div>`;

    txt+=`<div class="report-information">`;
    txt+=`<div>${getGrade(subject.col)}</div>`;
    
    // testing
    //cfg.view.chance=true;

    if(cfg.view.chance){    
        txt+=`<div>`;
        txt+=`<div class="report-information-left">
            <div><span class="tag">${subject.chance.A.std}</span></div>
            <div>${getChance(subject.chance.A)}</div>
            <div><span class="tag">${subject.chance.B.std}</span></div>
            <div>${getChance(subject.chance.B)}</div>
            </div>`;
        txt+=`</div>`;
    }

    
    txt+=`</div>`;



    
    txt+=`<div class="statement-txt">${subject.statement}</div>`;
	for(let item of subject.report) {
		if(item.txt!==null && item.txt!=='') {
				txt+=`<div class="report-txt">${item.txt}</div>`;
		}
        item.ec = item.ec===null ? '' : `CLASS ${item.ec}`;
        item.ep = item.ep===null ? '' : `PREP ${item.ep}`;
        
		txt+=`<div class="report-information"><div><span>${item.sal}</span></div><div><span class="tag">EFFORT ${item.ec} ${item.ep}</span></div></div>`;
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
    let image=`<img src="data:image/gif;base64,R0lGODlhoAB7APf/APTh4cZdafPe3qgLIOrFysxweakMIsZgaagJHvDV1b5JVe3NzeCprM93gaYEGv78+qQAFrElNqoPJLtBTei+wbQtPacIHtydof/+/uKtsclpcawVKdqZnd6iqvz49tSGjeW2ub1FUc52fd6hpcFRXerFxsNWYffp6dmUmcBNWshlbtmVm/DV2Prx7tKCibAhMua5utaNlPz29L9KWa4cLrk6SbYyQe7R1f/+/NiRlq0YK/ry8OnBxfv08tWKkP78/KkMIMttdfjt6sVcZclmcenCwuzJyuOwssRZZbMoObo9StB8gvjq6vz298ppde7Q0ctteNiTmOOxtNaMkrc1ROi+v64aLOCnrbg5Rt+mqPjs7NF+hNSIjqkNI6oQJOa5vK8eMPLc2+Outd2fpOS0t/nu7NKBjNF+idB6gaoRJu/T0vPf36YGG+vHybYxP9KBhro+TOe8vMRYY/v09fTf39OEifbm5vry8rInN9ubn+GsrrY0Qvnu7vjs7qsSJvz4+LxCT7AiNM97fvLa2vHX2N6jp8JTXvnv8M1ze/bk5vjr7Pfn6bYzQ6YFG+zLzMdhbKIAEb1FVKoPIvfo5vLb3vTf4aYCGKsUJ+7S0f77++SytaoRIv36+vz2+L9MV/rw8Pbm5PXk4vXl5PXi5aQAFLtAUPHX1+7Pz8NYYdWJlL1HUqkOJLUvP7QsPNeOmPHZ2KYEGaoSJOO0tMpqb+CpqtB6haEADqwVJ7QsO6UCGKcHHaUDGaUCGaYDGqYGHKcGHKUBF6cHHqcGHaUDGqUDGP36+akNIdmTnKMAFMdkbKcHG7MrOqUCF9qXn/77+f79/rc3RMpsc7EkNPDU1fDU09+mrP77/Pz19PHY29SGkK8fL/La2bc1SLk4SbMoO9eQmvvz9Pv189ePleSys9ePmKUEGaUEGuGqsu7Rzt6jq810d7s/Ufz19u7R0evIx6kQJMxwfP35+vrw8u/T1Lg4RsBPWt2go7AgMvHa2fHa2q8fMfLZ29OFi////6oQJf///yH/C1hNUCBEYXRhWE1QPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgNS41LWMwMjEgNzkuMTU0OTExLCAyMDEzLzEwLzI5LTExOjQ3OjE2ICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIiB4bWxuczpzdFJlZj0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL3NUeXBlL1Jlc291cmNlUmVmIyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgQ0MgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOjVCQTk5RkU1N0EwNjExRTQ4MzBDQTFDREFENzI2Qjg2IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOjVCQTk5RkU2N0EwNjExRTQ4MzBDQTFDREFENzI2Qjg2Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6NUJBOTlGRTM3QTA2MTFFNDgzMENBMUNEQUQ3MjZCODYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6NUJBOTlGRTQ3QTA2MTFFNDgzMENBMUNEQUQ3MjZCODYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz4B//79/Pv6+fj39vX08/Lx8O/u7ezr6uno5+bl5OPi4eDf3t3c29rZ2NfW1dTT0tHQz87NzMvKycjHxsXEw8LBwL++vby7urm4t7a1tLOysbCvrq2sq6qpqKempaSjoqGgn56dnJuamZiXlpWUk5KRkI+OjYyLiomIh4aFhIOCgYB/fn18e3p5eHd2dXRzcnFwb25tbGtqaWhnZmVkY2JhYF9eXVxbWllYV1ZVVFNSUVBPTk1MS0pJSEdGRURDQkFAPz49PDs6OTg3NjU0MzIxMC8uLSwrKikoJyYlJCMiISAf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">`;
    let title=`<div class="is-right"><h4>${pupil.pn} ${pupil.sn} (Form ${pupil.fm})</h4></div><div class="is-right"><h4>${cycle.tt} ${cycle.ts} ${cycle.y}</h4></div>`;
    title+=`${cycle.txt}`;
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

table {
    font-size:1.2rem;
}

.report-information {
    display:flex;
    flex-direction:row;
    justify-content:space-between;
    width:100%;
    padding-bottom:0.25rem;
    padding-top:0.25rem;  
}

.report-information-left {
    display:flex;
    flex-direction:row;
    justify-content:start;
    width:100%;
    padding-bottom:0.25rem;
    padding-top:0.25rem;  
}

.statement-txt {
    background: white;
    padding:0.2rem;
    border-radius:0.5rem;
    font-size:1rem;
    
}

.report-txt {
    background: rgba(51,51,51,0.1);
    padding:0.2rem;
    border-radius:0.5rem;
    font-size:1.1rem;
    
}



.report-cell {
width:3rem;
text-align: center;
overflow:hidden;
padding:0.1rem;
font-weight:600;

}

  .assessment-title-c {
      position:absolute;
      top:6rem;
      width:10rem;
      height:4rem;
      border:0;
      overflow:hidden;
      font-size:1rem;
      transform: translate(-2rem,-3rem) rotate(-80deg);
      line-height:1rem;
  }



  .assessment-title-p {
    position:relative;
    width:3rem;
    height:10rem;
    border:0px solid #333;
    overflow:hidden;
  }

.bold {
    font-weight:600;

}

.small {
    font-size:1.2rem;
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


