<script>

import {config} from '$lib/store';

/** @type {boolean}*/
export let color;
 /** @type {string} */
export let grade;
/** @type {string} */
export let base;
/** @type {{sc:string,pc:number,gd:string,scr:number,pre:number}[]}*/
export let grades;



let d=0;
let p=0;

let min=0.1;
let max=0.9;


let r={r:178,g:34,b:34};
let g={r:34,g:139,b:34};



$ : {
    grades=grades.sort((a,b)=>b.scr-a.scr);  
    let s1=grades.findIndex(el=>el.gd===base);
    let s2=grades.findIndex(el=>el.gd===grade);  
    d=s1-s2;
    color = !grades[0] || s1===-1 || s2===-1 ? false : color;
    p=grades[0] ? min+(max-min)*Math.abs(d)/grades.length : 0;   
};


</script>

{#if color}
{#if d<$config.rag.red}
    <div class="cell" style={`background:rgba(${r.r},${r.g},${r.b},${p})`}>
        <slot></slot>
    </div>
{:else if d>=$config.rag.green}
    <div class="cell" style={`background:rgba(${g.r},${g.g},${g.b},${p})`}>
        <slot></slot>
    </div>
{:else} 
<div class="cell">
    <slot></slot>
</div>
{/if}
{:else}
<div  class="cell">
<slot></slot>
</div>
{/if}



<style>


.cell {
    width:3rem;
    text-align: center;
    overflow:hidden;
    padding:0.1rem;
    
}


</style>