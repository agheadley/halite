<script>
/** @type {number}*/
export let reward;
/** @type {number}*/
export let sanction;

let xScale=1;


let r={r:178,g:34,b:34};
let g={r:34,g:139,b:34};

/** @type {{xg:number,yg:number,wg:number,hg:number,xr:number,yr:number,wr:number,hr:number}} */
let graph={xg:0,yg:0,wg:0,hg:10,xr:0,yr:10,wr:0,hr:10};

$: {
graph.wg=reward;
        
graph.wr = sanction;

graph.wg =  graph.wg*xScale > 70 ? 70 : graph.wg*xScale;
graph.wr =  graph.wr*xScale > 70 ? 70 : graph.wr*xScale; 
}

</script>

{reward}/{sanction}
<svg  width="7rem" height="2rem"xmlns="http://www.w3.org/2000/svg">
    <g >      
        <rect x={0} y={0} width={70} height={20} fill={'#eee'}></rect>
        <rect x={graph.xg} y={graph.yg} width={graph.wg} height={graph.hg} fill={`rgba(${g.r},${g.g},${g.b},0.5)`}></rect>
        <rect x={graph.xr} y={graph.yr} width={graph.wr} height={graph.hr} fill={`rgba(${r.r},${r.g},${r.b},0.5)`}></rect>  
    </g>
</svg>


<style>

</style>