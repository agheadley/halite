<script>
    /** @type {{gd:string,pre:number}[]}*/
    export let grades;
    /** @type {number} */
    export let score;
    
  
    
    /*
    type graph = {
        type:string,
        min:number,
        max:number,
    };
    */

    /**
     * 
     * @param {number} n
     * @returns {boolean}
     */
    function isNumeric(n) {
        return !isNaN(parseFloat(String(n))) && isFinite(n);
    }

    /** @type {any[]} */
    let points=[];
    
	let canvas;
    let ctx;

    let w=100;
    let h=80;
    let startY=15;
    let maxH=50;
    let labelY=70;
    
    let colorBG='#f4f4f4';

    let color1='rgba(0,128,255,0.5)';
    let color0='#333';

    let s=0;
    let u=0;

   
    /**
     * @param {number} x
     * @returns {number}
     */
    let getH=(x)=>{
        let h=0;
        if(s>0) h=Math.exp(-(x*x)/(2*s*s))*1/(2*Math.PI*s);
        //console.log(x,s,h);
        return h;
    };

    let getInfo=()=>{

        //console.log(score);

        grades=grades.map(el=>({gd:el.gd,pre:el.pre}));
        //console.log(grades);
        
        s=!!grades[0] ? grades[0].pre/5 : 0;
        //console.log(score,grades[0].pre,s);

        points=grades.sort((a,b)=> a.pre-b.pre);
        //console.log(points);

        let itemW= !!points[0] ? w/points.length : 0; 
      
        let datum=isNumeric(score) ? score : 0;
        //console.log(datum);
        for(let item of points) {
            item['residual']=datum>0 ? Math.abs(item.pre-datum) : 0 ;
            item['p']=getH(item['residual']);
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
        //console.log('Chances',points,datum);
      
    };

    
   $:  getInfo();
   
    

   
   

        
            
</script>

<!--{JSON.stringify(grades)} {JSON.stringify(score)} -->
<svg width="10rem" height="8rem" viewBox="0 0 100 80" xmlns="http://www.w3.org/2000/svg">
    <g>
        {#if score>0}
        {#each points as p}
            <rect x={p.x} y={p.y} width={p.w} height={p.h} fill={color1}></rect>
            {#if p.p>15}
                <text x={p.x} y={p.y-2} font-size="10" fill={color0}>{p.gd}</text>
            {/if}
        {/each}
        {/if}
    </g>
</svg>


<style>

</style>
