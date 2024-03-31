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
        if ($alert.ms > 0 && msg) timeout = setTimeout(() => {
            $alert.msg='';
            $alert.type='';
        
        }, $alert.ms);
        
    };
    
    $:review($alert.msg);
    
    </script>
    {#if $alert.msg}
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <div 
            role="alert"
            class={`alert-container ${$alert.type==='error' ? 'error' :''}`}
            on:click={() => $alert.msg = ''} on:keydown={() => $alert.msg = ''}
      
            >
        <div class="alert-msg">{$alert.msg}</div>
        </div>

    {/if}
    
    <!--
    {#if $alert.msg}
    <div class={`${$alert.type}`} on:click={() => $alert.msg = ''} on:keydown={() => $alert.msg = ''}>
      <p>{ $alert.msg }</p>
    </div>
    {/if}  
    -->
      <style>

    /*
    --color-error: #d43939;
  --color-success: #28bd14;
  
    */

        .alert-container {
            position: fixed;
            cursor: pointer;
            display:flex;
            flex-direction:column;
            align-items: start;
            justify-content: center;
            background:#28bd14;
            color:#fff;
            margin-right:0;
            margin-top:0;
            right:0;
            top:0;
            min-width:30rem;
            z-index:100;
        }

        .error {
            background:#d43939;
        }

        .alert-msg {
            padding:1.5rem;
            border:0px solid #fff;
           
        }

        /*
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
        background-color: #565656;
        background:rgba(127,255,127,0.1);
        color: #fff;
        font-weight: 700;
        padding: 0.5rem 1.4rem;
        font-size: 1.5rem;
        z-index: 100;
        opacity: 95%;
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
      */
      </style>