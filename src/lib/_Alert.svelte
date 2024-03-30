<script>
    import { alert } from "$lib/store";
    /** @type {any}*/
    let timeout;
    
    /**
     * 
     * @param {string} msg 
     */
    let review=(msg)=>{
        clearTimeout(timeout);
        if ($alert.ms > 0 && msg) timeout = setTimeout(() => ($alert.msg=''), $alert.ms);
    };
    
    $:review($alert.msg);
    
    </script>
    
    
    
    
    {#if $alert.msg}
    <div class={`${$alert.type}`} on:click={() => $alert.msg = ''} on:keydown={() => $alert.msg = ''}>
      <p>{ $alert.msg }</p>
    </div>
    {/if}  
      
      <style>
      div {
        position: fixed;
        cursor: pointer;
        margin-right: 0rem;
        margin-left: 0rem;
        margin-top: 0rem;
        right: 0;
        display: flex;
        align-items: start;
        border-radius: 0.2rem;
        /*background-color: #565656;*/
        background:rgba(127,255,127,0.1);
        color: #fff;
        /*font-weight: 700;*/
        padding: 0.5rem 1.4rem;
        font-size: 1.5rem;
        z-index: 100;
        /*opacity: 95%;*/
        width:30rem;
        height:10rem;
        overflow:hidden;
      }
      div p {
        color: #fff;
      }
    
      .success {
        background:#28bd14;
      }
    
      .error {
        background:#d43939;
      }
      </style>