<script>

import {config} from '$lib/store';
/**
 * @typedef {{ci:number,title:string,type:'teacher'|'hod',sc:string,sl:string,ss:string,sal:string,tid:string,ec:string|null,ep:string|null,txt:string|null}} Report 
 * @type {{current:Report[],past:Report[]}}
 * */
export let data;

console.log(data);
</script>





<!-- reports-->
<div class="row">
    <div class="col">
        <table class="small">
            <tbody>
                {#each data.current as report,reportIndex}
                    <tr>
                        <td colspan=2>
                        {#if reportIndex==0}
                        <div class='flex-row'>
                            <div><span class="bold">{report.title}</span></div>
                            <div><span class="bold">{report.sl}</span></div>
                        </div>
                           
                        {/if}
                      
                        {#if report.txt!==null || report.ec!==null || report.ep!==null}


                        {#if report.type==='teacher'}
                        {#if report.txt!==null && report.txt!==''}
                        <div class="report-txt">
                            {report.txt}
                        </div>
                        {/if}
                        <div class="flex-row">
                            <div>{report.sal}</div>
                            <div>{report.tid}</div>
                            <div>EFFORT <span class="tag small">
                                {#if report.ec!==null ||  report.ep!==null}
                            
                                    {#if report.ec!==null}Class <span class="bold">{report.ec}</span>/{$config.report.e.list[0]}{/if}
                                    {#if report.ec!==null}Prep <span class="bold">{report.ep}</span>/{$config.report.e.list[0]}{/if}
                                {/if}
                              
                            </span></div>
                        </div>

                        {:else}
                       
                        {#if report.txt!==null && report.txt!==''}
                        <div class="report-txt">
                            {report.txt}
                        </div>
                        {/if}
                        <div class="flex-row">
                            <div>{report.sal}</div>
                            <div>{report.tid}</div>
                            <div>Head of Department</div>
                        </div>
                        
                        {/if}


                        {/if}
                       
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<div class="row">
    <div class="col">
        <details>
            <summary><span class="small bold">Previous Reports</span></summary>
            <div>
                <table class="small">
                    <tbody>
                        {#each data.past as report,reportIndex}
                    <tr>
                        <td colspan=2>
                        {#if reportIndex==0 || (reportIndex>0 && report.ci<data.past[reportIndex-1].ci)}
                            <div class='flex-row'>
                                <div><span class="bold">{report.title}</span></div>
                                <div><span class="bold">{report.sl}</span></div>
                            </div>
                        {/if}
                       
                        {#if report.txt!==null || report.ec!==null || report.ep!==null}


                        {#if report.type==='teacher'}
                        {#if report.txt!==null && report.txt!==''}
                        <div class="report-txt">
                            {report.txt}
                        </div>
                        {/if}
                        <div class="flex-row">
                            <div>{report.sal}</div>
                            <div>{report.tid}</div>
                            <div>EFFORT <span class="tag small">
                                {#if report.ec!==null ||  report.ep!==null}
                            
                                    {#if report.ec!==null}Class <span class="bold">{report.ec}</span>/{$config.report.e.list[0]}{/if}
                                    {#if report.ec!==null}Prep <span class="bold">{report.ep}</span>/{$config.report.e.list[0]}{/if}
                                {/if}
                              
                            </span></div>
                        </div>

                        {:else}
                       
                        {#if report.txt!==null  && report.txt!==''}
                        <div class="report-txt">
                            {report.txt}
                        </div>
                        {/if}
                        <div class="flex-row">
                            <div>{report.sal}</div>
                            <div>{report.tid}</div>
                            <div>Head of Department</div>
                        </div>
                        
                        {/if}


                        {/if}
                      
                        </td>
                    </tr>
                {/each}
                    </tbody>
                </table>
            </div>
        </details>
    </div>
</div>

<style>


.flex-row {
    display:flex;
    flex-direction:row;
    justify-content:space-between;
    width:100%;
    padding-bottom:0.25rem;
    padding-top:0.25rem;  
}

.report-txt {
    background: rgba(51,51,51,0.05);
    padding:0.2rem;
    border-radius:0.5rem;
   
}

.bold {
    font-weight:600;

}

.small {
    font-size:1.2rem;
}

</style>
