<script>
    import { onMount} from 'svelte';

   
    /** @type {number}*/
    export let r;

    /** @type {string}*/
    export let std;

    const red='rgba(178,34,34,0.5)';
    const green='rgba(34,139,34,0.5)';
    const text='#333';
    const blue='#1E90FF88';
    const bg='#ddd';
    
    let x=0;

    let min=60;
    let max=140;
    let h=30;
    let w=50;

    let gmin=0;
    let gmax=9;


    </script>
    
    
        <svg width="5rem" height="2rem"xmlns="http://www.w3.org/2000/svg">
            <g>
              
              <rect x="0" y="12" width="50" height="8" fill={bg}></rect>
              <text x="0" y="10" font-size="10" font-weight="600" fill={text}>{String(Math.round(10*r)/10)}</text>
              {#if std==='GCSE'}

              <rect 
                x="0" 
                y="12" 
                width={w*r/gmax} 
                height="8" 
                fill={blue}></rect>



              {:else}


                {#if r>=100}
                    <rect 
                    x="0" 
                    y="12" 
                    width={w*(r-min)/(max-min)} 
                    height="8" 
                    fill={green}></rect>


                {:else}

                    <rect 
                    x="0" 
                    y="12" 
                    width={w*(r-min)/(max-min)} 
                    height="8" 
                    fill={red}></rect>


                {/if}



              {/if}


              <!--
              {#if result!==null}
                {#if std==="GCSE"}
                  <rect x="0" y="12" width={(w*(result<min?0:result>max ? (max-min) : min )/(max-min))} height="8" fill={config.colors.blue}></rect>
                {:else}
                  <rect x="0" y="12" width={(w*(result<min?0:result>max ? (max-min) : min )/(max-min))} height="8" fill={result<100 ? config.colors.red : config.colors.green }></rect>
                {/if}
              {/if}
              -->
            </g>
          </svg>
          
       
    
    <style>
    
    
    </style>