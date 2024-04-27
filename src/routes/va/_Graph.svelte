<script>

    /** @type {{examYear:number,n:number,v:number,s:number}} */
    export let data;

   
    let cfg = {
        colors:{bg2:'#bbb',bg3:'#ddd',red:'#B22222',green:'#228B22',text:'#333',line:'#888'},
        height:80,
        width:50,
        d:40,  
        max:3
    };

    let graph = {
        poly2:'',
        poly3:'',
        rect:{x:0,y:0,w:0,h:0,color:cfg.colors.text},
        text:{x:cfg.width/4,y:cfg.d-10,v:''},
        line:{x1:0,y1:0,x2:0,y2:0}

    };

   
    $ : {
            let h=data.n===0 ? 0 : cfg.d/(cfg.max*Math.sqrt(data.n));
            let midX=20;
            let dx=20;
            let midY=cfg.height/2;
            
            graph.line.x1=midX-dx;
            graph.line.y1=midY;
            graph.line.x2=midX+dx;
            graph.line.y2=midY;
            
            
            
            graph.poly3=`${midX-dx},${midY} ${midX},${midY-3*h} ${midX+dx},${midY} ${midX},${3*h+midY}`;
            graph.poly2=`${midX-dx},${midY} ${midX},${midY-2*h} ${midX+dx},${midY} ${midX},${2*h+midY}`;
            
            graph.rect.w=cfg.width/5;
            graph.rect.x=(cfg.width/2) - (cfg.width/5);
            graph.rect.h= Math.abs(data.v)>cfg.max? cfg.d : cfg.d*Math.abs(data.v)/cfg.max ;
            
            graph.rect.y = data.v < 0 ? cfg.d : cfg.d-graph.rect.h;
            graph.rect.color = data.s>0 ? data.v > 0 ? cfg.colors.green : cfg.colors.red  : cfg.colors.line;
            
            graph.text.x=cfg.width/4;
            graph.text.y= data.v > 0 ? cfg.d+20 : cfg.d-10;
            graph.text.v =data.s >0 ? `${Math.round(10*data.v)/10} (${data.s})` : `${Math.round(10*data.v)/10}`;

           
    };

    </script>
    
    <div>
        <svg width="5rem" height="8rem"  xmlns="http://www.w3.org/2000/svg">
                <g>
                    <polygon points={graph.poly3} fill={cfg.colors.bg3} stroke={'none'}/>
                    <polygon points={graph.poly2} stroke={'none'} fill={cfg.colors.bg2}/> 
                </g>
                <line x1={graph.line.x1} y1={graph.line.y1} x2={graph.line.x2} y2={graph.line.y2} stroke={cfg.colors.line}></line>
                <rect x={graph.rect.x} y={graph.rect.y} width={graph.rect.w} height={graph.rect.h} fill={graph.rect.color}></rect>             
                <text x={graph.text.x} y={graph.text.y} font-size="10" font-weight="500" fill={cfg.colors.text}>{graph.text.v}</text>     
          </svg>

    
    </div>
    
    <style>
    
    
    </style>