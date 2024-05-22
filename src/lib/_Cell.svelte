<script>

    import {config} from '$lib/store';
    
    /** @type {boolean}*/
    export let color;
 
    /** @type {number} */
    export let residual;
 
    
    
    
    let d=0;
    let s1=0;
    let s2=0;
    let p=0;
    
    let min=0.1;
    let max=0.9;
    
    let maxGrades=10;
    
    let r={r:178,g:34,b:34};
    let g={r:34,g:139,b:34};
    
    
    
    $ : {

       
        p=min+(max-min)*Math.abs(residual)/maxGrades;  
    };
    
    
    </script>
    <!--{d} {s1} {base} {s2} {grade}-->
    {#if color}
    {#if residual<$config.rag.red}
        <div class="cell" style={`background:rgba(${r.r},${r.g},${r.b},${p})`}>
            <slot></slot>
        </div>
    {:else if residual>=$config.rag.green}
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