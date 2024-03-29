<script>

    /** @type {{type:string,score:number}}*/

    /** @type {number}*/
    export let result;

    /** @type {string}*/
    export let std;

    let config = {
        colors:{white:'#fff',bg:'#bbb',red:'rgba(178,34,34,0.5)',green:'rgba(34,139,34,0.5)',text:'#333',blue:'#1E90FF88'},
        max:140,
        min:60,
        height:30,
        width:50

    };

    let x=0;

    

    if(std==='GCSE') {
      config.max=9;
      config.min=0;
    }

    

  
    

    let score = result<config.min ? 0 : result>config.max ? (config.max-config.min) : result-config.min;
    x = config.width*score / (config.max-config.min);

    
    </script>
    
    
        <svg width="5rem" height="2rem"xmlns="http://www.w3.org/2000/svg">
            <g>
              
              <rect x="0" y="12" width="80" height="8" fill={config.colors.bg}></rect>
              {#if result!==null}
                {#if std==="GCSE"}
                  <rect x="0" y="12" width={x} height="8" fill={config.colors.blue}></rect>
                {:else}
                  <rect x="0" y="12" width={x} height="8" fill={result<100 ? config.colors.red : config.colors.green }></rect>
                {/if}
                <text x="0" y="10" font-size="10" font-weight="600" fill={config.colors.text}>{String(Math.round(10*result)/10)}</text>
              {/if}
            </g>
          </svg>
       
    
    
    <style>
    
    
    </style>