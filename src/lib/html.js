
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

	let tab='<td valign="top"><span class="bold">GRADES</span>&nbsp;&nbsp;</td>';
    for(let item of arr) {
        if(cfg.view.rag) {
            let p=min+(max-min)*Math.abs(item.r)/maxGrades;

            let sty='';
            if(item.r<cfg.rag.red) sty=`background:rgba(${r.r},${r.g},${r.b},${p})`;
            else if(item.r>=cfg.rag.green) sty=`background:rgba(${g.r},${g.g},${g.b},${p})`;

                tab+=`<td valign="top"><div><span class="small">${item.ds}</span></div><div class="report-cell" style="${sty}">${item.gd}</div></td>`;
           
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
	
    txt+=`<div class="statement-txt">${subject.statement}</div>`;
	for(let item of subject.report) {
		if(item.txt!==null && item.txt!=='') {
				txt+=`<div class="report-txt">${item.txt}</div>`;
		}
        item.ec = item.ec===null ? '' : `CLASS ${item.ec}`;
        item.ep = item.ep===null ? '' : `PREP ${item.ep}`;
        
		txt+=`<div class="report-information"><div>${item.sal}</div><div><span class="bold">EFFORT</span> ${item.ec} ${item.ep}</div></div>`;
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

    let image=`<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH4AAAAsCAMAAACUu/xGAAAAq1BMVEUAAABlZVJlZVKsrJthYU+zs6Grq5ylpZazs6FlZVJfX01lZVJlZVKsrJurq5urq5xlZVKtrZ1lZVJlZVKvr52zs6GysqCoqJeqqpmzs6Grq5xlZVJgYE6zs6Gnp5mrq5yiopRjY1CRkX2rq5yzs6FlZVKRkX2goJKKineRkX2Pj3yrq5yIiHWRkX2RkX2RkX1lZVKRkX2rq5yzs6GoqJdfX02goJKHh3SHh3VrpzVsAAAAMHRSTlMAQIDHx3+Ax0Ag7qBgIA9AEFCPMLOgMO7bYKBQ24+zYNuzkY9wcAXu0oiocPFBMHYlVbK0AAAD3UlEQVRYw6SW7Y6qMBCGB0IkLfKdnB9ocFmjru7HERL03P+VnXY6bdmWjcF9f2inxjydvjMDcHy99zP693oEpTpQYjBR7W4VmzA81GoZCDn/ycrValVmYOJcKBWL1/4HnUEpupLGxOI47iQmDkfc4GEBEFyNQkClzYDKQQs3VmJBufu6G7zRWNMeUzEHUnLVWs/gy9vg4NNB4wUIPOG2h7e8NcV0HRt7QPDxfzTd4ptleB5F6ro3NtsIc7UnjMKKXyuN30ZS+PuLRMW7PN+l2vlhAZ6yqCZmcrm05stfOrwVpvEBaJWStIOpVk/gC8Rb62tjRj25Fx/fEsgqE27cluKB8GR9hDFzeX44CFbmJb9/Cn8w1ldA5tO9VD/gc8FpveTbxfi1LXWOl10Z80c0Yx7/jpyyjRtd9zuxU8ZL8FEYJjZFpg6yIfOpKsf1FJ+EUkzddKkabQ+o0zCcwMN/vZm+uLh4UmW7nptTCBVq5nUF4Y0CgBaNVip18jsPn370909cfX708/gusF3fkQfrKZHXHh45Wi8meRefvfVCfwGOZ9zx8TZ9TjWY2M6vVf4jm8e3WYrDJ1Vj4N3FHwVd6vKFCxefBMFmq7ub6UI7TMZw0SEv8ryPDVaoxPiWufhL/02zY0cm3ZH1VgxIIYa1U/nIibH/EZjjp4M/9w/x9FijbyuqdzOVH+BbWQJxHMupd4pjINhDPKVH1lslBl9g6OKb73j0wmoBHrMj691nsJ0QLn4l0/09nrIm6wv7nGdQqwjGucvPJSWjN4z8aXyBlkfK+i2gmDI/HENGjXA9uPhsUJ22p2OQFg3daaFx0/9qnWBRbOl9hHlvOw3OW/xs4Hf4rcnYzj+OeFOIHj4dtG7/2y+b3IhBGAqjUiQWQ9JI/ErDpop6gcei9z9ZIXHIhLaLSGRW8zYxIuaTZccxqsGfHDXvH4cf37Z4e3ihxVOTp5bf4E8N2u+3PWB2SP7tXsfsFl80rtOeZX/gvz6//7tmnFFzD2mkxnFgL710ToHH1eCcm/LU2aA9m027v+kBH8ipyHbACxAMWaV5I4v2ZgAzIxkUGXIqkn3xrhw4wVe8hoMmOwBmYJMiJy+lHPriNcSyrvgEgUS2h/vl1BcvSqgcZsPbbABrhgdgvhgvS6hIYsPP8MwTVR5SLZA4573xHMpCV7xGZBFmxyProfR64yNCgKh4hygjXIuvpdcbPyEayA2vsEpRHcgl6gtzr8A9ho0RlgQnBPoK4tV45gBfGQZ6KQBDqzRcjdeAqQwHUfYp+SohcQdc1/Ukm4Gw4dV6vqTkM+uQpRv8E2VPF/sPp9xSb2qlGH4AAAAASUVORK5CYII=">`;
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
    background: white;
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
